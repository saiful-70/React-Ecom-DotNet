import type { VariantDescriptor } from "../types";

/**
 * bn-01 — the flagship Bengali storefront, on the `classic` template.
 *
 * The classic template plays the BD retail standard straight ("The Open
 * Shopfront": white field, photography-led cards, one vermilion-orange buy
 * colour, green trust lines). A metaphor world was tried here and rejected as
 * wrong for BD shoppers — see the brand commitment in PRODUCT.md before
 * proposing another one.
 */
const bn01: VariantDescriptor = {
  id: "bn-01",
  market: "bn",
  template: "classic",
  name: "Open Shopfront",
  description:
    "The flagship Bengali storefront on the classic template: banner carousel, white photography-led retail UI, orange ordering, Bengali-first, full feature set.",
  theme: {
    // Intentionally empty: the globals.css :root block IS the classic
    // template's "Open Shopfront" world, which is bn-01's dress.
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
