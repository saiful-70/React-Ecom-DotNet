"use server";

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

/** Single combo by slug (null when not found / inactive). */
export async function getCombo(slug: string): Promise<Bundle | null> {
  const lang = await getRequestLanguage();
  const response = await new ApiClient(API_ROUTES.BUNDLES.COMBO_DETAILS(slug))
    .withMethod("GET")
    .withParams({ lang })
    .execute<ApiResponse<Bundle | null>>();

  return response.success ? (response.data ?? null) : null;
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
