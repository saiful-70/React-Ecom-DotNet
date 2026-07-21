/**
 * Mock bundle/combo data — the UI is built against this until the backend
 * implements the contract (docs/superpowers/specs/2026-07-21-bundle-combo-api-contract.md).
 *
 * The fetch actions (`getProductBundle`, `getCombo`) read from here today; swapping
 * them to real `ApiClient` calls later leaves the component tree untouched.
 */
import type { Bundle } from "./types";

/**
 * MOCK-only anchor: the product this demo quantity bundle attaches to. Once the
 * backend returns bundles per product, the PDP just renders whatever the API
 * sends and this constant disappears. Change the number here to demo the bundle
 * on a different product id.
 */
export const DEMO_BUNDLE_PRODUCT_ID = 1;

/** Placeholder image ids known to resolve on Unsplash (mock only). */
const IMG_RACK =
  "https://images.unsplash.com/photo-1584990347449-716c96a0a1cb?w=600&auto=format&fit=crop";
const IMG_APRON =
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&auto=format&fit=crop";
const IMG_COMBO =
  "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&auto=format&fit=crop";

/**
 * Quantity bundle — same product at 1/2/3 tiers (mockups 4–5).
 * `savings` is the promoted "you save" amount (0 on the base tier so no ribbon
 * shows); `compare_at_price` is the struck reference and may still exceed `price`.
 */
const spiceRackQuantityBundle: Bundle = {
  id: 9001,
  type: "quantity",
  slug: "spice-rack-quantity",
  product_id: DEMO_BUNDLE_PRODUCT_ID,
  title: "১৮ জার স্পাইস র‍্যাক",
  subtitle: "বেশি কিনুন, বেশি সেভ করুন!",
  badge: "BUNDLE OFFER",
  images: [IMG_RACK],
  is_active: true,
  starts_at: null,
  ends_at: null,
  tiers: [
    {
      id: 90011,
      label: "১টি কিনুন",
      badge: null,
      price: 499,
      compare_at_price: 699,
      savings: 0,
      perks: [],
      items: [
        {
          product_id: DEMO_BUNDLE_PRODUCT_ID,
          name: "18 Jar Rotating Spice Rack",
          image: IMG_RACK,
          quantity: 1,
          unit_price: 499,
        },
      ],
    },
    {
      id: 90012,
      label: "২টি কিনুন",
      badge: "MOST POPULAR",
      price: 899,
      compare_at_price: 998,
      savings: 99,
      is_default: true,
      perks: [],
      items: [
        {
          product_id: DEMO_BUNDLE_PRODUCT_ID,
          name: "18 Jar Rotating Spice Rack",
          image: IMG_RACK,
          quantity: 2,
          unit_price: 499,
        },
      ],
    },
    {
      id: 90013,
      label: "৩টি কিনুন",
      badge: "BEST VALUE",
      price: 1199,
      compare_at_price: 1498,
      savings: 299,
      perks: [
        { type: "free_delivery", label: "ফ্রি ডেলিভারি" },
        { type: "free_gift", label: "এক্সট্রা গিফট", gift_product_id: 9999 },
      ],
      items: [
        {
          product_id: DEMO_BUNDLE_PRODUCT_ID,
          name: "18 Jar Rotating Spice Rack",
          image: IMG_RACK,
          quantity: 3,
          unit_price: 499,
        },
      ],
    },
  ],
};

/**
 * Combo — different products sold as a set (mockup 6). The apron count stays 1×
 * while the rack scales, so each tier declares its own explicit composition.
 */
const APRON_PRODUCT_ID = 2;

const spiceRackApronCombo: Bundle = {
  id: 9101,
  type: "combo",
  slug: "spice-rack-apron-combo",
  product_id: null,
  title: "স্পাইস র‍্যাক + এপ্রোন কম্বো অফার",
  subtitle: "কম কিনুন, বেশি সেভ করুন!",
  badge: "COMBO OFFER",
  images: [IMG_COMBO, IMG_RACK, IMG_APRON],
  is_active: true,
  starts_at: null,
  ends_at: null,
  tiers: [
    {
      id: 91011,
      label: "১ সেট কম্বো",
      badge: null,
      price: 1299,
      compare_at_price: 1599,
      savings: 0,
      perks: [],
      items: [
        {
          product_id: DEMO_BUNDLE_PRODUCT_ID,
          name: "18 Jar Rotating Spice Rack",
          image: IMG_RACK,
          quantity: 1,
          unit_price: 1099,
        },
        {
          product_id: APRON_PRODUCT_ID,
          name: "Premium Kitchen Apron",
          image: IMG_APRON,
          quantity: 1,
          unit_price: 500,
        },
      ],
    },
    {
      id: 91012,
      label: "২ সেট কম্বো",
      badge: "MOST POPULAR",
      price: 2399,
      compare_at_price: 2998,
      savings: 599,
      is_default: true,
      perks: [],
      items: [
        {
          product_id: DEMO_BUNDLE_PRODUCT_ID,
          name: "18 Jar Rotating Spice Rack",
          image: IMG_RACK,
          quantity: 2,
          unit_price: 1099,
        },
        {
          product_id: APRON_PRODUCT_ID,
          name: "Premium Kitchen Apron",
          image: IMG_APRON,
          quantity: 1,
          unit_price: 500,
        },
      ],
    },
    {
      id: 91013,
      label: "৩ সেট কম্বো",
      badge: "BEST VALUE",
      price: 3499,
      compare_at_price: 4497,
      savings: 998,
      perks: [{ type: "free_delivery", label: "ফ্রি ডেলিভারি" }],
      items: [
        {
          product_id: DEMO_BUNDLE_PRODUCT_ID,
          name: "18 Jar Rotating Spice Rack",
          image: IMG_RACK,
          quantity: 3,
          unit_price: 1099,
        },
        {
          product_id: APRON_PRODUCT_ID,
          name: "Premium Kitchen Apron",
          image: IMG_APRON,
          quantity: 1,
          unit_price: 500,
        },
      ],
    },
  ],
};

const QUANTITY_BUNDLES: Bundle[] = [spiceRackQuantityBundle];
const COMBOS: Bundle[] = [spiceRackApronCombo];

/** The quantity bundle attached to a given product's PDP, or null. */
export function findProductBundle(productId: number): Bundle | null {
  return (
    QUANTITY_BUNDLES.find(
      (b) => b.is_active && b.product_id === productId
    ) ?? null
  );
}

/** A combo by slug, or null. */
export function findCombo(slug: string): Bundle | null {
  return COMBOS.find((b) => b.is_active && b.slug === slug) ?? null;
}

/** All active combos (for a future combos index / homepage ribbon). */
export function listCombos(): Bundle[] {
  return COMBOS.filter((b) => b.is_active);
}
