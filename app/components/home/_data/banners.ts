import type { HeroBanner } from "./types";

/**
 * Static demo slides for the hero carousel. Replace with data from
 * `GET /banners` once the backend endpoint exists (see docs/api).
 */
export const HERO_BANNERS: HeroBanner[] = [
	{
		id: 1,
		title_bn: "নতুন কালেকশন এসে গেছে",
		title_en: "New Arrivals Are Here",
		subtitle_bn: "সর্বশেষ ট্রেন্ডের পণ্য এখন এক ক্লিকেই — সেরা দামে কিনুন।",
		subtitle_en: "Shop the latest trends across every category at unbeatable prices.",
		image:
			"https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=2070&q=80",
		cta_label_bn: "এখনই কিনুন",
		cta_label_en: "Shop Now",
		cta_href: "/products",
		sort_order: 1,
	},
	{
		id: 2,
		title_bn: "আজকের সেরা অফার",
		title_en: "Today's Best Deals",
		subtitle_bn: "সীমিত সময়ের জন্য বিশাল ছাড় — শেষ হওয়ার আগেই অর্ডার করুন।",
		subtitle_en: "Big discounts for a limited time — grab them before they're gone.",
		image:
			"https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=2070&q=80",
		cta_label_bn: "অফার দেখুন",
		cta_label_en: "Explore Deals",
		cta_href: "/products?today_deal=1",
		sort_order: 2,
	},
	{
		id: 3,
		title_bn: "বিশেষ নির্বাচিত পণ্য",
		title_en: "Featured Picks",
		subtitle_bn: "আমাদের বাছাই করা জনপ্রিয় পণ্যগুলো ঘুরে দেখুন।",
		subtitle_en: "Browse our handpicked selection of customer favourites.",
		image:
			"https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=2070&q=80",
		cta_label_bn: "বিশেষ পণ্য",
		cta_label_en: "Featured Products",
		cta_href: "/products?is_featured=1",
		sort_order: 3,
	},
];
