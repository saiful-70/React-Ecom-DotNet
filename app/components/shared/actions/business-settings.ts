"use server";

import { ApiClient } from "@/lib/api-client";
import { API_ROUTES } from "@/lib/api-route";
import { BusinessSettingsResponseModel } from "@/components/shared/types/BusinessSettingModel";
import { normalizeBusinessSettings } from "@/lib/utils/business-settings";
import { CACHE_TIMES } from "@/lib/enums";
import type { BusinessSettingsModel } from "@/components/shared/types/BusinessSettingModel";

/**
 * Fetch business settings from API with caching (1 second)
 * Returns normalized business settings object
 */
export async function getBusinessSettings(): Promise<BusinessSettingsModel> {
  try {
    const response = await new ApiClient(API_ROUTES.BUSINESS_SETTINGS)
      .withMethod("GET")
      .withCache(["business-settings"], CACHE_TIMES.VERY_SHORT_TIME)
      .execute<BusinessSettingsResponseModel>();

    if (response.success && response.data) {
      return normalizeBusinessSettings(response.data);
    }
  } catch (error) {
    console.error("Failed to fetch business settings:", error);
  }

  // Return defaults on error
  return normalizeBusinessSettings(null);
}
