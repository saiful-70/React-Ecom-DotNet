// API Configuration
import { API_CONFIG } from "@/lib/config/api.config";
import { AUTH_TOKEN_COOKIE_NAME } from "@/lib/config/auth.config";
import { getCookieConfig } from "@/lib/config/server.config";
import {
  DEFAULT_VARIANT_ID,
  PINNED_VARIANT_ID,
  VARIANT_HEADER,
} from "@/lib/config/variant.config";
import {
  getWebsiteKey,
  HAS_ANY_WEBSITE_KEY,
  isWebsiteKeyRejection,
  WEBSITE_KEY_HEADER,
} from "@/lib/config/website.config";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { isTokenExpired, shouldRefreshToken } from "@/lib/utils/security.utils";
import { cookies, headers } from "next/headers";

// Cookies the backend sets for its server-side visitor/session analytics
// (see the backend "Analytics Integration Guide"). They are HttpOnly and
// browser-scoped: the browser must carry them on every request so the backend
// recognises returning visitors/sessions. Because this app talks to the
// backend server-side (not browser→backend directly), the ApiClient acts as a
// transparent proxy — forwarding the browser's cookies up and relaying these
// analytics cookies back down. We only re-home cookies under this prefix so we
// never interfere with the app's own auth cookie (`__token__`).
const ANALYTICS_COOKIE_PREFIX = "_analytics_";
// Type-only import — erased at compile time, so it does not reintroduce the
// runtime circular dependency that the dynamic `import()` below avoids.
import type { AuthUserResponseModel } from "@/(app-routes)/(auth)/model";

// Module-level single-flight guard: coalesces concurrent token refreshes
// (from parallel server actions) into one shared in-flight request, so the
// backend never sees overlapping refresh calls that could race and rotate
// the token out from under a sibling request.
let refreshInFlight: Promise<AuthUserResponseModel> | null = null;

// Warn once per server process instead of on every request when no website key
// is configured — otherwise a misconfigured deploy floods the logs.
let warnedMissingWebsiteKey = false;

/**
 * Which storefront this request belongs to.
 *
 * The middleware sets `x-variant` on every request; in a pinned client deploy
 * the env var is authoritative. `headers()` throws outside a request scope
 * (e.g. a build-time evaluation), so failures fall back to the configured
 * default rather than breaking the call.
 */
async function resolveWebsiteContext(): Promise<{
  variantId: string;
  websiteKey: string;
}> {
  let variantId = PINNED_VARIANT_ID || DEFAULT_VARIANT_ID;
  try {
    const fromHeader = (await headers()).get(VARIANT_HEADER);
    if (fromHeader) variantId = fromHeader;
  } catch {
    // No readable request scope. Two cases, both correct to fall back on:
    //  - a module-level / build-time call, where there is no request at all;
    //  - a static prerender, where Next throws DYNAMIC_SERVER_USAGE from
    //    headers().
    //
    // Do NOT rethrow the dynamic error to force a bail-out: several shared
    // actions (business settings, categories) catch their own failures, so the
    // throw would be swallowed there and the page would render with no data
    // instead of becoming dynamic. The env-derived default is the right answer
    // anyway — a build that prerenders is a pinned client deploy, where
    // `ACTIVE_VARIANT` is authoritative. In showcase mode `app/layout.tsx`
    // already reads the header uncaught, so those routes are dynamic and this
    // branch is never reached.
  }
  return { variantId, websiteKey: getWebsiteKey(variantId) };
}

// API Response Types
export interface ApiResponse<TResponse> {
  success: boolean;
  message?: string;
  data: TResponse | null;
  error: Error | null;
  /**
   * Set when the backend rejected `X-Website-Key` (HTTP 401). A deployment
   * misconfiguration — do not retry, and do not present it as a login prompt.
   */
  websiteKeyError?: boolean;
}

export interface PaginatedResponse<TResponse> {
  data: TResponse[] | null;
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
}

// HTTP Methods type
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

// Base API Client with fluent interface
export class ApiClient {
  private baseURL: string;
  private endpoint: string;
  private method: HttpMethod = "GET";
  private requestBody: BodyInit | null = null;
  private headers: Record<string, string> = {};
  private cache?: RequestCache;
  private cacheRevalidate?: number | false;
  private cacheTags?: string[];
  // Browser cookies to forward to the backend (analytics + any others the
  // browser holds), built from the request cookie jar in withCookieHeaders().
  private forwardCookieHeader?: string;
  // When true, execute() relays the backend's `_analytics_*` Set-Cookie
  // headers back to the browser so visitor/session tracking persists.
  private relayVisitorCookies = false;
  // Explicit website key override; when unset, execute() resolves it from the
  // active variant.
  private websiteKeyOverride?: string;

