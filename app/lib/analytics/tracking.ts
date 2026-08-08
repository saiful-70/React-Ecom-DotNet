/**
 * Browser-only, consent-gated, fire-and-forget tracker for backend browser
 * analytics events (PageView, ScrollDepth, ExitPage, BannerClick, etc.).
 *
 * Posts to our own same-origin proxy route (app/api/tracking/route.ts),
 * which forwards to the backend's POST /api/tracking. Never posts to the
 * backend directly — see app/api/tracking/route.ts for why.
 *
 * Implements the envelope from the Frontend Tracking Integration Guide v3.0:
 * eventId (idempotency across retries), fbp/fbc Meta cookies, UTM attribution,
 * sendBeacon on page exit, and a localStorage retry queue for events that were
 * dropped while offline.
 */

export type BrowserEventName =
  | "BannerClick"
  | "MenuClick"
  | "PromotionClick"
  | "ScrollDepth"
  | "TimeOnPage"
  | "ExitPage"
  | "FilterChanged"
  | "SortChanged"
  | "VideoPlay"
  | "VideoPause"
  | "VideoCompleted"
  | "FileDownload"
  | "Share"
  | "PageView"
  | "CustomEvent";

const TRACKING_ENDPOINT = "/api/tracking";
const COOKIE_CONSENT_STORAGE_KEY = "debuggermind-cookie-consent";
const UTM_STORAGE_KEY = "utm_params";
const OFFLINE_QUEUE_STORAGE_KEY = "debuggermind-tracking-queue";

// Cap the retry queue so a long offline stretch can't grow localStorage
// without bound. Oldest events are dropped first.
const OFFLINE_QUEUE_MAX_EVENTS = 50;

type StoredCookieConsent = {
  consentGiven?: boolean;
  analytics?: boolean;
};

export type StoredUtmParams = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

type TrackingPayload = {
  eventName: BrowserEventName;
  eventId: string;
  data?: Record<string, unknown>;
  pageUrl?: string;
  pageTitle?: string;
  referrer?: string;
  screenResolution?: string;
  language?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  fbp?: string;
  fbc?: string;
};

/**
 * GDPR gate: no tracking without explicit analytics consent. Returns false
 * on SSR or any parse failure (fail closed).
 */
export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as StoredCookieConsent;
    return !!(parsed?.consentGiven && parsed?.analytics);
  } catch {
    return false;
  }
}

function getUtmParams(): StoredUtmParams {
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoredUtmParams;
    return {
      utmSource: parsed?.utmSource,
      utmMedium: parsed?.utmMedium,
      utmCampaign: parsed?.utmCampaign,
    };
  } catch {
    return {};
  }
}

/**
 * Persist UTM params for the rest of the session. Called once per load by
 * `UtmCapture`; only writes when the URL actually carries a utm_source so a
 * later internal navigation can't wipe the original attribution.
 */
export function captureUtmParams(search: string): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(search);
    const utmSource = params.get("utm_source");
    if (!utmSource) return;

    const captured: StoredUtmParams = {
      utmSource,
      utmMedium: params.get("utm_medium") || undefined,
      utmCampaign: params.get("utm_campaign") || undefined,
    };
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(captured));
  } catch {
    // sessionStorage can throw in private-mode / quota-exceeded cases.
    // Attribution is best-effort; never break the page over it.
  }
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

function generateEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function buildPayload(
  eventName: BrowserEventName,
  data?: Record<string, unknown>
): TrackingPayload {
  return {
    eventName,
    eventId: generateEventId(),
    data,
    pageUrl: window.location.href,
    pageTitle: document.title,
    referrer: document.referrer || undefined,
    screenResolution: window.screen
      ? `${window.screen.width}x${window.screen.height}`
      : undefined,
    language: navigator.language,
    ...getUtmParams(),
    // Meta click/browser ids, when the Pixel has set them. Improves match
    // quality for the backend's outbound conversion integrations.
    fbp: readCookie("_fbp"),
    fbc: readCookie("_fbc"),
  };
}

/* -------------------------------------------------------------------------- */
/* Offline retry queue                                                        */
/* -------------------------------------------------------------------------- */

