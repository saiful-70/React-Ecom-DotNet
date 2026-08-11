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

export async function getStripeRedirectLink(
  orderId: number
) {
  // Documented gateway route (`POST /payments/stripe/initiate`) requires JWT,
  // so forward the auth cookie like every other authenticated call.
  return new ApiClient(API_ROUTES.PAYMENT_METHOD.STRIPE_INITIATE)
    .withMethod("POST")
    .withBody({
      order_id: orderId
    })
    .withCookieHeaders(await cookies())
    .execute<{
      success: boolean;
      data: string;
      message: string;
    }>();
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
