"use server";

import { ApiClient } from "@/lib/api-client";
import { API_ROUTES } from "@/lib/api-route";
import type {
  CategoriesQuery,
  CategoriesResponse,
  RawCategoriesApiResponse,
} from "@/components/shared/models/category";
import { CACHE_TIMES } from "@/lib/enums";

export async function getAllCategories(
  query?: CategoriesQuery
): Promise<CategoriesResponse> {
  const client = new ApiClient(API_ROUTES.PRODUCTS.CATEGORIES).withMethod(
    "GET"
  );

  if (query) {
    client.withParams(query as Record<string, string | number | boolean>);
  }

  const response = await client
    .withCache(["categories"], CACHE_TIMES.ONE_HOUR)
    .execute<RawCategoriesApiResponse>();

  // Normalize response - categories endpoint returns data as array directly
  if (response.success && Array.isArray(response.data)) {
    return {
      success: true,
      message: response.message,
      data: {
        categories: response.data,
        meta: {
          current_page: 1,
          per_page: response.data.length,
          total: response.data.length,
          last_page: 1,
          from: 1,
          to: response.data.length,
        },
      },
    };
  }

  // If response structure is already correct or failed, return normalized error
  return {
    success: false,
    message: response.message || "Failed to fetch categories",
    data: {
      categories: [],
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
