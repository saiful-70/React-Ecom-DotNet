import type { VariantDescriptor } from "../types";

/**
 * intl-02 — premium single-brand international store.
 *
 * Rendered through the `premium` template ("The Batch Label" world: viridian
 * lacquer field, label-stock buy panel, foil-gold purchase action, vermilion
 * seal accent). The template's globals.css block IS this variant's palette,
 * so no theme overrides are needed; future premium clients supply their own
 * `theme.root`/`theme.dark` overrides to re-dress the same paradigm.
 *
 * Positioning: editorial single-brand storefront — few products presented as
 * boxed specimens, one-viewport buy panel, express guest-first checkout.
 */
const intl02: VariantDescriptor = {
  id: "intl-02",
  market: "intl",
  template: "premium",
  name: "International — Atelier",
  description:
    "Premium single-brand store on the premium template: lacquer field, specimen PDP, label-panel buy box, editorial sections.",
  theme: {
    root: {},
    dark: {},
  },
  branding: {
    site_name: "Maison Verte",
    country: "GB",
    timezone: "Europe/London",
    currency: "USD",
    currency_position: "left",
  },
  defaultLanguage: "en",
  availableLanguages: ["en"],
  features: {
    chatWidget: false,
    wishlist: true,
    reviews: true,
    featuredProducts: true,
    todaysDeals: false,
    topSelling: true,
    campaigns: false,
    bundles: true,
    cookieConsent: true,
    languageSwitcher: false,
  },
};

export default intl02;
