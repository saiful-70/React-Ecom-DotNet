import type { FeaturedCategory } from "./types";

/**
 * Static demo tiles for the "Featured Categories" strip. Replace with data
 * from `GET /featured-categories` once the backend endpoint exists (see docs/api).
 * `href` currently points at the generic listing because the demo ids are not
 * real backend category ids; switch to `/products?category_id=<id>` when wired.
 */
export const FEATURED_CATEGORIES: FeaturedCategory[] = [
	{
		id: 1,
		slug: "electronics",
		name_bn: "ইলেকট্রনিক্স",
		name_en: "Electronics",
		icon: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=300&q=80",
		href: "/products",
		sort_order: 1,
	},
	{
		id: 2,
		slug: "fashion",
		name_bn: "ফ্যাশন",
		name_en: "Fashion",
		icon: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=300&q=80",
		href: "/products",
		sort_order: 2,
	},
	{
		id: 3,
		slug: "home-living",
		name_bn: "ঘর ও জীবনযাপন",
		name_en: "Home & Living",
		icon: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=300&q=80",
		href: "/products",
		sort_order: 3,
	},
	{
		id: 4,
		slug: "beauty",
		name_bn: "বিউটি",
		name_en: "Beauty",
		icon: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=300&q=80",
		href: "/products",
		sort_order: 4,
	},
	{
		id: 5,
		slug: "sports",
		name_bn: "খেলাধুলা",
		name_en: "Sports",
		icon: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=300&q=80",
		href: "/products",
		sort_order: 5,
	},
	{
		id: 6,
		slug: "groceries",
		name_bn: "গ্রোসারি",
		name_en: "Groceries",
		icon: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80",
		href: "/products",
		sort_order: 6,
	},
	{
		id: 7,
		slug: "toys",
		name_bn: "খেলনা",
		name_en: "Toys",
		icon: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=300&q=80",
		href: "/products",
		sort_order: 7,
	},
	{
		id: 8,
		slug: "books",
		name_bn: "বই",
		name_en: "Books",
		icon: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=80",
		href: "/products",
		sort_order: 8,
	},
	{
		id: 9,
		slug: "appliances",
		name_bn: "অ্যাপ্লায়েন্স",
		name_en: "Appliances",
		icon: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=300&q=80",
		href: "/products",
		sort_order: 9,
	},
	{
		id: 10,
		slug: "automotive",
		name_bn: "অটোমোটিভ",
		name_en: "Automotive",
		icon: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=300&q=80",
		href: "/products",
		sort_order: 10,
	},
];
