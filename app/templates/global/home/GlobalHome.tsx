import { NavigationSchema } from "@/components/layout/NavigationSchema";
import { getAllCategories } from "@/components/shared/actions/categories";
import { getAllBrands } from "@/components/shared/actions/brands";
import {
	getAllProducts,
	getFeaturedProducts,
	getTodayDealProducts,
	getTopSellingProducts,
} from "@/(app-routes)/products/action";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { Product } from "@/(app-routes)/products/model";
import type { HomeLayoutProps } from "../../types";
import { GlobalDepartmentSidebar } from "./GlobalDepartmentSidebar";
import { HeroCarousel } from "./HeroCarousel";
import { FlashDealSection } from "./FlashDealSection";
import { CategoriesStrip } from "./CategoriesStrip";
import { DealOfDayLatest } from "./DealOfDayLatest";
import { BrandsStrip } from "./BrandsStrip";
import { CategoryShowcase } from "./CategoryShowcase";
import { BestSellingTopRated } from "./BestSellingTopRated";
import { GlobalSectionTitle } from "./GlobalSectionTitle";
import { GlobalProductsGrid } from "../product/GlobalProductsGrid";
import { pickDealOfDay } from "../_data/mock";

// Number of top categories surfaced as their own homepage showcase rows.
const CATEGORY_SHOWCASES = 4;

function productsOf(response: { success: boolean; data: { products: Product[] } }) {
	return response.success ? response.data.products ?? [] : [];
}

/**
 * Global homepage (async Server Component). Fetches all sections from the
 * existing backend APIs via the shared cached actions and composes the 6Valley
 * marketplace layout. Sections without a backend endpoint use documented mock
 * helpers (flash-deal timer, deal-of-the-day pick — see _data/mock.ts).
 */
export async function GlobalHome({ banners, featuredCategories, features }: HomeLayoutProps) {
	const categoriesResponse = await getAllCategories();
	const topCategories =
		categoriesResponse.success && categoriesResponse.data.categories
			? categoriesResponse.data.categories.filter((c) => c.parent_id === null)
			: [];

	// Fetch the primary product sets in parallel.
	const [featuredRes, todayDealRes, topSellingRes, latestRes, topRatedRes, brandsRes] =
		await Promise.all([
			features.featuredProducts
				? getFeaturedProducts(12)
				: Promise.resolve(null),
			features.todaysDeals ? getTodayDealProducts(12) : Promise.resolve(null),
			features.topSelling ? getTopSellingProducts(8) : Promise.resolve(null),
			getAllProducts({ per_page: 12, sort: "latest" }),
			getAllProducts({ per_page: 8, sort: "rating" }),
			getAllBrands(),
		]);

	const featuredProducts = featuredRes ? productsOf(featuredRes) : [];
	const todayDeals = todayDealRes ? productsOf(todayDealRes) : [];
	const topSelling = topSellingRes ? productsOf(topSellingRes) : [];
	const latestProducts = productsOf(latestRes);
	const topRated = productsOf(topRatedRes);
	const brands = brandsRes.success ? brandsRes.data : [];

	// Deal-of-the-day heuristic: best discount among deals, else featured.
	const dealOfDay = pickDealOfDay(todayDeals.length > 0 ? todayDeals : featuredProducts);

	// Per-category showcase rows for the first few top categories.
	const showcaseCategories = topCategories.slice(0, CATEGORY_SHOWCASES);
	const showcases = await Promise.all(
		showcaseCategories.map(async (category) => {
			const res = await getAllProducts({
				category_id: category.id,
				per_page: 12,
			});
			return { category, products: productsOf(res) };
		})
	);

	return (
		<div className="min-h-screen bg-muted/20">
			<NavigationSchema />
			<main className="container mx-auto space-y-10 px-4 py-6 md:space-y-12">
				{/* Hero: departments + banner carousel */}
				<section className="flex gap-6">
					<GlobalDepartmentSidebar categories={topCategories} />
					<HeroCarousel banners={banners} />
				</section>

				{features.todaysDeals && <FlashDealSection products={todayDeals} />}

				{features.featuredProducts && featuredProducts.length > 0 && (
					<section id="featured-products">
						<GlobalSectionTitle
							titleKey="global.featuredProducts"
							viewAllHref={`${ABSOLUTE_ROUTES.PRODUCTS}?is_featured=1`}
						/>
						<GlobalProductsGrid products={featuredProducts} />
					</section>
				)}

				<CategoriesStrip categories={featuredCategories} />

				<DealOfDayLatest
					dealProduct={dealOfDay}
					latestProducts={latestProducts}
				/>

				<BrandsStrip brands={brands} />

				{showcases.map(({ category, products }) => (
					<CategoryShowcase
						key={category.id}
						title={category.name}
						viewAllHref={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(category.id)}
						products={products}
					/>
				))}

				{features.topSelling && (
					<section id="top-selling">
						<BestSellingTopRated
							bestSelling={topSelling}
							topRated={topRated}
						/>
					</section>
				)}
			</main>
		</div>
	);
}
