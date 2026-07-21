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

// Types for checkout addresses
export interface ShippingAddress {
  contact_person_name: string;
  phone: string;
  email: string;
  address_type: string;
  country: string;
  city: string;
  zip_code: string;
  address: string;
  is_billing: boolean;
}

// Country type
export interface Country {
  id: number;
  name: string;
  code: string;
}

// City type
export interface City {
  id: number;
  name: string;
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

export interface BillingAddress {
  contact_person_name: string;
  phone: string;
  email: string;
  address_type: string;
  country: string;
  city: string;
  zip_code: string;
  address: string;
}

// Order item type
export interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
  variant_id: number;
}

// Cart item interface for type safety
export interface CartItem {
  id: number;
  quantity: number;
  price: number;
  variant_id?: number;
}

// Purchase order request and response types
export interface PurchaseOrderRequest {
  total_price: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  shipping_method: ShippingMethod;
  shipping_cost: number;
  shipping_duration: number;
  total_vat_amount: number;
  shipping_address: ShippingAddress;
  billing_address: BillingAddress;
  order_items: OrderItem[];
}

export interface PurchaseOrderResponse {
  success: boolean;
  message?: string;
  data?: {
    id: number;
    order_tracking_number?: string;
    status: string;
    total: number;
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

export type PaymentMethod = "cash_on_delivery";

export type ShippingMethod = "standard" | "express" | "overnight";

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

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
