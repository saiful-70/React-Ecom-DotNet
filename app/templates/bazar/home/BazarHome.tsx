import Image from "next/image";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { NavigationSchema } from "@/components/layout/NavigationSchema";
import { getAllCategories } from "@/components/shared/actions/categories";
import { getFeaturedProducts } from "@/(app-routes)/products/action";
import type { HomeLayoutProps } from "@/templates/types";
import { DepartmentSidebar } from "./DepartmentSidebar";
import { BazarCategoryGrid } from "./BazarCategoryGrid";
import { BazarSectionTitle } from "./BazarSectionTitle";
import { BazarShowMore } from "./BazarShowMore";
import { BazarProductsGrid } from "../product/BazarProductsGrid";

/**
 * Bazar homepage: department sidebar + hero banner, category grid, featured
 * products, promo banner pair. Server Component — categories and featured
 * products come from the shared cached actions.
 */
export async function BazarHome({
	banners,
	featuredCategories,
	features,
}: HomeLayoutProps) {
	const categoriesResponse = await getAllCategories();
	const categories =
		categoriesResponse.success && categoriesResponse.data.categories
			? categoriesResponse.data.categories.filter(
					(category) => category.parent_id === null
				)
			: [];

	let featuredProducts: Awaited<
		ReturnType<typeof getFeaturedProducts>
	>["data"]["products"] = [];
	if (features.featuredProducts) {
		const response = await getFeaturedProducts(10);
		featuredProducts = response.success
			? response.data?.products ?? []
			: [];
	}

	const [heroBanner, ...promoBanners] = banners;

	return (
		<div className="min-h-screen bg-background">
			<NavigationSchema />
			<main className="container mx-auto space-y-10 px-4 py-6 md:space-y-14">
				{/* Departments + hero */}
				<section className="flex gap-6">
					<DepartmentSidebar categories={categories} />
					{heroBanner && (
						<Link
							href={heroBanner.cta_url || "/products"}
							className="relative block min-h-[240px] flex-1 overflow-hidden rounded-md md:min-h-[360px] lg:min-h-[420px]"
						>
							<Image
								src={heroBanner.image_url}
								alt={heroBanner.title}
								fill
								priority
								className="object-cover"
								sizes="(max-width: 1024px) 100vw, 75vw"
							/>
						</Link>
					)}
				</section>

				<BazarCategoryGrid categories={featuredCategories} />

				{features.featuredProducts && featuredProducts.length > 0 && (
					<section id="featured-products">
						<BazarSectionTitle titleKey="bazar.featuredProduct" />
						<BazarProductsGrid products={featuredProducts} />
						<BazarShowMore href="/products?is_featured=1" />
					</section>
				)}

				{promoBanners.length > 0 && (
					<section className="grid gap-6 md:grid-cols-2">
						{promoBanners.slice(0, 2).map((banner) => (
							<Link
								key={banner.id}
								href={banner.cta_url || "/products"}
								className="relative block h-52 overflow-hidden rounded-md md:h-72"
							>
								<Image
									src={banner.image_url}
									alt={banner.title}
									fill
									className="object-cover"
									sizes="(max-width: 768px) 100vw, 50vw"
								/>
							</Link>
						))}
					</section>
				)}
			</main>
		</div>
	);
}
