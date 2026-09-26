import type { VariantDescriptor } from "../types";

/**
 * intl-01 — the international marketplace storefront, on the `global`
 * template.
 *
 * The global template's globals.css block IS this variant's palette ("The
 * Mail-Order Index" world: catalogue page white, print ink, catalogue blue
 * actions, sale-pages red). No theme overrides needed; future marketplace
 * clients supply their own `theme.root`/`theme.dark` overrides to re-dress
 * the paradigm. (The former 6Valley royal-blue/orange overrides were retired
 * with the 2026 template redesign.)
 */
const intl01: VariantDescriptor = {
  id: "intl-01",
  market: "intl",
  template: "global",
  name: "Mail-Order Index",
  description:
    "The international marketplace: catalogue-index UI, numbered product plates, honest availability lines, English-first.",
  theme: {
    root: {},
    dark: {},
  },
  branding: {
    site_name: "DebuggerMind Global",
    country: "US",
    timezone: "UTC",
    currency: "USD",
    currency_position: "left",
    copyright_text: "© DebuggerMind Global",
  },
  defaultLanguage: "en",
  availableLanguages: ["en", "bn"],
  features: {
    chatWidget: true,
    wishlist: true,
    reviews: true,
    featuredProducts: true,
    todaysDeals: true,
    topSelling: true,
    campaigns: true,
    bundles: false,
    cookieConsent: true,
    languageSwitcher: true,
  },
};

export default intl01;
