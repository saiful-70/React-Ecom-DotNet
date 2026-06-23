import { Metadata } from "next";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { ProductSection } from "@/components/home/ProductSection";
import { Features } from "@/components/home/Features";
import { NavigationSchema } from "@/components/layout/NavigationSchema";
import {
	generateMetadata as genMeta,
	generateOrganizationSchema,
	generateWebsiteSchema,
	renderStructuredData,
} from "@/lib/utils/seo.utils";
import { getBusinessSettings } from "@/components/shared/actions/business-settings";

export async function generateMetadata(): Promise<Metadata> {
	const businessSettings = await getBusinessSettings();

	return genMeta({
		title: "Home",
		description:
			"Discover amazing products at unbeatable prices. Shop the latest trends in electronics, fashion, home & garden, and more.",
		keywords: [
			"ecommerce",
			"shopping",
			"electronics",
			"fashion",
			"home",
			"garden",
			"online store",
		],
		businessSettings,
	});
}

export default async function HomePage() {
	// Generate structured data for homepage
	const organizationSchema = generateOrganizationSchema();
	const websiteSchema = generateWebsiteSchema();

	return (
		<>
			{renderStructuredData(organizationSchema)}
			{renderStructuredData(websiteSchema)}
			<div className="min-h-screen bg-background">
				<NavigationSchema />
				<main>
					<HeroCarousel />
					<FeaturedCategories />
					<ProductSection
						id="top-selling"
						type="top-selling"
						titleKey="products.topSelling"
						descriptionKey="products.topSellingDescription"
						viewAllHref="/products?top_selling=1"
						perPage={12}
						bgClass="bg-muted/30"
					/>
					<ProductSection
						id="featured-products"
						type="featured"
						titleKey="products.featured"
						descriptionKey="products.featuredDescription"
						viewAllHref="/products?is_featured=1"
						perPage={12}
					/>
					<ProductSection
						id="today-deals"
						type="today-deals"
						titleKey="products.todayDeals"
						descriptionKey="products.todayDealsDescription"
						viewAllHref="/products?today_deal=1"
						perPage={12}
					/>
					<Features />
				</main>
			</div>
		</>
	);
}
