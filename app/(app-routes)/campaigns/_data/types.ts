export interface CampaignBenefit {
	icon: string;
	title: string;
	description?: string;
}

export interface CampaignPersona {
	title: string;
	description: string;
	image?: string;
}

export interface CampaignFAQ {
	question: string;
	answer: string;
}

export interface CampaignTestimonial {
	name: string;
	location?: string;
	rating: number;
	review: string;
	image?: string;
}

export interface CampaignBonus {
	name: string;
	value: number;
	image?: string;
}

export interface CampaignProduct {
	id: number;
	name: string;
	tagline?: string;
	image: string;
	gallery?: string[];
	originalPrice: number;
	offerPrice: number;
	stock: number;
	tax?: number;
	taxType?: string;
}

export interface CampaignTrustBadge {
	icon: string;
	label: string;
	sublabel?: string;
}

export interface CampaignConfig {
	slug: string;
	brand: string;
	headline: string;
	subheadline: string;
	heroImage: string;
	heroBullets: string[];
	countdownMinutes: number;
	countdownMessage: string;
	trustBadges: CampaignTrustBadge[];
	benefits: CampaignBenefit[];
	personas: CampaignPersona[];
	testimonials: CampaignTestimonial[];
	averageRating: number;
	totalReviews: number;
	product: CampaignProduct;
	bonuses?: CampaignBonus[];
	offerLimitedNote?: string;
	faqs: CampaignFAQ[];
	seoTitle: string;
	seoDescription: string;
}

/* ------------------------------------------------------------------ */
/* Raw API shapes (snake_case) from `GET /campaigns` + `/campaigns/{slug}` */
/* ------------------------------------------------------------------ */

export interface CampaignApiProduct {
	id: number;
	name: string;
	tagline?: string;
	image: string;
	gallery?: string[];
	original_price: number;
	offer_price: number;
	stock: number;
	tax?: number;
	tax_type?: string;
}

export interface CampaignApiData {
	slug: string;
	brand: string;
	headline: string;
	subheadline: string;
	hero_image: string;
	hero_bullets?: string[];
	countdown_minutes: number;
	countdown_message: string;
	trust_badges?: CampaignTrustBadge[];
	benefits?: CampaignBenefit[];
	personas?: CampaignPersona[];
	testimonials?: CampaignTestimonial[];
	average_rating: number;
	total_reviews: number;
	product: CampaignApiProduct;
	bonuses?: CampaignBonus[];
	offer_limited_note?: string;
	faqs?: CampaignFAQ[];
	seo_title?: string;
	seo_description?: string;
	status: string;
	starts_at?: string | null;
	ends_at?: string | null;
}

export interface CampaignApiResponse {
	success: boolean;
	message: string;
	data: CampaignApiData | null;
}

export interface CampaignListItem {
	slug: string;
	status: string;
	starts_at?: string | null;
	ends_at?: string | null;
}

export interface CampaignListApiResponse {
	success: boolean;
	message: string;
	data: CampaignListItem[] | null;
}
