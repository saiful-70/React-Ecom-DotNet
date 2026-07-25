/**
 * Browser-only, consent-gated, fire-and-forget tracker for backend browser
 * analytics events (PageView, ScrollDepth, ExitPage, BannerClick, etc.).
 *
 * Posts to our own same-origin proxy route (app/api/tracking/route.ts),
 * which forwards to the backend's POST /api/tracking. Never posts to the
 * backend directly — see app/api/tracking/route.ts for why.
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

const COOKIE_CONSENT_STORAGE_KEY = "debuggermind-cookie-consent";
const UTM_STORAGE_KEY = "utm_params";

type StoredCookieConsent = {
  consentGiven?: boolean;
  analytics?: boolean;
};

type StoredUtmParams = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
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

export async function trackEvent(
  eventName: BrowserEventName,
  data?: Record<string, unknown>
): Promise<{ success: boolean }> {
  if (typeof window === "undefined") return { success: false };

  // Consent gate — resolve without firing if analytics consent isn't given.
  if (!hasAnalyticsConsent()) return { success: false };

  const utm = getUtmParams();

  const payload = {
    eventName,
    data,
    pageUrl: window.location.href,
    pageTitle: document.title,
    referrer: document.referrer || undefined,
    screenResolution: window.screen
      ? `${window.screen.width}x${window.screen.height}`
      : undefined,
    language: navigator.language,
    ...utm,
  };

  // Fire-and-forget. keepalive lets the request survive navigation
  // (mirrors sendCapi in app/lib/analytics/index.ts).
  return fetch("/api/tracking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
    credentials: "same-origin",
  })
    .then((r) => r.json())
    .catch(() => ({ success: false }));
}

export const trackPageView = (route: string) => trackEvent("PageView", { route });

export const trackScrollDepth = (percentage: number) =>
  trackEvent("ScrollDepth", { percentage });

export const trackExitPage = (nextUrl?: string) => trackEvent("ExitPage", { nextUrl });

export const trackTimeOnPage = (seconds: number) => trackEvent("TimeOnPage", { seconds });

export const trackBannerClick = (data: { bannerId?: number | string; bannerName?: string }) =>
  trackEvent("BannerClick", data);

export const trackMenuClick = (data: { menuId?: string; menuName?: string }) =>
  trackEvent("MenuClick", data);

export const trackPromotionClick = (data: { promotionId?: number | string; code?: string }) =>
  trackEvent("PromotionClick", data);

export const trackFilterChanged = (filter: string, value: string) =>
  trackEvent("FilterChanged", { filter, value });

export const trackSortChanged = (sort: string) => trackEvent("SortChanged", { sort });

export const trackShare = (channel: string, url?: string) =>
  trackEvent("Share", { channel, url });

export const trackCustomEvent = (name: string, extra?: Record<string, unknown>) =>
  trackEvent("CustomEvent", { name, ...extra });
