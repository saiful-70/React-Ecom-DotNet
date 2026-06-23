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
	taxType?: "include" | "exclude";
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
