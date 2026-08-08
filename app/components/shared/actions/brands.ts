"use server";

import { ApiClient } from "@/lib/api-client";
import { API_ROUTES } from "@/lib/api-route";
import { CACHE_TIMES } from "@/lib/enums";
import type { BrandsResponse } from "../models/brand";

export async function getAllBrands(): Promise<BrandsResponse> {
  const client = new ApiClient(API_ROUTES.PRODUCTS.BRANDS).withMethod("GET");

  const response = await client
    .withCache(["brands"], CACHE_TIMES.VERY_SHORT_TIME)
    .execute<BrandsResponse>();

  if (response.success && response.data) {
    return {
      success: true,
      message: response.message,
      data: response.data,
    };
  }

  return {
    success: false,
    message: response.message || "Failed to fetch brands",
    data: [],
  };
}