  constructor(endpoint?: string) {
    this.baseURL = API_CONFIG.API_BASE_URL_V1;
    this.endpoint = this.normalizeEndpoint(endpoint || "");
    this.headers = {
      "Content-Type": "application/json",
    };
  }

  // Helper method to normalize endpoint by removing leading/trailing slashes
  private normalizeEndpoint(endpoint: string): string {
    return endpoint.replace(/^\/+|\/+$/g, "");
  }

  // Static factory method to create a new instance with endpoint
  static create(endpoint: string): ApiClient {
    return new ApiClient(endpoint);
  }

  withMethod(method: HttpMethod): this {
    this.method = method;
    return this;
  }

  withCookieHeaders(cookieJar: ReadonlyRequestCookies): this {
    if (!cookieJar) {
      // Defensive guard only — the parameter is required at compile time, so this
      // should be unreachable except via unsafe callers (e.g. plain JS, `any`).
      console.warn(
        "withCookieHeaders() called without a cookie jar; request will be sent unauthenticated.",
      );
      return this;
    }

    // Extract auth token from Next.js cookies. Guests have no `__token__` cookie,
    // so `token` is undefined and the request is sent anonymously — that's expected.
    const token = cookieJar.get(AUTH_TOKEN_COOKIE_NAME)?.value;

    if (token) {
      // Store token for validation before execute()
      this.headers.Authorization = `Bearer ${token}`;
      this.headers["X-Auth-Token"] = token; // Store for validation in execute()
    }

    // Forward the backend's visitor/session cookies so its server-side
    // analytics can read them (the browser-side equivalent of sending
    // `credentials: 'include'`). We forward ONLY `_analytics_*` — the auth
    // token already goes as a Bearer header, and forwarding unrelated cookies
    // (language, consent, …) would leak data the backend doesn't need and risks
    // a header-encoding failure on non-Latin-1 cookie values.
    const forwarded = cookieJar
      .getAll()
      .filter((c) => c.name.startsWith(ANALYTICS_COOKIE_PREFIX))
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
    if (forwarded) {
      this.forwardCookieHeader = forwarded;
    }
    this.relayVisitorCookies = true;

    return this;
  }

  withBody<TBody = unknown>(data: TBody): this {
    this.requestBody = JSON.stringify(data);
    this.headers["Content-Type"] = "application/json";
    return this;
  }

  withFormData(formData: FormData): this {
    this.requestBody = formData;
    // Remove Content-Type header to let browser set it with boundary
    delete this.headers["Content-Type"];
    return this;
  }

