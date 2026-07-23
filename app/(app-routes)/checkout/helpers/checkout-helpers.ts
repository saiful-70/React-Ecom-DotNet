import type {
  FormData,
  PurchaseOrderRequest,
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

interface CartTotals {
  subtotal: number;
  tax: number | null;
  shipping: number | null;
}

const BD_DEFAULTS = {
  country: "Bangladesh",
  email: "",
  zip_code: "",
  address_type: "home",
} as const;

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
  /** International checkout: keep the E.164 phone and use the form's country/zip. */
  international?: boolean;
}

export const prepareShippingAddress = (
  formData: FormData,
  opts: AddressOptions = {},
) => ({
  contact_person_name: formData.name.trim(),
  phone: opts.international ? formData.phone.trim() : formatBDPhone(formData.phone),
  email: BD_DEFAULTS.email,
  address_type: BD_DEFAULTS.address_type,
  country: opts.international
    ? formData.country?.trim() || ""
    : BD_DEFAULTS.country,
  city: formData.city,
  zip_code: opts.international ? formData.zip?.trim() || "" : BD_DEFAULTS.zip_code,
  address: formData.address.trim(),
  is_billing: false,
});

export const prepareBillingAddress = (
  formData: FormData,
  opts: AddressOptions = {},
) => ({
  contact_person_name: formData.name.trim(),
  phone: opts.international ? formData.phone.trim() : formatBDPhone(formData.phone),
  email: BD_DEFAULTS.email,
  address_type: BD_DEFAULTS.address_type,
  country: opts.international
    ? formData.country?.trim() || ""
    : BD_DEFAULTS.country,
  city: formData.city,
  zip_code: opts.international ? formData.zip?.trim() || "" : BD_DEFAULTS.zip_code,
  address: formData.address.trim(),
});

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
        // `order_items` check, an order made up entirely of degenerate
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
          variant_id: comp.variant_id || 0,
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
      variant_id: item.variant_id || 0,
    });
  }

  return orderItems;
};

export const calculateTotals = (cartTotals: CartTotals) => {
  const vatAmount = cartTotals.tax || 0;
  const shippingCost = cartTotals.shipping || 0;
  const totalPrice = cartTotals.subtotal + vatAmount + shippingCost;

  return {
    vatAmount,
    shippingCost,
    totalPrice,
  };
};

export const prepareOrderData = (params: {
  formData: FormData;
  cartItems: CartItem[];
  cartTotals: CartTotals;
  shippingMethod?: ShippingMethod;
  shippingDuration?: number;
  serverPrices?: CheckoutDataProduct[];
  international?: boolean;
  bundleValidations?: BundleValidationMap;
}): PurchaseOrderRequest => {
  const {
    formData,
    cartItems,
    cartTotals,
    shippingMethod = "standard",
    shippingDuration = 3,
    serverPrices,
    international = false,
    bundleValidations,
  } = params;

  const totals = calculateTotals(cartTotals);

  // Single-bundle order path: attach the first bundle line's quote at the top
  // level (the backend re-validates against it and applies server pricing).
  const firstBundle = cartItems.find((i) => i.bundle_tier_id);
  const firstQuote = firstBundle?.bundle_tier_id
    ? bundleValidations?.[firstBundle.bundle_tier_id]?.server_quote_id
    : undefined;

  return {
    total_price: totals.totalPrice,
    order_status: "pending",
    payment_status: "unpaid",
    payment_method: "cash_on_delivery",
    shipping_method: shippingMethod,
    shipping_cost: totals.shippingCost,
    shipping_duration: shippingDuration,
    total_vat_amount: totals.vatAmount,
    shipping_address: prepareShippingAddress(formData, { international }),
    billing_address: prepareBillingAddress(formData, { international }),
    order_items: prepareOrderItems(cartItems, serverPrices, bundleValidations),
    ...(firstBundle && firstQuote
      ? {
          bundle_id: firstBundle.bundle_id,
          bundle_tier_id: firstBundle.bundle_tier_id,
          server_quote_id: firstQuote,
        }
      : {}),
  };
};
