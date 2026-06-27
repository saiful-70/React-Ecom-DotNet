/**
 * Types for the homepage hero sections, mapped 1:1 onto the backend responses:
 *  - `GET /banners`            → hero carousel slides
 *  - `GET /featured-categories` → featured categories strip
 *
 * The API serves localized copy directly (Bengali primary), so there are no
 * per-language fields here — the rendered string is whatever the backend sends.
 */

/** Raw banner item as returned by `GET /banners`. */
export interface Banner {
	id: number;
	title: string;
	subtitle: string;
	image_url: string;
	cta_label: string;
	cta_url: string;
	sort_order: number;
	status: "active" | "inactive" | string;
	/** ISO-8601 (no timezone), e.g. "2026-06-25T18:00:00". Null = no start bound. */
	starts_at: string | null;
	/** ISO-8601 (no timezone). Null = never expires. */
	ends_at: string | null;
	created_at: string | null;
	updated_at: string | null;
}

/** Raw featured-category item as returned by `GET /featured-categories`. */
export interface FeaturedCategory {
	id: number;
	category_id: number;
	slug: string;
	name: string;
	icon_url: string;
	sort_order: number;
	status: "active" | "inactive" | string;
}

/** Envelope returned by `GET /banners` (data is the array directly). */
export interface BannersApiResponse {
	success: boolean;
	message: string;
	data: Banner[];
	meta: unknown[];
}

/** Envelope returned by `GET /featured-categories`. */
export interface FeaturedCategoriesApiResponse {
	success: boolean;
	message: string;
	data: FeaturedCategory[];
	meta: unknown[];
}
