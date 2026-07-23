import { Metadata } from "next";
import { API_CONFIG } from "../config/api.config";
import { BusinessSettingsModel } from "@/components/shared/types/BusinessSettingModel";

/**
 * SEO Utilities for E-commerce Platform
 * Provides reusable functions for generating meta tags, structured data, and SEO-optimized content
 */

// Base URL from environment or fallback
const SITE_URL = API_CONFIG.SITE_URL;

// Helper to get business setting or fallback
function getBusinessValue(
	businessSettings: BusinessSettingsModel | undefined,
	key: keyof BusinessSettingsModel,
	fallback: string
): string {
	return businessSettings?.[key] || fallback;
}

/**
 * Generate base metadata for pages with business settings support
 */
export interface BaseMetadataParams {
	title: string;
	description: string;
	keywords?: string[];
	image?: string;
	url?: string;
	noIndex?: boolean;
	type?: "website" | "article";
	businessSettings?: BusinessSettingsModel;
}

export function generateMetadata({
	title,
	description,
	keywords = [],
	image = "/og-image.jpg",
	url,
	noIndex = false,
	type = "website",
	businessSettings,
}: BaseMetadataParams): Metadata {
	const siteName = getBusinessValue(
		businessSettings,
		"site_name",
		"DebuggerMind"
	);
	const fullTitle = title.includes(siteName)
		? title
		: `${title} | ${siteName}`;
	const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL;

	// Use business settings image if available
	const businessImage =
		businessSettings?.hero_image || businessSettings?.header_logo;
	const defaultImage = businessImage || image;
	const imageUrl = defaultImage.startsWith("http")
		? defaultImage
		: `${SITE_URL}${defaultImage}`;

	// Get favicon from business settings
	const favicon = businessSettings?.favicon;
	const faviconUrl = favicon ? favicon : "/favicon.ico";

	return {
		title: fullTitle,
		description,
		keywords: keywords.length > 0 ? keywords : undefined,
		metadataBase: new URL(SITE_URL),
		icons: {
			icon: [
				{ rel: "icon", url: faviconUrl },
				{
					rel: "icon",
					url: faviconUrl,
					sizes: "16x16",
					type: "image/png",
				},
				{
					rel: "icon",
					url: faviconUrl,
					sizes: "32x32",
					type: "image/png",
				},
			],
			shortcut: faviconUrl,
			apple: [
				{ rel: "icon", url: faviconUrl },
				{
					rel: "icon",
					url: faviconUrl,
					sizes: "180x180",
					type: "image/png",
				},
			],
			other: [
				{
					rel: "icon",
					type: "image/x-icon",
					url: faviconUrl,
				},
			],
		},
		alternates: {
			canonical: url || "/",
		},
		openGraph: {
			type: type,
			locale: "en_US",
			alternateLocale: ["bn_BD", "hi_IN", "es_ES", "fr_FR", "ar_SA"],
			url: fullUrl,
			title: fullTitle,
			description,
			siteName,
			images: [
				{
					url: imageUrl,
					width: 1200,
					height: 630,
					alt: title,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: fullTitle,
			description,
			images: [imageUrl],
		},
		robots: noIndex
			? {
				index: false,
				follow: true,
				nocache: true,
			}
			: {
				index: businessSettings?.maintenance_mode !== "1",
				follow: businessSettings?.maintenance_mode !== "1",
				googleBot: {
					index: businessSettings?.maintenance_mode !== "1",
					follow: businessSettings?.maintenance_mode !== "1",
					"max-video-preview": -1,
					"max-image-preview": "large",
					"max-snippet": -1,
				},
			},
	};
}

/**
 * Product-specific metadata generator
 */
export interface ProductMetadataParams {
	name: string;
	description: string;
	price: number;
	currency?: string;
	image?: string;
	slug: string;
	brand?: string;
	category?: string;
	inStock?: boolean;
	rating?: number;
	reviewCount?: number;
	businessSettings?: BusinessSettingsModel;
}

export function generateProductMetadata({
	name,
	description,
	image = "/og-product.jpg",
	slug,
	brand,
	category,
	businessSettings,
}: ProductMetadataParams): Metadata {
	const siteName = getBusinessValue(
		businessSettings,
		"site_name",
		"DebuggerMind"
	);
	const cleanDescription = description.replace(/<[^>]*>/g, "").slice(0, 160);
	const keywords = [
		name,
		brand,
		category,
		"buy online",
		"shop",
		siteName,
	].filter(Boolean) as string[];

	return generateMetadata({
		title: name,
		description: cleanDescription,
		keywords,
		image,
		url: `/products/${slug}`,
		type: "article",
		businessSettings,
	});
}

/**
 * Structured Data Generators (JSON-LD)
 */

export interface ProductStructuredData {
	id?: string | number;
	name: string;
	description: string;
	image: string;
	sku?: string;
	brand?: string;
	price: number;
	currency?: string;
	availability?: "InStock" | "OutOfStock" | "PreOrder";
	rating?: number;
	reviewCount?: number;
	url: string;
}

export function generateProductSchema(product: ProductStructuredData) {
	const schema = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.name,
		description: product.description.replace(/<[^>]*>/g, ""),
		image: product.image.startsWith("http")
			? product.image
			: `${SITE_URL}${product.image}`,
		sku: product.sku || (product.id !== undefined ? String(product.id) : product.url),
		brand: product.brand
			? {
				"@type": "Brand",
				name: product.brand,
			}
			: undefined,
		offers: {
			"@type": "Offer",
			url: product.url.startsWith("http")
				? product.url
				: `${SITE_URL}${product.url}`,
			priceCurrency: product.currency || "BDT",
			price: product.price,
			availability: `https://schema.org/${product.availability || "InStock"
				}`,
			seller: {
				"@type": "Organization",
				name: "DebuggerMind",
			},
		},
		aggregateRating:
			product.rating && product.reviewCount
				? {
					"@type": "AggregateRating",
					ratingValue: product.rating,
					reviewCount: product.reviewCount,
				}
				: undefined,
	};

	return schema;
}

export interface BreadcrumbItem {
	name: string;
	url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: item.url.startsWith("http")
				? item.url
				: `${SITE_URL}${item.url}`,
		})),
	};
}

