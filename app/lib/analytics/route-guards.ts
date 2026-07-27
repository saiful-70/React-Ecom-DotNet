import { NextRequest } from "next/server";
import { API_CONFIG } from "@/lib/config/api.config";

/**
 * Shared guards for same-origin, server-side analytics proxy routes
 * (app/api/meta-capi/route.ts, app/api/tracking/route.ts). Keep the
 * behavior identical across both — this is the single source of truth.
 */

function getAllowedHost(): string | null {
  try {
    return new URL(API_CONFIG.SITE_URL).host;
  } catch {
    return null;
  }
}

/**
 * Reject relayed/cross-site calls — only accept requests whose Origin
 * (falling back to Referer) matches our own site host.
 */
export function isSameOriginRequest(req: NextRequest): boolean {
  const allowedHost = getAllowedHost();
  if (!allowedHost) return false;

  const source = req.headers.get("origin") || req.headers.get("referer");
  if (!source) return false;

  try {
    return new URL(source).host === allowedHost;
  } catch {
    return false;
  }
}

/**
 * Best-effort client IP: first hop of X-Forwarded-For, else X-Real-Ip.
 */
export function getClientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null;
}

/**
 * Per-instance in-memory sliding-window rate limiter. This is a partial
 * control only: behind a load balancer with multiple instances, each
 * instance tracks its own counters, so the effective limit scales with
 * instance count. A shared store (e.g. Redis) would be needed for a hard
 * global cap.
 */
export function createSlidingWindowRateLimiter(windowMs: number, max: number) {
  const requestTimestampsByIp = new Map<string, number[]>();

  return {
    isLimited(ip: string): boolean {
      const now = Date.now();
      const windowStart = now - windowMs;
      const recent = (requestTimestampsByIp.get(ip) || []).filter((t) => t > windowStart);
      recent.push(now);
      requestTimestampsByIp.set(ip, recent);
      return recent.length > max;
    },
  };
}