function readQueue(): TrackingPayload[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TrackingPayload[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(events: TrackingPayload[]): void {
  try {
    if (events.length === 0) {
      localStorage.removeItem(OFFLINE_QUEUE_STORAGE_KEY);
      return;
    }
    localStorage.setItem(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(events));
  } catch {
    // Quota or private mode — drop the queue rather than throw.
  }
}

function enqueue(payload: TrackingPayload): void {
  const queued = readQueue();
  queued.push(payload);
  // Keep the newest N; an overflowing queue means the oldest events are the
  // least useful anyway.
  writeQueue(queued.slice(-OFFLINE_QUEUE_MAX_EVENTS));
}

/**
 * Replay queued events. Called on load and whenever the browser comes back
 * online. Events that fail again are re-queued by `post()`.
 */
export async function flushQueuedEvents(): Promise<void> {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;

  const queued = readQueue();
  if (queued.length === 0) return;

  // Clear first so a failure during replay re-queues via post() instead of
  // duplicating events already in the queue.
  writeQueue([]);
  for (const payload of queued) {
    await post(payload, { allowQueue: true });
  }
}

/* -------------------------------------------------------------------------- */
/* Delivery                                                                   */
/* -------------------------------------------------------------------------- */

async function post(
  payload: TrackingPayload,
  options?: { allowQueue?: boolean }
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(TRACKING_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
      credentials: "same-origin",
    });

    // Any HTTP response means we reached the server, so the event is not
    // "offline" — don't queue it. A 4xx never becomes valid on retry, and
    // queueing 5xx would amplify a backend outage: each page load would
    // replay the whole queue and burn through the proxy's rate limit.
    // Retries are reserved for genuine network failures (the catch below).
    if (!response.ok) return { success: false };

    const json = (await response.json()) as { success?: boolean };
    return { success: !!json?.success };
  } catch {
    // Offline / aborted. Keep it for the next flush.
    if (options?.allowQueue !== false) enqueue(payload);
    return { success: false };
  }
}

export async function trackEvent(
  eventName: BrowserEventName,
  data?: Record<string, unknown>
): Promise<{ success: boolean }> {
  if (typeof window === "undefined") return { success: false };

  // Consent gate — resolve without firing if analytics consent isn't given.
  if (!hasAnalyticsConsent()) return { success: false };

  return post(buildPayload(eventName, data));
}

/**
 * Exit-path delivery. `sendBeacon` is the only transport the browser is
 * obliged to finish after the document starts unloading; a `keepalive` fetch
 * is best-effort and gets cancelled in practice on mobile Safari. Falls back
 * to `trackEvent` when Beacon is unavailable or refuses the payload.
 */
export function trackEventOnExit(
  eventName: BrowserEventName,
  data?: Record<string, unknown>
): void {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;

  const payload = buildPayload(eventName, data);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    try {
      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      // Returns false when the payload exceeds the UA's beacon queue budget.
      if (navigator.sendBeacon(TRACKING_ENDPOINT, blob)) return;
    } catch {
      // Fall through to fetch.
    }
  }

  void post(payload);
}

/* -------------------------------------------------------------------------- */
/* Per-event helpers (one per row of the guide's browser-event table)         */
/* -------------------------------------------------------------------------- */

export const trackPageView = (route: string) => trackEvent("PageView", { route });

export const trackScrollDepth = (percentage: number) =>
  trackEvent("ScrollDepth", { percentage });

export const trackTimeOnPage = (seconds: number) => trackEvent("TimeOnPage", { seconds });

/** Exit events must use the beacon transport — the document is going away. */
export const trackExitPage = (nextUrl?: string) =>
  trackEventOnExit("ExitPage", nextUrl ? { nextUrl } : undefined);

export const trackTimeOnPageOnExit = (seconds: number) =>
  trackEventOnExit("TimeOnPage", { seconds });

export const trackBannerClick = (data: {
  bannerId?: number | string;
  bannerName?: string;
}) => trackEvent("BannerClick", data);

export const trackMenuClick = (data: { menuId?: string; menuName?: string }) =>
  trackEvent("MenuClick", data);

export const trackPromotionClick = (data: {
  promotionId?: number | string;
  code?: string;
}) => trackEvent("PromotionClick", data);

export const trackFilterChanged = (filter: string, value: string) =>
  trackEvent("FilterChanged", { filter, value });

export const trackSortChanged = (sort: string) => trackEvent("SortChanged", { sort });

export const trackVideoPlay = (data: { videoId: string; title?: string }) =>
  trackEvent("VideoPlay", data);

export const trackVideoPause = (data: { videoId: string; title?: string }) =>
  trackEvent("VideoPause", data);

export const trackVideoCompleted = (data: { videoId: string; title?: string }) =>
  trackEvent("VideoCompleted", data);

export const trackFileDownload = (data: { fileId?: string; fileName: string }) =>
  trackEvent("FileDownload", data);

export const trackShare = (channel: string, url?: string) =>
  trackEvent("Share", { channel, url });

export const trackCustomEvent = (name: string, extra?: Record<string, unknown>) =>
  trackEvent("CustomEvent", { name, ...extra });
