import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/lib/config/api.config";
import { AUTH_TOKEN_COOKIE_NAME } from "@/lib/config/auth.config";
import { getCookieConfig } from "@/lib/config/server.config";
import {
  createSlidingWindowRateLimiter,
  getClientIp,
  isSameOriginRequest,
} from "@/lib/analytics/route-guards";

// Backend browser-analytics endpoint lives under /api, not /api/v1.
// Derive it from the V1 base to avoid env ambiguity:
// {origin}/api/v1 -> {origin}/api -> {origin}/api/tracking
const TRACKING_URL = API_CONFIG.API_BASE_URL_V1.replace(/\/v1\/?$/, "") + "/tracking";

type IncomingTrackingEvent = {
  eventName: string;
  // Client-generated GUID so the backend can de-duplicate retries from the
  // offline queue (Frontend Tracking Integration Guide v3.0).
  eventId?: string;
  data?: Record<string, unknown>;
  pageUrl?: string;
  pageTitle?: string;
  referrer?: string;
  screenResolution?: string;
  language?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  // Meta browser/click ids read from the _fbp/_fbc cookies.
  fbp?: string;
  fbc?: string;
};

// Only forward events the frontend actually emits via `trackEvent()`
// (see app/lib/analytics/tracking.ts). Anything else is rejected.
const ALLOWED_BROWSER_EVENTS = new Set([
  "BannerClick",
  "MenuClick",
  "PromotionClick",
  "ScrollDepth",
  "TimeOnPage",
  "ExitPage",
  "FilterChanged",
  "SortChanged",
  "VideoPlay",
  "VideoPause",
  "VideoCompleted",
  "FileDownload",
  "Share",
  "PageView",
  "CustomEvent",
]);

// Per-instance in-memory sliding-window rate limit. This is a partial control
// only: behind a load balancer with multiple instances, each instance tracks
// its own counters, so the effective limit scales with instance count. A
// shared store (e.g. Redis) would be needed for a hard global cap.
// Budget per page view is roughly 1 PageView + up to 4 ScrollDepth + 2
// TimeOnPage heartbeats, before any filter/sort/menu interaction. 30/min
// throttled ordinary browsing; 120 leaves headroom for a fast browser while
// still capping abuse. Shared-IP traffic (office NAT, mobile carriers) is
// still counted collectively — see the note on the limiter below.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 120;
const rateLimiter = createSlidingWindowRateLimiter(RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS);

const IS_PRODUCTION = API_CONFIG.NODE_ENV === "production";

// An ASP.NET developer-exception page or HTML error page can run to tens of KB.
// Keep enough to identify the exception without flooding the server log.
const MAX_LOGGED_BODY_CHARS = 1000;

function truncateForLog(text: string): string {
  const collapsed = text.trim();
  if (collapsed.length <= MAX_LOGGED_BODY_CHARS) return collapsed;
  return `${collapsed.slice(0, MAX_LOGGED_BODY_CHARS)}… (${collapsed.length} chars total)`;
}

/**
 * Parse a Set-Cookie header string into { name, value, maxAge?, expires? }.
 * Only used for cookies we already filtered to `_analytics_*`.
 */
function parseSetCookie(
  setCookie: string
): { name: string; value: string; maxAge?: number; expires?: Date } | null {
  const [nameValue, ...attrParts] = setCookie.split(";");
  const eqIndex = nameValue.indexOf("=");
  if (eqIndex === -1) return null;

  const name = nameValue.slice(0, eqIndex).trim();
  const value = nameValue.slice(eqIndex + 1).trim();
  if (!name) return null;

  let maxAge: number | undefined;
  let expires: Date | undefined;

  for (const rawAttr of attrParts) {
    const attr = rawAttr.trim();
    const [attrName, ...attrValueParts] = attr.split("=");
    const attrValue = attrValueParts.join("=").trim();
    const lowerAttrName = attrName.trim().toLowerCase();

    if (lowerAttrName === "max-age") {
      const parsed = Number(attrValue);
      if (!Number.isNaN(parsed)) maxAge = parsed;
    } else if (lowerAttrName === "expires") {
      const parsedDate = new Date(attrValue);
      if (!Number.isNaN(parsedDate.getTime())) expires = parsedDate;
    }
  }

  return { name, value, maxAge, expires };
}

