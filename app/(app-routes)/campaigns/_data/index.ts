import { ApiClient } from "@/lib/api-client";
import { API_ROUTES } from "@/lib/api-route";
import { CACHE_TIMES } from "@/lib/enums";
import type {
	CampaignApiData,
	CampaignApiResponse,
	CampaignConfig,
	CampaignListApiResponse,
} from "./types";

/** Strip HTML tags (some fields, e.g. product tagline, arrive as HTML). */
function stripHtml(value?: string): string | undefined {
	if (!value) return value;
	return value
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

/** A campaign only renders while active and inside its schedule window. */
function isLive(
	status: string,
	startsAt?: string | null,
	endsAt?: string | null,
): boolean {
	if (status !== "active") return false;
	const now = Date.now();
	if (startsAt) {
		const start = new Date(startsAt).getTime();
		if (!Number.isNaN(start) && start > now) return false;
	}
	if (endsAt) {
		const end = new Date(endsAt).getTime();
		if (!Number.isNaN(end) && end < now) return false;
	}
	return true;
}

/** Map the snake_case API payload onto the camelCase view model. */
function mapCampaign(d: CampaignApiData): CampaignConfig {
	return {
		slug: d.slug,
		brand: d.brand,
		headline: d.headline,
		subheadline: d.subheadline,
		heroImage: d.hero_image,
		heroBullets: d.hero_bullets ?? [],
		countdownMinutes: d.countdown_minutes,
		countdownMessage: d.countdown_message,
		trustBadges: d.trust_badges ?? [],
		benefits: d.benefits ?? [],
		personas: d.personas ?? [],
		testimonials: d.testimonials ?? [],
		averageRating: d.average_rating,
		totalReviews: d.total_reviews,
		product: {
			id: d.product.id,
			name: d.product.name,
			tagline: stripHtml(d.product.tagline),
			image: d.product.image,
			gallery: d.product.gallery,
			originalPrice: d.product.original_price,
			offerPrice: d.product.offer_price,
			stock: d.product.stock,
			tax: d.product.tax,
			taxType: d.product.tax_type,
		},
		bonuses: d.bonuses ?? [],
		offerLimitedNote: d.offer_limited_note,
		faqs: d.faqs ?? [],
		// SEO fields are optional in the API; fall back to the visible copy.
		seoTitle: d.seo_title || d.headline,
		seoDescription: d.seo_description || d.subheadline,
	};
}

/**
 * Fetch a single campaign by slug. Returns `null` when the campaign does not
 * exist or is not live — callers must render a not-found state, never a demo.
 */
export async function getCampaign(
	slug: string,
): Promise<CampaignConfig | null> {
	const response = await new ApiClient(API_ROUTES.CAMPAIGNS.DETAILS(slug))
		.withMethod("GET")
		.withCache(["campaigns", `campaign:${slug}`], CACHE_TIMES.ONE_HOUR)
		.execute<CampaignApiResponse>();

	if (!response.success || !response.data) return null;

	const data = response.data;
	if (!isLive(data.status, data.starts_at, data.ends_at)) return null;

	return mapCampaign(data);
}

/**
 * Slugs of live campaigns, used to pre-render campaign pages. Degrades to an
 * empty list on failure so the build still succeeds.
 */
export async function listCampaignSlugs(): Promise<string[]> {
	const response = await new ApiClient(API_ROUTES.CAMPAIGNS.LIST)
		.withMethod("GET")
		.withCache(["campaigns"], CACHE_TIMES.ONE_HOUR)
		.execute<CampaignListApiResponse>();

	if (!response.success || !Array.isArray(response.data)) return [];

	return response.data
		.filter((c) => isLive(c.status, c.starts_at, c.ends_at))
		.map((c) => c.slug);
}
