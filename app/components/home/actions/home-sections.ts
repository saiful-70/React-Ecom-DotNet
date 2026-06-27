"use server";

import { ApiClient } from "@/lib/api-client";
import { API_ROUTES } from "@/lib/api-route";
import { CACHE_TIMES } from "@/lib/enums";
import type {
	Banner,
	BannersApiResponse,
	FeaturedCategory,
	FeaturedCategoriesApiResponse,
} from "@/components/home/_data/types";

/**
 * Returns true while `now` falls inside a banner's schedule window.
 * Backend timestamps carry no timezone (e.g. "2026-06-25T18:00:00"); we treat
 * them as wall-clock and compare against the same `Date.now()` reference.
 */
function isWithinSchedule(banner: Banner, now: number): boolean {
	if (banner.starts_at) {
		const start = new Date(banner.starts_at).getTime();
		if (!Number.isNaN(start) && start > now) return false;
	}
	if (banner.ends_at) {
		const end = new Date(banner.ends_at).getTime();
		if (!Number.isNaN(end) && end < now) return false;
	}
	return true;
}

/**
 * Hero carousel slides from `GET /banners`. Only active, in-schedule banners
 * are returned, sorted by `sort_order`. Failures degrade to an empty list so
 * the homepage still renders.
 */
export async function getBanners(): Promise<Banner[]> {
	const response = await new ApiClient(API_ROUTES.HOME.BANNERS)
		.withMethod("GET")
		.withCache(["banners"], CACHE_TIMES.ONE_HOUR)
		.execute<BannersApiResponse>();

	if (!response.success || !Array.isArray(response.data)) return [];

	const now = Date.now();
	return response.data
		.filter((b) => b.status === "active" && isWithinSchedule(b, now))
		.sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * Tiles from `GET /featured-categories`. Only active categories are returned,
 * sorted by `sort_order`. Failures degrade to an empty list.
 */
export async function getFeaturedCategories(): Promise<FeaturedCategory[]> {
	const response = await new ApiClient(API_ROUTES.HOME.FEATURED_CATEGORIES)
		.withMethod("GET")
		.withCache(["featured-categories"], CACHE_TIMES.ONE_HOUR)
		.execute<FeaturedCategoriesApiResponse>();

	if (!response.success || !Array.isArray(response.data)) return [];

	return response.data
		.filter((c) => c.status === "active")
		.sort((a, b) => a.sort_order - b.sort_order);
}
