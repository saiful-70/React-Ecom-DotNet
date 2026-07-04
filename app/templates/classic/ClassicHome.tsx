import { HeroCarousel } from "@/components/home/HeroCarousel";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { ProductSection } from "@/components/home/ProductSection";
import { Features } from "@/components/home/Features";
import { NavigationSchema } from "@/components/layout/NavigationSchema";
import type { HomeLayoutProps } from "../types";

/** The pre-template homepage composition, unchanged. */
export function ClassicHome({
	banners,
	featuredCategories,
	features,
}: HomeLayoutProps) {
	return (
		<div className="min-h-screen bg-background">
			<NavigationSchema />
			<main>
				<HeroCarousel banners={banners} />
				<FeaturedCategories categories={featuredCategories} />
				{features.topSelling && (
					<ProductSection
						id="top-selling"
						type="top-selling"
						titleKey="products.topSelling"
						descriptionKey="products.topSellingDescription"
						viewAllHref="/products?top_selling=1"
						perPage={12}
						bgClass="bg-muted/30"
					/>
				)}
				{features.featuredProducts && (
					<ProductSection
						id="featured-products"
						type="featured"
						titleKey="products.featured"
						descriptionKey="products.featuredDescription"
						viewAllHref="/products?is_featured=1"
						perPage={12}
					/>
				)}
				{features.todaysDeals && (
					<ProductSection
						id="today-deals"
						type="today-deals"
						titleKey="products.todayDeals"
						descriptionKey="products.todayDealsDescription"
						viewAllHref="/products?today_deal=1"
						perPage={12}
					/>
				)}
				<Features />
			</main>
		</div>
	);
}
