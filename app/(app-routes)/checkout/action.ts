"use server";

import { ApiClient } from "@/lib/api-client";
import { API_ROUTES } from "@/lib/api-route";
import { cookies } from "next/headers";
import { PurchaseOrderSchema } from "./model";
import type {
  PurchaseOrderRequest,
  PurchaseOrderResponse,
  CountriesResponse,
  CitiesResponse,
  ShippingCostResponse,
  CheckoutDataRequestItem,
  CheckoutDataResponse,
  CheckoutDataProduct,
  GatewayPaymentMethod,
  GatewayRedirect,
  PaypalCaptureData,
  PaypalInitiateData,
  StripeInitiateData,
} from "./model";

/**
 * Server action: Fetch all countries
 */
export async function getCountries(): Promise<CountriesResponse> {
  try {
    const response = await new ApiClient(API_ROUTES.CHECKOUT.COUNTRIES)
      .withMethod("GET")
      .execute<CountriesResponse>();

    if (!response.success) {
      return {
        success: false,
        message: response.message || "Failed to fetch countries",
        data: [],
      };
    }

    return response;
  } catch (error) {
    console.error("Error fetching countries:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while fetching countries",
      data: [],
    };
  }
}

/**
 * Server action: Fetch cities by country ID
 */
export async function getCities(countryId: number): Promise<CitiesResponse> {
  try {
    const response = await new ApiClient(API_ROUTES.CHECKOUT.CITIES(countryId))
      .withMethod("GET")
      .execute<CitiesResponse>();

    if (!response.success) {
      return {
        success: false,
        message: response.message || "Failed to fetch cities",
        data: [],
      };
    }

    return response;
  } catch (error) {
    console.error("Error fetching cities:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while fetching cities",
      data: [],
    };
  }
}

/**
 * Server action: Fetch shipping cost by country ID and city ID.
 *
 * The live endpoint answers in camelCase (`shippingCost`, `freeShippingOver`,
 * `estDeliveryDays`) while the docs show snake_case — normalize both here so
 * callers always read the documented snake_case shape.
 */
export async function getShippingCost(
  countryId: number,
  cityId: number
): Promise<ShippingCostResponse> {
  try {
    const response = await new ApiClient(
      API_ROUTES.CHECKOUT.SHIPPING_COST(countryId, cityId)
    )
      .withMethod("GET")
      .execute<{
        success: boolean;
        message: string;
        data?: Record<string, unknown>;
      }>();

    if (!response.success) {
      return {
        success: false,
        message: response.message || "Failed to fetch shipping cost",
        data: {
          country_id: countryId,
          city_id: cityId,
          shipping_method: "Standard",
          shipping_cost: 0,
          est_delivery_days: 0,
          free_shipping_over: 0,
        },
      };
    }

    const raw = response.data ?? {};
    const pick = (snake: string, camel: string): unknown =>
      raw[snake] ?? raw[camel];
    const toNum = (value: unknown): number => {
      const n = typeof value === "string" ? Number(value) : (value as number);
      return typeof n === "number" && Number.isFinite(n) ? n : 0;
    };

    return {
      success: true,
      message: response.message,
      data: {
        country_id: toNum(pick("country_id", "countryId")) || countryId,
        city_id: toNum(pick("city_id", "cityId")) || cityId,
        shipping_method:
          (pick("shipping_method", "shippingMethod") as string) ?? "",
        shipping_cost: toNum(pick("shipping_cost", "shippingCost")),
        est_delivery_days: toNum(pick("est_delivery_days", "estDeliveryDays")),
        free_shipping_over: toNum(
          pick("free_shipping_over", "freeShippingOver")
        ),
      },
    };
  } catch (error) {
    console.error("Error fetching shipping cost:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while fetching shipping cost",
      data: {
        country_id: countryId,
        city_id: cityId,
        shipping_method: "Standard",
        shipping_cost: 0,
        est_delivery_days: 0,
        free_shipping_over: 0,
      },
    };
  }
}

/**
 * Server action: Create a purchase order by posting prepared data to the API.
 * All data transformation and calculation should be done on the client side.
 */