export function generateOrganizationSchema(
	businessSettings?: BusinessSettingsModel
) {
	const siteName = getBusinessValue(
		businessSettings,
		"site_name",
		"DebuggerMind"
	);
	const contactPhone = getBusinessValue(
		businessSettings,
		"contact_phone",
		"+880-1234-567890"
	);
	const contactEmail = getBusinessValue(
		businessSettings,
		"contact_email",
		"support@debuggermind.com"
	);
	const address = getBusinessValue(
		businessSettings,
		"address",
		"Dhaka, Bangladesh"
	);
	const logo = getBusinessValue(businessSettings, "header_logo", "/logo.png");

	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: siteName,
		url: SITE_URL,
		logo: logo.startsWith("http") ? logo : `${SITE_URL}${logo}`,
		contactPoint: {
			"@type": "ContactPoint",
			telephone: contactPhone,
			email: contactEmail,
			contactType: "Customer Service",
			availableLanguage: ["en", "bn", "es", "fr", "hi", "ar"],
		},
		address: {
			"@type": "PostalAddress",
			addressLocality: address,
		},
		sameAs: [
			// Add social media URLs if available in business settings
		],
	};
}

export function generateWebsiteSchema(
	businessSettings?: BusinessSettingsModel
) {
	const siteName = getBusinessValue(
		businessSettings,
		"site_name",
		"DebuggerMind"
	);

	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: siteName,
		url: SITE_URL,
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
			},
			"query-input": "required name=search_term_string",
		},
	};
}