  withParams(
    params: Record<string, string | number | boolean | string[]>,
  ): this {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Handle array values by appending each item
        value.forEach((item) => {
          searchParams.append(key, String(item));
        });
      } else if (value !== undefined && value !== null) {
        // Handle single values
        searchParams.set(key, String(value));
      }
    });

    // Append query params to endpoint
    const queryString = searchParams.toString();
    if (queryString) {
      this.endpoint += this.endpoint.includes("?")
        ? `&${queryString}`
        : `?${queryString}`;
    }

    return this;
  }

  /**
   * Override the store this call is made on behalf of. Rarely needed —
   * execute() derives the key from the active variant. Use it only when a call
   * must target a specific store regardless of the current request's variant.
   */
  withWebsiteKey(key: string): this {
    this.websiteKeyOverride = key;
    return this;
  }

  withHeaders(additionalHeaders: Record<string, string>): this {
    this.headers = { ...this.headers, ...additionalHeaders };
    return this;
  }

  withCache(
    tags: string[],
    revalidate?: number | false,
    cache?: RequestCache,
  ): this {
    this.cache = cache || "force-cache";
    this.cacheTags = tags;
    this.cacheRevalidate = revalidate;
    return this;
  }

  async execute<TResponse = unknown>(): Promise<TResponse> {
    // Check and refresh token if needed BEFORE making the request
    const authToken = this.headers["X-Auth-Token"];
    if (authToken) {
      try {
        // Check if token is expired
        if (isTokenExpired(authToken)) {
          throw new Error("TOKEN_EXPIRED");
        }

        // Check if token should be refreshed
        if (shouldRefreshToken(authToken)) {
          // Dynamically import to avoid circular dependency
          const { refreshToken } = await import("@/(app-routes)/(auth)/action");
          // Single-flight: if a refresh is already in progress (triggered by a
          // concurrent execute() call), await that shared promise instead of
          // firing a second refresh. Whichever caller starts it resets the
          // guard once it settles, so a later (post-expiry) refresh can run.
          refreshInFlight ??= refreshToken().finally(() => {
            refreshInFlight = null;
          });
          const refreshResult = await refreshInFlight;

          if (refreshResult.success && refreshResult.data?.token) {
            // Update Authorization header with new token
            this.headers.Authorization = `Bearer ${refreshResult.data.token}`;
          } else {
            // Refresh failed
            throw new Error("TOKEN_REFRESH_FAILED");
          }
        }
      } catch (error) {
        const errorMessage = (error as Error).message;

        if (
          errorMessage === "TOKEN_EXPIRED" ||
          errorMessage === "TOKEN_REFRESH_FAILED"
        ) {
          return {
            success: false,
            message:
              errorMessage === "TOKEN_EXPIRED"
                ? "Session expired. Please login again."
                : "Failed to refresh session. Please login again.",
            data: null,
            error: error as Error,
            needsLogin: true,
          } as TResponse;
        }
      }

      // Clean up temp header
      delete this.headers["X-Auth-Token"];
    }

    const url = `${this.baseURL}${this.endpoint ? "/" + this.endpoint : ""}`;

    // Store identity. The backend filters products and stamps the order's
    // source from this header alone, so it goes on EVERY call.
    const { variantId, websiteKey } = this.websiteKeyOverride
      ? { variantId: "", websiteKey: this.websiteKeyOverride }
      : await resolveWebsiteContext();

    if (websiteKey) {
      this.headers[WEBSITE_KEY_HEADER] = websiteKey;
    } else if (!warnedMissingWebsiteKey) {
      warnedMissingWebsiteKey = true;
      console.error(
        HAS_ANY_WEBSITE_KEY
          ? `[website-key] no key configured for variant "${variantId}" and no WEBSITE_KEY fallback — the backend will answer 401.`
          : "[website-key] WEBSITE_KEY is not set — every /api/v1 call will be rejected with 401. See .env.example.",
      );
    }

    // Cached reads are shared across the whole deployment, so a response
    // fetched for one store must never be served to another. Next keys the
    // Data Cache on the full fetch arguments (headers included), so the
    // differing `X-Website-Key` already separates the entries; the extra tag
    // exists so a single store can be revalidated on its own.
    if (this.cacheTags && variantId) {
      this.cacheTags = [
        ...this.cacheTags,
        `site:${variantId}`,
        ...this.cacheTags.map((tag) => `${variantId}:${tag}`),
      ];
    }

    // Forward the browser's cookies to the backend on uncached calls only.
    // Cached reads (withCache) are shared/anonymous, so per-visitor cookies
    // must not vary — and forwarding is a no-op there anyway.
    if (this.forwardCookieHeader && !this.cache) {
      this.headers["Cookie"] = this.forwardCookieHeader;
    }

    const config: RequestInit = {
      method: this.method,
      headers: this.headers,
      body: this.requestBody,
      // Disable caching by default for external API calls
      // Only cache if explicitly set via withCache()
      cache: this.cache || "no-store",
      next: this.cacheTags
        ? {
            tags: this.cacheTags,
            revalidate: this.cacheRevalidate,
          }
        : undefined,
    };

    try {
      const response = await fetch(url, config);

      // Relay the backend's analytics visitor/session cookies to the browser so
      // tracking persists across requests. Only runs on uncached calls that
      // opted in via withCookieHeaders(). Safe in any server context: during a
      // Server Component render the underlying set() throws (read-only cookie
      // store) and is caught, so it behaves as a no-op; in Server Actions /
      // Route Handlers it succeeds.
      if (this.relayVisitorCookies && !this.cache) {
        await this.relayAnalyticsCookies(response);
      }

      // Read the body once as text, then parse defensively. The upstream API
      // (or a proxy / misconfigured base URL) can return a non-JSON body —
      // e.g. an HTML error page — in which case response.json() throws a
      // cryptic "Unexpected token '<'" SyntaxError. Parsing by hand lets us
      // fall back to a clean ApiResponse<T> instead (the documented contract:
      // errors are returned, not thrown).
      const rawBody = await response.text();
      let parsedBody: unknown = null;
      if (rawBody) {
        try {
          parsedBody = JSON.parse(rawBody);
        } catch {
          parsedBody = null;
        }
      }

      if (!response.ok) {
        if (parsedBody && typeof parsedBody === "object") {
          const errorResponse = parsedBody as Record<string, unknown>;
          const errorMessage =
            (errorResponse.message as string) ||
            `Request failed with status ${response.status}`;
          errorResponse.message = errorMessage;
          errorResponse.error = new Error(errorMessage);

          // A rejected website key is a deployment misconfiguration, not a
          // user error: retrying cannot help, and every call will fail the
          // same way. Flag it so callers can show "store configuration error"
          // instead of a generic failure, and log it loudly.
          if (isWebsiteKeyRejection(response.status, errorMessage)) {
            errorResponse.websiteKeyError = true;
            console.error(
              `[website-key] ${
                websiteKey
                  ? "backend rejected the key"
                  : "no key was sent (WEBSITE_KEY unset)"
              } for variant "${variantId}" on ${this.endpoint}: ${errorMessage}`,
            );
          }

          return errorResponse as TResponse;
        }

        // Non-JSON error body (HTML error page, gateway/proxy error, etc.)
        const errorMessage =
          `Request failed with status ${response.status} ${response.statusText}`.trim();
        return {
          success: false,
          message: errorMessage,
          data: null,
          error: new Error(errorMessage),
        } as TResponse;
      }

      if (parsedBody === null) {
        // OK status but empty or non-JSON body — mirror the previous
        // (thrown-then-caught) behaviour with a clearer message.
        const errorMessage =
          "Received an invalid (non-JSON) response from the server";
        return {
          success: false,
          message: errorMessage,
          data: null,
          error: new Error(errorMessage),
        } as TResponse;
      }

      return parsedBody as TResponse;
    } catch (error) {
      const errorMessage = (error as Error).message || "Network error";
      console.error("API request failed:", error);

      return {
        success: false,
        message: errorMessage,
        data: null,
        error: error as Error,
      } as TResponse;
    }
  }

  // Re-home the backend's `_analytics_*` Set-Cookie headers onto this app's
  // own domain so the browser persists them and forwards them on later calls.
  // We deliberately drop the backend's Domain attribute (the analytics cookie
  // lives on the Next app host, forwarded server-to-server) and reuse the app's
  // own cookie config (path/secure/sameSite) — only name, value and lifetime
  // come from the backend.
  private async relayAnalyticsCookies(response: Response): Promise<void> {
    const getSetCookie = (
      response.headers as Headers & { getSetCookie?: () => string[] }
    ).getSetCookie;
    const setCookies =
      typeof getSetCookie === "function"
        ? getSetCookie.call(response.headers)
        : [];
    if (setCookies.length === 0) return;

    try {
      const store = await cookies();
      for (const raw of setCookies) {
        const [pair, ...attrs] = raw.split(";");
        const eq = pair.indexOf("=");
        if (eq === -1) continue;
        const name = pair.slice(0, eq).trim();
        const value = pair.slice(eq + 1).trim();
        if (!name.startsWith(ANALYTICS_COOKIE_PREFIX)) continue;

        const attrText = attrs.join(";");
        const maxAgeMatch = attrText.match(/(?:^|;)\s*max-age=(-?\d+)/i);
        const expiresMatch = attrText.match(/(?:^|;)\s*expires=([^;]+)/i);
        let lifetime: { maxAge?: number; expires?: Date } = {};
        if (maxAgeMatch) {
          lifetime = { maxAge: Number(maxAgeMatch[1]) };
        } else if (expiresMatch) {
          const expires = new Date(expiresMatch[1].trim());
          // Ignore an unparseable Expires rather than passing an Invalid Date
          // (which would throw in set() and abort relaying later cookies).
          if (!Number.isNaN(expires.getTime())) {
            lifetime = { expires };
          }
        }

        store.set(name, value, getCookieConfig({ httpOnly: true, ...lifetime }));
      }
    } catch {
      // Setting cookies is not allowed during a Server Component render
      // (read-only store). The cookie is still forwarded on the next call once
      // a Server Action / Route Handler issues it — nothing to do here.
    }
  }

  // Legacy methods for backward compatibility (deprecated)
  /** @deprecated Use ApiClient.create(endpoint).withMethod('GET').execute() instead */
  async get<TResponse>(endpoint: string): Promise<TResponse> {
    return ApiClient.create(endpoint)
      .withMethod("GET")
      .withCookieHeaders(await cookies())
      .execute<TResponse>();
  }

  /** @deprecated Use ApiClient.create(endpoint).withMethod('POST').withBody(data).execute() instead */
  async post<TResponse, TBody = unknown>(
    endpoint: string,
    data?: TBody,
  ): Promise<TResponse> {
    const client = ApiClient.create(endpoint)
      .withMethod("POST")
      .withCookieHeaders(await cookies());

    if (data) {
      client.withBody(data);
    }

    return client.execute<TResponse>();
  }

  /** @deprecated Use ApiClient.create(endpoint).withMethod('PUT').withBody(data).execute() instead */
  async put<TResponse, TBody = unknown>(
    endpoint: string,
    data?: TBody,
  ): Promise<TResponse> {
    const client = ApiClient.create(endpoint)
      .withMethod("PUT")
      .withCookieHeaders(await cookies());

    if (data) {
      client.withBody(data);
    }

    return client.execute<TResponse>();
  }

  /** @deprecated Use ApiClient.create(endpoint).withMethod('DELETE').execute() instead */
  async delete<TResponse>(endpoint: string): Promise<TResponse> {
    return ApiClient.create(endpoint)
      .withMethod("DELETE")
      .withCookieHeaders(await cookies())
      .execute<TResponse>();
  }
}