export async function createPurchaseOrder(
  orderData: PurchaseOrderRequest
): Promise<PurchaseOrderResponse> {
  try {
    const parsed = PurchaseOrderSchema.safeParse(orderData);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return {
        success: false,
        error: first
          ? `Invalid input: ${first.path.join(".")} — ${first.message}`
          : "Invalid input",
      };
    }

    const response = await new ApiClient(API_ROUTES.ORDER.PURCHASE_ORDER)
      .withMethod("POST")
      .withBody(parsed.data)
      .withCookieHeaders(await cookies())
      .execute<PurchaseOrderResponse & { errors?: Record<string, unknown> }>();
    if (!response.success) {
      // Full request/response dump on the Next server console so a generic
      // backend message ("Something went wrong") can be diagnosed. Shows in
      // the terminal running `npm run dev` / the server logs.
      console.error("[purchase-order] backend rejected the order", {
        request: parsed.data,
        message: response.message,
        errors: response.errors,
      });

      const errorEntries =
        response.errors && typeof response.errors === "object"
          ? Object.entries(response.errors)
          : [];
      const detail =
        errorEntries.length > 0
          ? ` (${errorEntries
              .map(([field, msg]) =>
                `${field}: ${Array.isArray(msg) ? msg.join(", ") : String(msg)}`
              )
              .join("; ")})`
          : "";

      return {
        success: false,
        error: `${response.message || "Failed to create order"}${detail}`,
      };
    }

    return {
      success: true,
      data: response.data,
      message: response.message || "Order created successfully",
    };
  } catch (error) {
    console.error("Error creating purchase order:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An error occurred while creating the order",
    };
  }
}

/**
 * Pull a redirect URL out of a gateway response.
 *
 * The documented shape is `data: { checkout_url }` / `data: { approval_url }`,
 * but the legacy Stripe route answered with the URL as a bare `data` string
 * and some builds put it at the top level. Accept all three rather than fail
 * the payment on a field-name mismatch.
 */
function extractRedirectUrl(
  payload: unknown,
  ...keys: string[]
): string | undefined {
  if (typeof payload === "string") {
    return payload.startsWith("http") ? payload : undefined;
  }
  if (!payload || typeof payload !== "object") return undefined;
  const record = payload as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.startsWith("http")) return value;
  }
  return undefined;
}

/**
 * Server action: start a Stripe Checkout session for an already-created order.
 *
 * `POST /payments/stripe/initiate` requires JWT, so the auth cookie is
 * forwarded like every other authenticated call. Payment is confirmed by the
 * Stripe webhook server-side — the browser return page is display only.
 */
export async function initiateStripePayment(
  orderId: number
): Promise<GatewayRedirect> {
  try {
    const response = await new ApiClient(
      API_ROUTES.PAYMENT_METHOD.STRIPE_INITIATE
    )
      .withMethod("POST")
      .withBody({ order_id: orderId })
      .withCookieHeaders(await cookies())
      .execute<{
        success: boolean;
        data?: StripeInitiateData | string;
        message?: string;
      }>();

    if (!response.success) {
      return {
        success: false,
        message: response.message || "Failed to start the Stripe payment",
      };
    }

    const redirectUrl =
      extractRedirectUrl(response.data, "checkout_url", "url", "redirect_url") ??
      extractRedirectUrl(response, "checkout_url");

    if (!redirectUrl) {
      console.error("[stripe/initiate] no checkout_url in response", response);
      return {
        success: false,
        message: response.message || "Stripe did not return a checkout URL",
      };
    }

    return { success: true, redirectUrl, message: response.message };
  } catch (error) {
    console.error("Error initiating Stripe payment:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while starting the Stripe payment",
    };
  }
}

/**
 * Server action: start a PayPal order for an already-created order.
 *
 * Returns the approval URL plus the `paypal_order_id`, which the return page
 * needs for the mandatory capture call.
 */
