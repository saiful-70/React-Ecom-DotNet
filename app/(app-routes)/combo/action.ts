"use server";

import { cache } from "react";
import { ApiClient, type ApiResponse } from "@/lib/api-client";
import { API_ROUTES } from "@/lib/api-route";
import { getRequestLanguage } from "@/lib/utils/server-language";
import { cookies } from "next/headers";
import type {
  Bundle,
  BundleSummary,
  BundleValidationResult,
  ValidateBundleRequest,
} from "@/lib/bundles/types";

/**
 * Result of `getCombo`:
 * - `Bundle` on success.
 * - `null` for a well-formed "not found" response (request succeeded, no data).
 * - `"error"` when the request itself failed (network error or non-2xx from
 *   the backend) - a transport/5xx outage, distinct from a genuine 404.
 */
export type ComboFetchResult = Bundle | null | "error";

// A "use server" file may only export async functions, so the request-scoped
// dedup lives in this unexported helper (wrapped with React `cache()`) rather
// than on `getCombo` itself. Both `generateMetadata` and the page call the
// exported `getCombo`, which in turn shares this single cached network call
// per render.
const fetchComboResponse = cache(
  (slug: string, lang: string): Promise<ApiResponse<Bundle | null>> =>
    new ApiClient(API_ROUTES.BUNDLES.COMBO_DETAILS(slug))
      .withMethod("GET")
      .withParams({ lang })
      .execute<ApiResponse<Bundle | null>>()
);

/** Single combo by slug. See `ComboFetchResult` for the not-found/error distinction. */
export async function getCombo(slug: string): Promise<ComboFetchResult> {
  const lang = await getRequestLanguage();
  const response = await fetchComboResponse(slug, lang);

  if (!response.success) {
    // Transport/5xx failure - let callers surface this as an outage
    // (error boundary) rather than a false "not found" (404).
    return "error";
  }

  return response.data ?? null;
}

/** Active combos list (for the landing grid / home marketing banner). */
export async function getCombos(perPage: number = 12): Promise<BundleSummary[]> {
  const lang = await getRequestLanguage();
  const response = await new ApiClient(API_ROUTES.BUNDLES.COMBOS)
    .withMethod("GET")
    .withParams({ page: 1, per_page: perPage, lang })
    .execute<ApiResponse<BundleSummary[]>>();

  return response.success && Array.isArray(response.data) ? response.data : [];
}

/**
 * Validate a selected tier at checkout: returns server-authoritative pricing and
 * a short-lived `server_quote_id`. Failed validation still resolves with
 * `is_valid: false` + structured errors (the API returns 200 with success:false).
 */
export async function validateBundle(
  request: ValidateBundleRequest
): Promise<BundleValidationResult | null> {
  const lang = await getRequestLanguage();
  const response = await new ApiClient(API_ROUTES.BUNDLES.VALIDATE)
    .withMethod("POST")
    .withParams({ lang })
    .withBody(request)
    .withCookieHeaders(await cookies())
    .execute<ApiResponse<BundleValidationResult>>();

  return response.data ?? null;
}
