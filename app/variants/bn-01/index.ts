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
  name: "Bengali — Mudir Dokan Khata",
  description:
    "The original Bengali storefront on the classic template: khata-ledger UI, stamp-red ordering, Bengali-first, full feature set.",
  theme: {
    // Intentionally empty: the globals.css :root block IS the classic
    // template's "Mudir Dokan Khata" world, which is bn-01's dress.
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
    bundles: true,
    cookieConsent: true,
    languageSwitcher: true,
  },
};

export default bn01;
