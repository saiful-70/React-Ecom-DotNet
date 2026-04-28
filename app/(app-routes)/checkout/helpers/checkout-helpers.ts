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
  phone_prefix: "+880",
} as const;

const formatBDPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  // Strip leading 0 from "01XXXXXXXXX" before prepending +880.
  const local = digits.startsWith("0") ? digits.slice(1) : digits;
  return `${BD_DEFAULTS.phone_prefix}${local}`;
};

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
