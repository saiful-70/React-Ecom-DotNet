import type {
  FormData,
  PurchaseOrderRequest,
  ShippingAddress,
  ShippingMethod,
  CheckoutDataProduct,
  OrderItem,
} from "@/(app-routes)/checkout/model";
import type { BundleValidationResult } from "@/lib/bundles/types";

interface CartItem {
  id: number;
  quantity: number;
  price: number;
  variant_id?: number;
  bundle_id?: number;
  bundle_tier_id?: number;
  bundle_components?: {
    product_id: number;
    variant_id?: number | null;
    qty: number;
  }[];
}

/** Validation results keyed by `bundle_tier_id`. */
export type BundleValidationMap = Record<number, BundleValidationResult>;

// Normalize any BD phone input to the local "01XXXXXXXXX" format, dropping a
// leading +880/880 country-code prefix that may come from a prefilled profile.
export const toLocalBDPhone = (raw: string): string => {
  let digits = (raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("880")) {
    digits = digits.slice(3);
  }
  return digits.startsWith("0") ? digits : `0${digits}`;
};

const formatBDPhone = (raw: string): string => toLocalBDPhone(raw);

interface AddressOptions {
  /** International checkout: keep the E.164 phone and use the form's zip. */
  international?: boolean;
  /** Backend country id (`GET /countries`); required by `purchase-order`. */
  countryId?: number;
  /** Account email, forwarded so guest/authed orders stay contactable. */
  email?: string;
}

export const prepareShippingAddress = (
  formData: FormData,
  opts: AddressOptions = {},
): ShippingAddress => {
  const email = opts.email?.trim();
  const postalCode = opts.international ? formData.zip?.trim() : "";

  return {
    name: formData.name.trim(),
    phone: opts.international
      ? formData.phone.trim()
      : formatBDPhone(formData.phone),
    ...(email ? { email } : {}),
    address: formData.address.trim(),
    city: formData.city,
    ...(postalCode ? { postal_code: postalCode } : {}),
    ...(opts.countryId ? { country_id: opts.countryId } : {}),
  };
};

export const prepareOrderItems = (
  cartItems: CartItem[],
  serverPrices?: CheckoutDataProduct[],
  bundleValidations?: BundleValidationMap,
): OrderItem[] => {
  const orderItems: OrderItem[] = [];

  for (const item of cartItems) {
    // Bundle line → expand its required components into flat, tagged order items
    // using the server-allocated unit prices from validate (falls back to 0 so
    // the backend re-prices from the quote).
    if (item.bundle_tier_id) {
      const components = item.bundle_components ?? [];
      if (components.length === 0) {
        // A bundle line with no recorded composition can't be expanded into
        // real order lines — skip it rather than falling through to the
        // normal-item branch below (which would fabricate a fake
        // `product_id: bundle.id` line). Combined with Task 24's non-empty
        // `items` check, an order made up entirely of degenerate
        // bundle lines is rejected instead of silently submitted empty.
        console.warn(
          `[checkout] Skipping degenerate bundle cart line: bundle_id=${item.bundle_id} bundle_tier_id=${item.bundle_tier_id} has no bundle_components.`,
        );
        continue;
      }
      const validation = bundleValidations?.[item.bundle_tier_id];
      for (const comp of components) {
        const allocated = validation?.items?.find(
          (li) =>
            li.product_id === comp.product_id &&
            (li.variant_id || 0) === (comp.variant_id || 0),
        );
        orderItems.push({
          product_id: comp.product_id,
          quantity: comp.qty * item.quantity,
          price: allocated ? allocated.allocated_unit_price : 0,
          // variant_id is optional on the API — omit it for variant-less rows
          // instead of sending a fake 0 id.
          ...(comp.variant_id ? { variant_id: comp.variant_id } : {}),
          bundle_id: item.bundle_id,
          bundle_tier_id: item.bundle_tier_id,
        });
      }
      continue;
    }

    const serverPrice = serverPrices?.find(
      (sp) =>
        sp.product_id === item.id && sp.variant_id === (item.variant_id || 0),
    );
    orderItems.push({
      product_id: item.id,
      quantity: item.quantity,
      price: serverPrice ? serverPrice.discount_price : item.price,
      ...(item.variant_id ? { variant_id: item.variant_id } : {}),
    });
  }

  return orderItems;
};

export const prepareOrderData = (params: {
  formData: FormData;
  cartItems: CartItem[];
  shippingCost: number;
  shippingMethod?: ShippingMethod;
  serverPrices?: CheckoutDataProduct[];
  international?: boolean;
  bundleValidations?: BundleValidationMap;
  /** Backend country id — `BANGLADESH_COUNTRY_ID` on the BD flow. */
  countryId?: number;
  email?: string;
  notes?: string;
}): PurchaseOrderRequest => {
  const {
    formData,
    cartItems,
    shippingCost,
    shippingMethod = "standard",
    serverPrices,
    international = false,
    bundleValidations,
    countryId,
    email,
    notes,
  } = params;

  // Single-bundle order path: attach the first bundle line's quote at the top
  // level (the backend re-validates against it and applies server pricing).
  const firstBundle = cartItems.find((i) => i.bundle_tier_id);
  const firstQuote = firstBundle?.bundle_tier_id
    ? bundleValidations?.[firstBundle.bundle_tier_id]?.server_quote_id
    : undefined;

  return {
    items: prepareOrderItems(cartItems, serverPrices, bundleValidations),
    shipping_address: prepareShippingAddress(formData, {
      international,
      countryId,
      email,
    }),
    payment_method: "cod",
    shipping_method: shippingMethod,
    shipping_cost: shippingCost,
    ...(notes?.trim() ? { notes: notes.trim() } : {}),
    ...(firstBundle && firstQuote
      ? {
          bundle_id: firstBundle.bundle_id,
          bundle_tier_id: firstBundle.bundle_tier_id,
          server_quote_id: firstQuote,
        }
      : {}),
  };
};