export async function initiatePaypalPayment(
  orderId: number
): Promise<GatewayRedirect> {
  try {
    const response = await new ApiClient(
      API_ROUTES.PAYMENT_METHOD.PAYPAL_INITIATE
    )
      .withMethod("POST")
      .withBody({ order_id: orderId })
      .withCookieHeaders(await cookies())
      .execute<{
        success: boolean;
        data?: PaypalInitiateData | string;
        message?: string;
      }>();

    if (!response.success) {
      return {
        success: false,
        message: response.message || "Failed to start the PayPal payment",
      };
    }

    const redirectUrl =
      extractRedirectUrl(response.data, "approval_url", "url", "redirect_url") ??
      extractRedirectUrl(response, "approval_url");

    if (!redirectUrl) {
      console.error("[paypal/initiate] no approval_url in response", response);
      return {
        success: false,
        message: response.message || "PayPal did not return an approval URL",
      };
    }

    const data =
      response.data && typeof response.data === "object" ? response.data : {};
    const paypalOrderId =
      typeof data.paypal_order_id === "string" ? data.paypal_order_id : undefined;

    return { success: true, redirectUrl, paypalOrderId, message: response.message };
  } catch (error) {
    console.error("Error initiating PayPal payment:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while starting the PayPal payment",
    };
  }
}

/**
 * Server action: capture an approved PayPal order.
 *
 * PayPal only AUTHORISES on approval — without this call the money is never
 * taken. The return page must call it before showing a success state.
 *
 * ASSUMPTION (unconfirmed against the backend guide): the body is
 * `{ order_id, paypal_order_id }`. Both ids are sent so the backend can key on
 * whichever it expects.
 */
export async function capturePaypalPayment(params: {
  orderId?: number;
  paypalOrderId?: string;
}): Promise<{
  success: boolean;
  message?: string;
  data?: PaypalCaptureData;
}> {
  const { orderId, paypalOrderId } = params;

  if (orderId == null && !paypalOrderId) {
    return { success: false, message: "Missing PayPal order reference" };
  }

  try {
    const response = await new ApiClient(
      API_ROUTES.PAYMENT_METHOD.PAYPAL_CAPTURE
    )
      .withMethod("POST")
      .withBody({
        ...(orderId != null ? { order_id: orderId } : {}),
        ...(paypalOrderId ? { paypal_order_id: paypalOrderId } : {}),
      })
      .withCookieHeaders(await cookies())
      .execute<{
        success: boolean;
        data?: PaypalCaptureData;
        message?: string;
      }>();

    if (!response.success) {
      console.error("[paypal/capture] backend rejected the capture", {
        orderId,
        paypalOrderId,
        message: response.message,
      });
      return {
        success: false,
        message: response.message || "PayPal payment could not be captured",
      };
    }

    return { success: true, data: response.data, message: response.message };
  } catch (error) {
    console.error("Error capturing PayPal payment:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while capturing the PayPal payment",
    };
  }
}

/**
 * Start a hosted-gateway payment for an order, dispatching on the method the
 * buyer picked at checkout.
 */
export async function initiateGatewayPayment(
  method: GatewayPaymentMethod,
  orderId: number
): Promise<GatewayRedirect> {
  return method === "paypal"
    ? initiatePaypalPayment(orderId)
    : initiateStripePayment(orderId);
}

/**
 * Server action: Fetch checkout data with actual prices and tax from server
 * This should be called when proceeding to checkout to get current prices
 */
export async function getCheckoutData(
  items: CheckoutDataRequestItem[]
): Promise<CheckoutDataResponse> {
  try {
    // API returns { products: [...] } directly without success wrapper.
    // Forward visitor cookies so the backend logs the CheckoutStarted event.
    const response = await new ApiClient(API_ROUTES.CHECKOUT.CHECKOUT_DATA)
      .withMethod("POST")
      .withBody(items)
      .withCookieHeaders(await cookies())
      .execute<{ products: CheckoutDataProduct[] }>();

    // The API returns products array directly at root level
    const products = response.products || [];

    if (products.length === 0) {
      return {
        success: false,
        message: "No products found in checkout data",
      };
    }

    return {
      success: true,
      data: {
        products,
      },
    };
  } catch (error) {
    console.error("Error fetching checkout data:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while fetching checkout data",
    };
  }
}