export interface ReviewStructuredData {
	productName: string;
	reviews: Array<{
		author: string;
		rating: number;
		reviewBody: string;
		datePublished: string;
	}>;
}

export function generateReviewSchema(data: ReviewStructuredData) {
	return {
		"@context": "https://schema.org",
		"@type": "Product",
		name: data.productName,
		review: data.reviews.map((review) => ({
			"@type": "Review",
			author: {
				"@type": "Person",
				name: review.author,
			},
			reviewRating: {
				"@type": "Rating",
				ratingValue: review.rating,
				bestRating: 5,
			},
			reviewBody: review.reviewBody,
			datePublished: review.datePublished,
		})),
	};
}

/**
 * Helper to render JSON-LD script
 */
export function renderStructuredData(data: object) {
	const jsonLd = JSON.stringify(data)
		.replace(/</g, "\\u003c")
		.replace(/>/g, "\\u003e")
		.replace(/&/g, "\\u0026")
		.replace(/ /g, "\\u2028")
		.replace(/ /g, "\\u2029");

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: jsonLd }}
		/>
	);
}

/**
 * Generate sitemap URLs for products
 */
export interface SitemapProduct {
	slug: string;
	updatedAt: string;
	priority?: number;
}

export function generateProductSitemapUrls(products: SitemapProduct[]) {
	return products.map((product) => ({
		url: `${SITE_URL}/products/${product.slug}`,
		lastModified: new Date(product.updatedAt),
		changeFrequency: "weekly" as const,
		priority: product.priority || 0.8,
	}));
}

/**
 * Generate canonical URL
 */
export function getCanonicalUrl(path: string): string {
	const cleanPath = path.replace(/\/$/, ""); // Remove trailing slash
	return `${SITE_URL}${cleanPath}`;
}

/**
 * Sanitize text for SEO (remove HTML tags, limit length)
 */
export function sanitizeForSEO(text: string, maxLength = 160): string {
	const clean = text
		.replace(/<[^>]*>/g, "")
		.replace(/\s+/g, " ")
		.trim();
	return clean.length > maxLength
		? `${clean.slice(0, maxLength - 3)}...`
		: clean;
}

/**
 * Generate keywords from text
 */
export function generateKeywords(...texts: (string | undefined)[]): string[] {
	const keywords = new Set<string>();

	texts.forEach((text) => {
		if (!text) return;
		const words = text
			.toLowerCase()
			.replace(/[^\w\s]/g, "")
			.split(/\s+/);
		words.forEach((word) => {
			if (word.length > 3) keywords.add(word);
		});
	});

	return Array.from(keywords).slice(0, 15);
}

/**
 * Category metadata generator
 */
export interface CategoryMetadataParams {
	name: string;
	description?: string;
	slug: string;
	productCount?: number;
	image?: string;
	businessSettings?: BusinessSettingsModel;
}

export function generateCategoryMetadata({
	name,
	description,
	slug,
	productCount,
	image,
	businessSettings,
}: CategoryMetadataParams): Metadata {
	const siteName = getBusinessValue(
		businessSettings,
		"site_name",
		"DebuggerMind"
	);
	const desc =
		description ||
		`Browse ${productCount || "all"
		} products in ${name} category at ${siteName}`;

	return generateMetadata({
		title: `${name} Products`,
		description: desc,
		keywords: [name, "category", "shop", "buy", siteName],
		image: image || "/og-category.jpg",
		url: `/products?category=${slug}`,
		businessSettings,
	});
}

/**
 * Search results metadata generator
 */
export function generateSearchMetadata(
	query: string,
	businessSettings?: BusinessSettingsModel
): Metadata {
	const siteName = getBusinessValue(
		businessSettings,
		"site_name",
		"DebuggerMind"
	);

	return generateMetadata({
		title: `Search Results for "${query}"`,
		description: `Find products matching "${query}" at ${siteName}`,
		url: `/products?search=${encodeURIComponent(query)}`,
		noIndex: true, // Don't index search results
		businessSettings,
	});
}
