"use server";

import { ApiClient } from "@/lib/api-client";
import { API_ROUTES } from "@/lib/api-route";
import {
  ProductsResponse,
  SingleProductResponse,
  RawProductsApiResponse,
  RawSingleProductApiResponse,
  RawFeaturedProductsApiResponse,
  Product,
} from "./model";
import { findProductBundle } from "@/lib/bundles/mock";
import type { Bundle } from "@/lib/bundles/types";

// Fetch Featured Products
async function fetchFeaturedProductsFromAPI(
  per_page: number = 12,
): Promise<ProductsResponse> {
  const response = await new ApiClient(API_ROUTES.HOME.FEATURED)
    .withMethod("GET")
    .withParams({ per_page })
    .execute<RawFeaturedProductsApiResponse>();

  // Normalize response - some endpoints return data directly as array
  if (response.success && Array.isArray(response.data)) {
    return {
      success: true,
      message: response.message,
      data: {
        products: response.data,
        meta: {
          current_page: 1,
          per_page: per_page,
          total: response.data.length,
          last_page: 1,
          from: 1,
          to: response.data.length,
        },
      },
    };
  }

  // Fallback for unexpected response structure
  return {
    success: false,
    message: "Failed to fetch featured products",
    data: {
      products: [],
      meta: {
        current_page: 1,
        per_page: per_page,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0,
      },
    },
  };
}

// Fetch Top Selling Products
async function fetchTopSellingProductsFromAPI(
  per_page: number = 12,
): Promise<ProductsResponse> {
  const response = await new ApiClient(API_ROUTES.HOME.TOP_SELLING)
    .withMethod("GET")
    .withParams({ per_page })
    .execute<RawFeaturedProductsApiResponse>();

  // Normalize response - some endpoints return data directly as array
  if (response.success && Array.isArray(response.data)) {
    return {
      success: true,
      message: response.message,
      data: {
        products: response.data,
        meta: {
          current_page: 1,
          per_page: per_page,
          total: response.data.length,
          last_page: 1,
          from: 1,
          to: response.data.length,
        },
      },
    };
  }

  // Fallback for unexpected response structure
  return {
    success: false,
    message: "Failed to fetch top selling products",
    data: {
      products: [],
      meta: {
        current_page: 1,
        per_page: per_page,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0,
      },
    },
  };
}

// Fetch Today Deal Products
async function fetchTodayDealProductsFromAPI(
  per_page: number = 12,
): Promise<ProductsResponse> {
  const response = await new ApiClient(API_ROUTES.HOME.TODAY_DEAL)
    .withMethod("GET")
    .withParams({ per_page })
    .execute<RawFeaturedProductsApiResponse>();

  // Normalize response - some endpoints return data directly as array
  if (response.success && Array.isArray(response.data)) {
    return {
      success: true,
      message: response.message,
      data: {
        products: response.data,
        meta: {
          current_page: 1,
          per_page: per_page,
          total: response.data.length,
          last_page: 1,
          from: 1,
          to: response.data.length,
        },
      },
    };
  }

  // Fallback for unexpected response structure
  return {
    success: false,
    message: "Failed to fetch today deal products",
    data: {
      products: [],
      meta: {
        current_page: 1,
        per_page: per_page,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0,
      },
    },
  };
}

export const getFeaturedProducts = async (per_page: number = 12) => {
  return await fetchFeaturedProductsFromAPI(per_page);
};

export const getTopSellingProducts = async (per_page: number = 12) => {
  return await fetchTopSellingProductsFromAPI(per_page);
};

export const getTodayDealProducts = async (per_page: number = 12) => {
  return await fetchTodayDealProductsFromAPI(per_page);
};

// Fetch All Products with filters
interface ProductsQuery {
  per_page?: number;
  page?: number;
  category_id?: number;
  brand_id?: number | number[];
  sort?: string;
  is_featured?: number;
  today_deal?: number;
  rating?: number;
  search_key?: string;
  top_selling?: number;
}

export async function getAllProducts(
  query?: ProductsQuery,
): Promise<ProductsResponse> {
  const client = new ApiClient(API_ROUTES.PRODUCTS.BASE_URL).withMethod("GET");

  if (query) {
    client.withParams(
      query as Record<string, string | number | boolean | string[]>,
    );
  }

  const response = await client.execute<RawProductsApiResponse>();

  // Normalize response - /products endpoint returns data as array directly
  // while meta is at root level
  if (response.success && Array.isArray(response.data)) {
    return {
      success: true,
      message: response.message,
      data: {
        products: response.data,
        meta: response.meta, // Meta is at root level in this endpoint
      },
    };
  }

  // If response structure is already correct or failed, return normalized error
  return {
    success: false,
    message: response.message || "Failed to fetch products",
    data: {
      products: [],
      meta: {
        current_page: 1,
        per_page: 0,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0,
      },
    },
  };
}

// Fetch Single Product by ID
export async function getProductDetails(
  id: number,
): Promise<SingleProductResponse> {
  const response = await new ApiClient(API_ROUTES.PRODUCTS.DETAILS(id))
    .withMethod("GET")
    .execute<RawSingleProductApiResponse>();

  // Normalize response - /product-details endpoint returns product directly in data
  if (response.success && response.data && typeof response.data === "object") {
    return {
      success: true,
      message: response.message,
      data: {
        product: response.data, // Wrap product in nested structure
      },
    };
  }

  // If response failed, return normalized error
  return {
    success: false,
    message: response.message || "Failed to fetch product details",
    data: {
      product: {} as Product, // Empty product object for failed response
    },
  };
}

// Fetch the quantity bundle attached to a product's PDP (null when none).
//
// Reads mock data until the backend implements the bundle contract; the real
// implementation will call the API (inline on product-details, or a dedicated
// endpoint). Keep the signature stable so the PDP wiring never changes.
export async function getProductBundle(id: number): Promise<Bundle | null> {
  return findProductBundle(Number(id));
}
