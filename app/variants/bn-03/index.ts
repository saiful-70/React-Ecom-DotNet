import type { VariantDescriptor } from "../types";

/**
 * bn-03 — third Bengali storefront, on the `pantry` template.
 *
 * A single-brand natural-food pantry (ghee, mustard oil, honey, dates, spices)
 * of the kind that dominates BD direct-to-consumer food retail. The pantry
 * template's globals.css block IS this variant's palette ("The Natural Pantry"
 * world: white counter, leaf-green buy field, honey-amber discounts, a
 * single-weight Bengali serif). No theme overrides needed; future pantry
 * clients re-dress the paradigm through `theme.root`/`theme.dark`.
 *
 * Wishlist and reviews are off deliberately: a nine-product single-brand
 * pantry converts on one order form, not on a saved-items list. Bundles stay
 * on — combo packs (3× mustard oil, gift boxes) are how this category sells.
 */
const bn03: VariantDescriptor = {
  id: "bn-03",
  market: "bn",
  template: "pantry",
  name: "Bengali — Natural Pantry",
  description:
    "Single-brand Bengali natural-food shop on the pantry template: photography-led shelf, purity proof rail, pack-size tiles, cash-on-delivery order form on the product page.",
  theme: {
    root: {},
    dark: {},
  },
  branding: {
    site_name: "খাঁটি ঘর",
    country: "BD",
    timezone: "Asia/Dhaka",
    currency: "BDT",
    currency_position: "left",
  },
  defaultLanguage: "bn",
  availableLanguages: ["bn", "en"],
  features: {
    chatWidget: false,
    wishlist: false,
    reviews: true,
    featuredProducts: true,
    todaysDeals: true,
    topSelling: true,
    campaigns: false,
    bundles: true,
    cookieConsent: true,
    languageSwitcher: true,
  },
};

export default bn03;
