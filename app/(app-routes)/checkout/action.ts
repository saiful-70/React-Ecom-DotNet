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
 * Server action: Fetch shipping cost by country ID and city ID
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
      .execute<ShippingCostResponse>();

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

    return response;
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
      return {
        success: false,
        error: "Invalid input",
      };
    }

    const response = await new ApiClient(API_ROUTES.ORDER.PURCHASE_ORDER)
      .withMethod("POST")
      .withBody(parsed.data)
      .withCookieHeaders(await cookies())
      .execute<PurchaseOrderResponse>();
    if (!response.success) {
      return {
        success: false,
        error: response.message || "Failed to create order",
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
  return new ApiClient(API_ROUTES.PAYMENT_METHOD.STRIPE)
    .withMethod("POST")
    .withBody({
      order_id: orderId
    })
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