function getBackendSetCookies(headers: Headers): string[] {
  // Standard fetch Headers doesn't expose multiple Set-Cookie values via
  // .get(); Undici's Headers has getSetCookie() for that. Feature-detect
  // since it's not in the lib.dom typings for all TS/runtime combinations.
  const maybeGetSetCookie = (headers as Headers & { getSetCookie?: () => string[] })
    .getSetCookie;
  return typeof maybeGetSetCookie === "function" ? maybeGetSetCookie.call(headers) : [];
}

export async function POST(req: NextRequest) {
  // 1. Same-origin check — reject relayed/cross-site calls before doing any work.
  if (!isSameOriginRequest(req)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  let body: IncomingTrackingEvent;
  try {
    body = (await req.json()) as IncomingTrackingEvent;
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.eventName) {
    return NextResponse.json(
      { success: false, error: "eventName is required" },
      { status: 400 }
    );
  }

  // 2. eventName allowlist — only forward known, frontend-emitted event types.
  if (!ALLOWED_BROWSER_EVENTS.has(body.eventName)) {
    return NextResponse.json(
      { success: false, error: "Unsupported eventName" },
      { status: 400 }
    );
  }

  const ip = getClientIp(req);

  // 3. Rate limit — sliding window per client IP.
  if (ip && rateLimiter.isLimited(ip)) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      { status: 429 }
    );
  }

  const userAgent = req.headers.get("user-agent") || "";
  const token = req.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value;

  // Forward only our own first-party analytics cookies (visitor/session
  // identifiers). Never forward the auth token cookie as a plain cookie —
  // it's forwarded as a Bearer token instead.
  const analyticsCookieHeader = req.cookies
    .getAll()
    .filter((cookie) => cookie.name.startsWith("_analytics_"))
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": userAgent,
  };
  if (ip) headers["X-Forwarded-For"] = ip;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (analyticsCookieHeader) headers["Cookie"] = analyticsCookieHeader;

  try {
    const backendResponse = await fetch(TRACKING_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });

    // Read the body as text first. On a backend error it's often a plain-text
    // stack trace or an HTML error page, and `.json()` would throw and discard
    // it — which is how a backend 500 used to surface as a bare
    // `{ success: false }` with no clue what actually went wrong.
    const rawBody = await backendResponse.text();

    let backendJson: unknown;
    try {
      backendJson = JSON.parse(rawBody);
    } catch {
      backendJson = { success: backendResponse.ok };
    }

    if (!backendResponse.ok) {
      console.error(
        `[tracking] backend rejected ${body.eventName}: POST ${TRACKING_URL} -> ` +
          `${backendResponse.status} ${backendResponse.statusText}\n` +
          `  content-type: ${backendResponse.headers.get("content-type") || "(none)"}\n` +
          `  body: ${truncateForLog(rawBody) || "(empty)"}`
      );
    }

    // Surface the backend's own error to the browser in development only —
    // upstream traces can name internal assemblies and file paths, so they must
    // never reach a production client.
    const clientPayload =
      backendResponse.ok || IS_PRODUCTION
        ? backendJson
        : {
            success: false,
            message: "backend rejected the event (see server console)",
            backendStatus: backendResponse.status,
            backendError: truncateForLog(rawBody) || null,
          };

    const nextResponse = NextResponse.json(clientPayload, {
      status: backendResponse.status,
    });

    // 6. Relay only our first-party visitor/session cookies, re-homed to
    // this app's domain (drop the backend's own Domain attribute).
    for (const setCookie of getBackendSetCookies(backendResponse.headers)) {
      const parsed = parseSetCookie(setCookie);
      if (!parsed || !parsed.name.startsWith("_analytics_")) continue;

      nextResponse.cookies.set(
        parsed.name,
        parsed.value,
        getCookieConfig({
          httpOnly: true,
          ...(parsed.maxAge !== undefined ? { maxAge: parsed.maxAge } : {}),
          ...(parsed.expires !== undefined ? { expires: parsed.expires } : {}),
        })
      );
    }

    return nextResponse;
  } catch (error) {
    // Network failure — never throw to the caller; the client's keepalive
    // fetch should always resolve cleanly. Log it, though: an unreachable
    // backend is otherwise indistinguishable from tracking working fine.
    console.error(
      `[tracking] backend unreachable: POST ${TRACKING_URL}`,
      error instanceof Error ? `${error.name}: ${error.message}` : error
    );
    return NextResponse.json(
      { success: false, message: "tracking unavailable" },
      { status: 200 }
    );
  }
}
