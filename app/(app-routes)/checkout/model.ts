import { z } from "zod";

// Checkout data request/response types (for fetching actual prices from server)
export interface CheckoutDataRequestItem {
  product_id: number;
  variant_id?: number;
}

export interface CheckoutDataProduct {
  product_id: number;
  variant_id: number;
  discount_price: number;
  tax: string;
}

// Raw API response format (products at root level)
export interface CheckoutDataApiResponse {
  products: CheckoutDataProduct[];
}

// Normalized response format for internal use
export interface CheckoutDataResponse {
  success: boolean;
  message?: string;
  data?: {
    products: CheckoutDataProduct[];
  };
}

// Shipping address — mirrors the documented `POST /purchase-order` contract
// (FRONTEND_API_DOCUMENTATION.md §8): name/phone/address/city are required,
// the rest is optional and omitted when empty.
export interface ShippingAddress {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  postal_code?: string;
  district?: string;
  /** Backend country id (see `GET /countries`). */
  country_id?: number;
}

// Country type
export interface Country {
  id: number;
  name: string;
  code: string;
}

// City type — `GET /cities?country_id=` rows carry the per-city delivery
// charge (see FRONTEND_API_DOCUMENTATION.md §7).
export interface City {
  id: number;
  name: string;
  country_id?: number;
  shipping_cost?: number | string | null;
}

// Shipping cost type
export interface ShippingCost {
  country_id: string | number;
  city_id: string | number;
  shipping_method: string;
  shipping_cost: number;
  est_delivery_days: number;
  free_shipping_over: number;
}

// API Response types
export interface CountriesResponse {
  success: boolean;
  message: string;
  data: Country[];
}

export interface CitiesResponse {
  success: boolean;
  message: string;
  data: City[];
}

export interface ShippingCostResponse {
  success: boolean;
  message: string;
  data: ShippingCost;
}

// Order item type — documented fields are product_id/quantity/variant_id;
// price and the bundle tags are additive (backend re-prices server-side and
// re-verifies bundles against the quote).
export interface OrderItem {
  product_id: number;
  quantity: number;
  /** Omitted for non-variant products (the API marks it optional). */
  variant_id?: number;
  price?: number;
  /** Set on lines that belong to a bundle tier, grouping them for the backend. */
  bundle_id?: number;
  bundle_tier_id?: number;
}

// Cart item interface for type safety
export interface CartItem {
  id: number;
  quantity: number;
  price: number;
  variant_id?: number;
  // Bundle lines (see CartContext): carry the tier + required composition so
  // checkout can re-validate and expand them into tagged order items.
  bundle_id?: number;
  bundle_tier_id?: number;
  bundle_components?: {
    product_id: number;
    variant_id?: number | null;
    qty: number;
  }[];
}

// Purchase order request — matches the documented `POST /purchase-order`
// contract: items + shipping_address + payment_method (+ shipping extras).
// The API accepts `items` | `order_items` | `products` as the list key; we
// send the primary `items`.
export interface PurchaseOrderRequest {
  items: OrderItem[];
  shipping_address: ShippingAddress;
  payment_method: PaymentMethod;
  shipping_method: ShippingMethod;
  shipping_cost: number;
  notes?: string;
  // Bundle order (single-bundle path): the backend re-validates against this
  // short-lived quote and applies server pricing. Each bundle item is also
  // tagged with bundle_id/bundle_tier_id.
  bundle_id?: number;
  bundle_tier_id?: number;
  server_quote_id?: string;
}

// Server-side (zod) validation backstop for `createPurchaseOrder`. This only
// rejects malformed/oversized payloads before they reach the backend — it
// cannot stop a well-formed but tampered price, since the client fully
// controls this object. True price integrity requires the .NET backend to
// re-price orders from its own catalog/tax data, not trust `price`/`total_price`
// as sent.
//
// Phone is intentionally permissive: the BD flow sends local digits
// (e.g. "01712345678") while the international flow sends an E.164-ish
// string (e.g. "+15551234567").
const PHONE_REGEX = /^\+?[0-9]{6,15}$/;

const ShippingAddressSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().max(20).regex(PHONE_REGEX, "Invalid phone number"),
  email: z.string().max(320).email().optional(),
  address: z.string().min(1).max(500),
  city: z.string().min(1).max(500),
  postal_code: z.string().max(50).optional(),
  district: z.string().max(500).optional(),
  // Optional here so an unresolved international country still submits and the
  // backend's own "country_id is required." message can surface in the toast.
  country_id: z.number().int().positive().optional(),
});

const OrderItemSchema = z.object({
  product_id: z.number().int().positive(),
  quantity: z.number().int().min(1),
  variant_id: z.number().int().positive().optional(),
  price: z.number().finite().min(0).optional(),
  bundle_id: z.number().int().positive().optional(),
  bundle_tier_id: z.number().int().positive().optional(),
});

export const PurchaseOrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1),
  shipping_address: ShippingAddressSchema,
  payment_method: z.enum(["cod"]),
  shipping_method: z.enum(["standard", "express", "overnight"]),
  shipping_cost: z.number().finite().min(0),
  notes: z.string().max(1000).optional(),
  bundle_id: z.number().int().positive().optional(),
  bundle_tier_id: z.number().int().positive().optional(),
  server_quote_id: z.string().max(200).optional(),
});

export interface PurchaseOrderResponse {
  success: boolean;
  message?: string;
  data?: {
    order_id?: number;
    order_number?: string;
    order_tracking_number?: string;
    amount?: number;
    payment_method?: string;
    status?: string;
    [key: string]: unknown;
  };
  error?: string;
}

// Component form data. The BD checkout collects name, phone, city, address; the
// international (global template) checkout also uses `country` and `zip`.
export interface FormData {
  name: string;
  phone: string;
  address: string;
  city: string;
  cityId?: number;
  /** International only: destination country name. */
  country?: string;
  /** International only: postal / ZIP code. */
  zip?: string;
}

/** Documented payment method key for cash on delivery. */
export type PaymentMethod = "cod";

export type ShippingMethod = "standard" | "express" | "overnight";

export interface ShippingAddressFormProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string | number) => void;
}

export interface OrderSummaryProps {
  isProcessing: boolean;
  onSubmit: () => void;
  shippingCost?: number;
  estimatedDelivery?: number;
  subtotal?: number;
  tax?: number;
  total?: number;
}

// Form validation types
export interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;

export function validatePhoneNumber(phone: string): boolean {
  return BD_PHONE_REGEX.test(phone.replace(/\D/g, ""));
}

export function validateFormData(formData: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!formData.name?.trim()) errors.name = "checkout.errors.nameRequired";

  if (!formData.phone?.trim()) {
    errors.phone = "checkout.errors.phoneRequired";
  } else if (!validatePhoneNumber(formData.phone)) {
    errors.phone = "checkout.errors.phoneBD";
  }

  if (!formData.city?.trim()) errors.city = "checkout.errors.cityRequired";
  if (!formData.address?.trim())
    errors.address = "checkout.errors.addressRequired";

  return errors;
}

// International checkout validation: country required, city/postcode are
// free-text, and the phone is already normalized to E.164 by the form (so we
// only sanity-check its digit length here).
export function validateInternationalFormData(formData: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!formData.name?.trim()) errors.name = "checkout.errors.nameRequired";

  if (!formData.phone?.trim()) {
    errors.phone = "checkout.errors.phoneRequired";
  } else if (formData.phone.replace(/\D/g, "").length < 6) {
    errors.phone = "global.auth.invalidPhone";
  }

  if (!formData.country?.trim())
    errors.country = "checkout.errors.countryRequired";
  if (!formData.city?.trim()) errors.city = "checkout.errors.cityRequired";
  if (!formData.address?.trim())
    errors.address = "checkout.errors.addressRequired";

  return errors;
}

export function hasFormErrors(errors: FormErrors): boolean {
  return Object.values(errors).some((e) => e);
}
