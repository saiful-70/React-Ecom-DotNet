import type { VariantDescriptor } from "../types";

/**
 * intl-02 — a second international demo: emerald/teal palette, EUR pricing.
 *
 * Disables reviews and top-selling to show that two demos in the same market
 * can differ in functionality, not just colour.
 */
const intl02: VariantDescriptor = {
  id: "intl-02",
  market: "intl",
  name: "International — Emerald",
  description:
    "Emerald + teal palette, English-first, EUR pricing. Reviews and top-selling disabled.",
  theme: {
    root: {
      background: "0 0% 100%",
      foreground: "160 30% 10%",
      card: "0 0% 100%",
      "card-foreground": "160 30% 10%",
      popover: "0 0% 100%",
      "popover-foreground": "160 30% 10%",
      primary: "160 84% 33%",
      "primary-foreground": "150 40% 98%",
      secondary: "200 30% 96%",
      "secondary-foreground": "200 40% 12%",
      muted: "200 25% 95%",
      "muted-foreground": "200 10% 42%",
      accent: "174 72% 40%",
      "accent-foreground": "174 40% 98%",
      border: "200 20% 89%",
      input: "200 20% 89%",
      ring: "160 84% 33%",
      "shadow-warm": "190 40% 14%",
    },
    dark: {
      background: "200 40% 6%",
      foreground: "150 20% 92%",
      card: "200 30% 9%",
      "card-foreground": "150 20% 92%",
      popover: "200 30% 9%",
      "popover-foreground": "150 20% 92%",
      primary: "158 64% 45%",
      "primary-foreground": "160 40% 6%",
      secondary: "200 25% 16%",
      "secondary-foreground": "150 20% 92%",
      muted: "200 18% 16%",
      "muted-foreground": "200 12% 64%",
      accent: "174 60% 45%",
      "accent-foreground": "174 40% 6%",
      border: "200 16% 22%",
      input: "200 16% 22%",
      ring: "158 64% 45%",
      "shadow-warm": "200 60% 4%",
    },
  },
  branding: {
    site_name: "DebuggerMind Emerald",
    country: "DE",
    timezone: "Europe/Berlin",
    currency: "EUR",
    currency_position: "right",
    copyright_text: "© DebuggerMind Emerald",
  },
  defaultLanguage: "en",
  availableLanguages: ["en", "bn"],
  features: {
    chatWidget: true,
    wishlist: true,
    reviews: false,
    featuredProducts: true,
    todaysDeals: true,
    topSelling: false,
    campaigns: true,
    cookieConsent: true,
    languageSwitcher: true,
  },
};

export default intl02;
