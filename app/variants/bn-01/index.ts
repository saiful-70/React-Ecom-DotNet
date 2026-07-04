import type { VariantDescriptor } from "../types";

/**
 * bn-01 — the current Bengali storefront, migrated as-is.
 *
 * The globals.css defaults already carry this variant's green palette, so no
 * theme overrides are needed here. New Bengali demos (bn-02, …) supply their
 * own `theme.root`/`theme.dark` overrides instead of editing globals.css.
 */
const bn01: VariantDescriptor = {
  id: "bn-01",
  market: "bn",
  template: "classic",
  name: "Bengali — Leaf & Forest",
  description:
    "The original Bengali storefront: green forest palette, Bengali-first UI, full feature set.",
  theme: {
    // Intentionally empty: globals.css defaults ARE the bn-01 (green) theme.
    root: {},
    dark: {},
  },
  branding: {
    site_name: "DebuggerMind",
    country: "BD",
    timezone: "Asia/Dhaka",
    currency: "BDT",
    currency_position: "left",
  },
  defaultLanguage: "bn",
  availableLanguages: ["bn", "en"],
  features: {
    chatWidget: true,
    wishlist: true,
    reviews: true,
    featuredProducts: true,
    todaysDeals: true,
    topSelling: true,
    campaigns: true,
    cookieConsent: true,
    languageSwitcher: true,
  },
};

export default bn01;
