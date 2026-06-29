import type {
  FormData,
  PurchaseOrderRequest,
  ShippingMethod,
  CheckoutDataProduct,
} from "@/(app-routes)/checkout/model";

interface CartItem {
  id: number;
  quantity: number;
  price: number;
  variant_id?: number;
}

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

export const prepareShippingAddress = (formData: FormData) => ({
  contact_person_name: formData.name.trim(),
  phone: formatBDPhone(formData.phone),
  email: BD_DEFAULTS.email,
  address_type: BD_DEFAULTS.address_type,
  country: BD_DEFAULTS.country,
  city: formData.city,
  zip_code: BD_DEFAULTS.zip_code,
  address: formData.address.trim(),
  is_billing: false,
});

export const prepareBillingAddress = (formData: FormData) => ({
  contact_person_name: formData.name.trim(),
  phone: formatBDPhone(formData.phone),
  email: BD_DEFAULTS.email,
  address_type: BD_DEFAULTS.address_type,
  country: BD_DEFAULTS.country,
  city: formData.city,
  zip_code: BD_DEFAULTS.zip_code,
  address: formData.address.trim(),
});

export const prepareOrderItems = (
  cartItems: CartItem[],
  serverPrices?: CheckoutDataProduct[],
) => {
  return cartItems.map((item) => {
    const serverPrice = serverPrices?.find(
      (sp) =>
        sp.product_id === item.id && sp.variant_id === (item.variant_id || 0),
    );

    return {
      product_id: item.id,
      quantity: item.quantity,
      price: serverPrice ? serverPrice.discount_price : item.price,
      variant_id: item.variant_id || 0,
    };
  });
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
}): PurchaseOrderRequest => {
  const {
    formData,
    cartItems,
    cartTotals,
    shippingMethod = "standard",
    shippingDuration = 3,
    serverPrices,
  } = params;

  const totals = calculateTotals(cartTotals);

  return {
    total_price: totals.totalPrice,
    order_status: "pending",
    payment_status: "unpaid",
    payment_method: "cash_on_delivery",
    shipping_method: shippingMethod,
    shipping_cost: totals.shippingCost,
    shipping_duration: shippingDuration,
    total_vat_amount: totals.vatAmount,
    shipping_address: prepareShippingAddress(formData),
    billing_address: prepareBillingAddress(formData),
    order_items: prepareOrderItems(cartItems, serverPrices),
  };
};
