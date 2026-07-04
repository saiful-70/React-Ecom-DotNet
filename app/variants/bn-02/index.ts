import type { VariantDescriptor } from "../types";

/**
 * bn-02 — a second Bengali demo: warm terracotta/amber palette.
 *
 * Demonstrates the additive model: a whole new demo is one folder + one
 * registry line, no branch. It also disables two features (chat + today's
 * deals) to show feature flags gating functionality per variant.
 */
const bn02: VariantDescriptor = {
  id: "bn-02",
  market: "bn",
  name: "Bengali — Sunset Terracotta",
  description:
    "Warm terracotta + amber palette, Bengali-first. Chat and today's deals turned off to show feature flags.",
  theme: {
    root: {
      background: "28 45% 98%",
      foreground: "20 30% 12%",
      card: "0 0% 100%",
      "card-foreground": "20 30% 12%",
      popover: "0 0% 100%",
      "popover-foreground": "20 30% 12%",
      primary: "16 78% 46%",
      "primary-foreground": "28 45% 98%",
      secondary: "20 44% 16%",
      "secondary-foreground": "28 45% 97%",
      muted: "28 40% 93%",
      "muted-foreground": "20 12% 38%",
      accent: "38 92% 50%",
      "accent-foreground": "20 40% 12%",
      border: "24 30% 86%",
      input: "24 30% 86%",
      ring: "16 78% 46%",
      "shadow-warm": "20 40% 14%",
    },
    dark: {
      background: "20 28% 8%",
      foreground: "28 30% 92%",
      card: "20 24% 11%",
      "card-foreground": "28 30% 92%",
      popover: "20 24% 11%",
      "popover-foreground": "28 30% 92%",
      primary: "18 82% 56%",
      "primary-foreground": "20 28% 8%",
      secondary: "20 26% 16%",
      "secondary-foreground": "28 30% 92%",
      muted: "20 18% 17%",
      "muted-foreground": "28 14% 66%",
      accent: "38 88% 58%",
      "accent-foreground": "20 30% 10%",
      border: "20 16% 22%",
      input: "20 16% 22%",
      ring: "18 82% 56%",
      "shadow-warm": "20 60% 5%",
    },
  },
  branding: {
    site_name: "Terracotta Bazaar",
    country: "BD",
    timezone: "Asia/Dhaka",
    currency: "BDT",
    currency_position: "left",
  },
  defaultLanguage: "bn",
  availableLanguages: ["bn", "en"],
  features: {
    chatWidget: false,
    wishlist: true,
    reviews: true,
    featuredProducts: true,
    todaysDeals: false,
    topSelling: true,
    campaigns: true,
    cookieConsent: true,
    languageSwitcher: true,
  },
};

export default bn02;
