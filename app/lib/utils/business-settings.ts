import {
  BusinessSettingItem,
  BusinessSettingsModel,
} from "@/components/shared/types/BusinessSettingModel";

/**
 * Business Settings Utilities
 *
 * This module handles normalization of business settings from various API response formats:
 * 1. BusinessSettingItem[] - Array of {type, value} objects
 * 2. BusinessSettingsModel[] - Array of normalized setting objects
 * 3. BusinessSettingsModel - Single normalized setting object (future format)
 *
 * The normalizeBusinessSettings function merges all settings into one object with defaults,
 * ensuring consistent access patterns regardless of API response format.
 */

/**
 * Single source of truth for the storefront's fallback currency, used when
 * neither the variant branding nor the backend API supplies one. Keep this as
 * the only hardcoded currency literal in the codebase.
 */
export const DEFAULT_CURRENCY = "BDT";

/**
 * Normalizes business settings from any format into a single BusinessSettingsModel object
 * Handles: BusinessSettingItem[], BusinessSettingsModel[], BusinessSettingsModel, or empty data
 *
 * Merge order (later wins): built-in defaults → variant branding → backend API data.
 * `variantBranding` lets each demo/deployment supply its own name/logo/currency
 * without needing a separate backend; a real client backend can still override it.
 */
export function normalizeBusinessSettings(
  apiData:
    | BusinessSettingItem[]
    | BusinessSettingsModel[]
    | BusinessSettingsModel
    | null
    | undefined,
  variantBranding?: Partial<BusinessSettingsModel>
): BusinessSettingsModel {
  // Create defaults first
  const builtInDefaults: BusinessSettingsModel = {
    site_name: "DebuggerMind",
    contact_email: "support@debuggermind.com",
    contact_phone: "01234567890",
    country: "BD",
    timezone: "Asia/Dhaka",
    pagination: "25",
    address: "Dhaka, Bangladesh",
    decimal_digits: "2",
    currency: DEFAULT_CURRENCY,
    currency_position: "left",
    copyright_text: "@copyright reserved 2025",
    header_logo: "/logo.png",
    footer_logo: "/logo.png",
    favicon: "/favicon.ico",
    maintenance_mode: "0",
    shipping_type: "flat_rate",
    flat_cost: "100",
    decimal_separator: "1",
    symbol_format: "1",
    system_default_currency: "1",
    product_number: "2000",
    customer_number: "580",
    satisfaction_percentage: "99",
    free_shipping_on_over: "1200",
    support_time: "24/7",
    hero_image: "/hero-image.jpg",
  };

  // Layer variant branding over the built-in defaults (backend data still wins).
  const defaults: BusinessSettingsModel = variantBranding
    ? { ...builtInDefaults, ...variantBranding }
    : builtInDefaults;

  // Handle null or undefined
  if (!apiData) {
    return defaults;
  }

  // Case 1: Single BusinessSettingsModel object (future format)
  if (!Array.isArray(apiData) && typeof apiData === "object") {
    return {
      ...defaults,
      ...apiData,
    };
  }

  // Case 2: Array format
  if (Array.isArray(apiData)) {
    // Empty array
    if (apiData.length === 0) {
      return defaults;
    }

    // Check if it's BusinessSettingItem[] format (has 'type' and 'value')
    if (apiData[0] && "type" in apiData[0] && "value" in apiData[0]) {
      const settingsArray = apiData as BusinessSettingItem[];
      const apiSettings: Partial<BusinessSettingsModel> = {};

      settingsArray.forEach((item) => {
        (apiSettings as Record<string, string>)[item.type] = item.value;
      });

      return {
        ...defaults,
        ...apiSettings,
      };
    }

    // Check if it's BusinessSettingsModel[] format
    if (apiData[0] && "site_name" in apiData[0]) {
      const settingsArray = apiData as BusinessSettingsModel[];
      // Merge all objects in the array (in case of multiple settings objects)
      const mergedSettings = settingsArray.reduce(
        (acc, current) => ({
          ...acc,
          ...current,
        }),
        {} as Partial<BusinessSettingsModel>
      );

      return {
        ...defaults,
        ...mergedSettings,
      };
    }
  }

  // Fallback to defaults
  return defaults;
}

/**
 * @deprecated Use normalizeBusinessSettings instead
 * Legacy function for backward compatibility
 */
export function transformBusinessSettings(
  settingsArray: BusinessSettingItem[]
): BusinessSettingsModel {
  return normalizeBusinessSettings(settingsArray);
}

/**
 * Get a specific business setting value with fallback
 */
export function getBusinessSetting(
  settings: BusinessSettingsModel,
  key: keyof BusinessSettingsModel,
  fallback?: string
): string {
  return settings[key] || fallback || "";
}

/**
 * Get business setting as number
 */
export function getBusinessSettingAsNumber(
  settings: BusinessSettingsModel,
  key: keyof BusinessSettingsModel,
  fallback: number = 0
): number {
  const value = settings[key];
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Check if maintenance mode is enabled
 */
export function isMaintenanceModeEnabled(
  settings: BusinessSettingsModel
): boolean {
  return settings.maintenance_mode === "1";
}

/**
 * Get formatted currency
 */
export function formatCurrency(
  amount: number,
  settings: BusinessSettingsModel
): string {
  const currency = settings.currency || DEFAULT_CURRENCY;
  const decimals = getBusinessSettingAsNumber(settings, "decimal_digits", 2);
  const position = settings.currency_position || "left";

  const formatted = amount.toFixed(decimals);

  if (position === "left") {
    return `${getCurrencySymbol(currency)}${formatted}`;
  } else {
    return `${formatted}${getCurrencySymbol(currency)}`;
  }
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    BDT: "৳",
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    // Add more as needed
  };

  return symbols[currency] || currency;
}
