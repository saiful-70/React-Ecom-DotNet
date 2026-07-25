import { NextRequest, NextResponse } from "next/server";
import { sendMetaCapiEvent } from "@/lib/analytics/meta-capi";
import {
  createSlidingWindowRateLimiter,
  getClientIp,
  isSameOriginRequest,
} from "@/lib/analytics/route-guards";

type IncomingEvent = {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  customData?: Record<string, unknown>;
  user?: {
    email?: string | null;
    phone?: string | null;
    externalId?: string | null;
  };
};

// Only forward events the frontend actually emits via `sendCapi()`
// (see app/lib/analytics/index.ts). Anything else is rejected.
const ALLOWED_EVENT_NAMES = new Set([
  "Purchase",
  "AddToCart",
  "ViewContent",
  "InitiateCheckout",
]);

// Per-instance in-memory sliding-window rate limit. This is a partial control
// only: behind a load balancer with multiple instances, each instance tracks
// its own counters, so the effective limit scales with instance count. A
// shared store (e.g. Redis) would be needed for a hard global cap.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const rateLimiter = createSlidingWindowRateLimiter(RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS);

export async function POST(req: NextRequest) {
  // 1. Same-origin check — reject relayed/cross-site calls before doing any work.
  if (!isSameOriginRequest(req)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  let body: IncomingEvent;
  try {
    body = (await req.json()) as IncomingEvent;
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.eventName || !body?.eventId) {
    return NextResponse.json(
      { success: false, error: "eventName and eventId are required" },
      { status: 400 }
    );
  }

  // 2. eventName allowlist — only forward known, frontend-emitted event types.
  if (!ALLOWED_EVENT_NAMES.has(body.eventName)) {
    return NextResponse.json(
      { success: false, error: "Unsupported eventName" },
      { status: 400 }
    );
  }

  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") || null;

  // 3. Rate limit — sliding window per client IP.
  if (ip && rateLimiter.isLimited(ip)) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      { status: 429 }
    );
  }

  const fbp = req.cookies.get("_fbp")?.value || null;
  const fbc = req.cookies.get("_fbc")?.value || null;

  const result = await sendMetaCapiEvent({
    eventName: body.eventName,
    eventId: body.eventId,
    eventSourceUrl: body.eventSourceUrl,
    customData: body.customData,
    userData: {
      email: body.user?.email,
      phone: body.user?.phone,
      externalId: body.user?.externalId,
      ip,
      userAgent,
      fbp,
      fbc,
    },
  });

  if (!result.success) {
    return NextResponse.json(result, { status: 502 });
  }
  return NextResponse.json({ success: true });
}
