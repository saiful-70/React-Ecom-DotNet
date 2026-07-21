import type { VariantDescriptor } from "../types";

/**
 * bn-02 — second Bengali storefront, palette adapted from the "theme-1"
 * reference (ecom.prodevs.com.bd/theme-1).
 *
 * Extracted from that theme's CSS :root tokens:
 *   --primary #7fad39 (lime/olive green), --secondary #252525 (near-black
 *   chrome), --text-color #1c1c1c, light #f6f7f8 surfaces, #e1e1e1 borders,
 *   plus a prominent coral #ff4b5c used here as the accent pop. Radius ~8px.
 *
 * Only colours/radius are captured — the reference's fonts (Cairo/Bangla) are
 * left to the app's own font stack. Rename `site_name` to the real brand.
 */
const bn02: VariantDescriptor = {
  id: "bn-02",
  market: "bn",
  template: "bazar",
  name: "Bengali — Lime & Coral",
  description:
    "Second Bengali demo on the bazar template: contact top bar, department sidebar, ribbon cards with Buy Now, mobile bottom nav.",
  theme: {
    root: {
      background: "0 0% 100%",
      foreground: "0 0% 11%",
      card: "0 0% 100%",
      "card-foreground": "0 0% 11%",
      popover: "0 0% 100%",
      "popover-foreground": "0 0% 11%",
      primary: "84 50% 45%",
      "primary-foreground": "0 0% 100%",
      secondary: "0 0% 14%",
      "secondary-foreground": "0 0% 100%",
      muted: "210 12% 97%",
      "muted-foreground": "0 0% 44%",
      accent: "354 100% 65%",
      "accent-foreground": "0 0% 100%",
      destructive: "0 84% 60%",
      "destructive-foreground": "0 0% 100%",
      border: "0 0% 88%",
      input: "0 0% 88%",
      ring: "84 50% 45%",
      success: "142 71% 45%",
      "success-foreground": "0 0% 100%",
      warning: "38 92% 50%",
      "warning-foreground": "0 0% 10%",
      radius: "0.5rem",
      "sidebar-background": "0 0% 98%",
      "sidebar-foreground": "0 0% 20%",
      "sidebar-primary": "84 50% 45%",
      "sidebar-primary-foreground": "0 0% 100%",
      "sidebar-accent": "210 12% 95%",
      "sidebar-accent-foreground": "0 0% 14%",
      "sidebar-border": "0 0% 88%",
      "sidebar-ring": "84 50% 45%",
      "shadow-warm": "0 0% 14%",
    },
    dark: {
      background: "0 0% 8%",
      foreground: "0 0% 92%",
      card: "0 0% 11%",
      "card-foreground": "0 0% 92%",
      popover: "0 0% 11%",
      "popover-foreground": "0 0% 92%",
      primary: "84 52% 52%",
      "primary-foreground": "0 0% 8%",
      secondary: "0 0% 16%",
      "secondary-foreground": "0 0% 92%",
      muted: "0 0% 16%",
      "muted-foreground": "0 0% 64%",
      accent: "354 90% 66%",
      "accent-foreground": "0 0% 8%",
      destructive: "0 65% 50%",
      "destructive-foreground": "0 0% 92%",
      border: "0 0% 22%",
      input: "0 0% 22%",
      ring: "84 52% 52%",
      success: "142 60% 48%",
      "success-foreground": "0 0% 8%",
      warning: "38 85% 56%",
      "warning-foreground": "0 0% 10%",
      "sidebar-background": "0 0% 10%",
      "sidebar-foreground": "0 0% 88%",
      "sidebar-primary": "84 52% 52%",
      "sidebar-primary-foreground": "0 0% 8%",
      "sidebar-accent": "0 0% 16%",
      "sidebar-accent-foreground": "0 0% 92%",
      "sidebar-border": "0 0% 22%",
      "sidebar-ring": "84 52% 52%",
      "shadow-warm": "0 0% 3%",
    },
  },
  branding: {
    site_name: "Leaf Market BD",
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

export default bn02;
