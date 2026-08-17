import { HeroCarousel } from "@/components/home/HeroCarousel";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { ProductSection } from "@/components/home/ProductSection";
import { Features } from "@/components/home/Features";
import { ComboPromo } from "@/components/home/ComboPromo";
import { NavigationSchema } from "@/components/layout/NavigationSchema";
import { getCombos } from "@/(app-routes)/combo/action";
import type { HomeLayoutProps } from "../types";

/** The pre-template homepage composition. */
export async function ClassicHome({
	banners,
	featuredCategories,
	features,
}: HomeLayoutProps) {
	// Combo marketing cards; gated by the bundles flag.
	const combos = features.bundles ? await getCombos() : [];

	return (
		<div className="min-h-screen bg-background">
			<NavigationSchema />
			<main>
				<HeroCarousel banners={banners} />
				<FeaturedCategories categories={featuredCategories} />
				{combos.length > 0 && <ComboPromo combos={combos} />}
				{/* Alternating bands. Previously only the first section had a
				    background, so three consecutive shelves separated by ~96px of
				    whitespace read as unrelated blocks. Each band now has a visible
				    edge against its neighbour. */}
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
						bgClass="bg-muted/30"
						motif
					/>
				)}
				<Features />
			</main>
		</div>
	);
}
