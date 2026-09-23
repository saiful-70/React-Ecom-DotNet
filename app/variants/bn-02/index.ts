import type { VariantDescriptor } from "../types";

/**
 * bn-02 — second Bengali storefront, on the `bazar` template.
 *
 * The bazar template's globals.css block IS this variant's palette ("The
 * Flexiload Counter" world: laminated chart white, board-black chrome, tariff
 * azure, offer red). No theme overrides needed; future bazar clients supply
 * their own `theme.root`/`theme.dark` overrides to re-dress the paradigm.
 * (The former lime/coral "theme-1" overrides were retired with the 2026
 * template redesign — the old look is an anti-reference, not a base.)
 */
const bn02: VariantDescriptor = {
  id: "bn-02",
  market: "bn",
  template: "bazar",
  name: "Bengali — Flexiload Counter",
  description:
    "Second Bengali demo on the bazar template: tariff-board offers, SIM-coloured departments, phone-first ordering, mobile bottom nav.",
  theme: {
    root: {},
    dark: {},
  },
  branding: {
    site_name: "DebuggerMind Bazar",
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
    bundles: false,
    cookieConsent: true,
    languageSwitcher: true,
    onlinePayments: true,
  },
};

export default bn02;
