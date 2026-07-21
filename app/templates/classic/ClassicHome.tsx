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
	// Combo marketing banner (mock data for now); gated by the bundles flag.
	const combos = features.bundles ? await getCombos() : [];
	const featuredCombo = combos[0] ?? null;

	return (
		<div className="min-h-screen bg-background">
			<NavigationSchema />
			<main>
				<HeroCarousel banners={banners} />
				<FeaturedCategories categories={featuredCategories} />
				{featuredCombo && <ComboPromo combo={featuredCombo} />}
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
