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
import type { HomeLayoutProps } from "@/templates/types";
import { HeroTableau } from "./HeroTableau";
import { DealsInsert } from "./DealsInsert";
import { DepartmentIndex } from "./DepartmentIndex";
import { BrandsLine } from "./BrandsLine";
import { CatalogueShowcase } from "./CatalogueShowcase";
import { RankedColumns } from "./RankedColumns";
import { GlobalSectionTitle } from "./GlobalSectionTitle";
import { GlobalProductsGrid } from "../product/GlobalProductsGrid";
import "../global.css";

const IMPECCABLE_CONTRACT = `
THESIS: The marketplace as a great mail-order catalogue — numbered order instead of feed chaos; every product carries an item number, departments are index tabs, availability is printed on the page; it refues the Amazon-clone carousel arrangement and the Temu urgency stack.
OWN-WORLD: catalogue-page white, print ink, catalogue-blue actions, sale-red reserved for the deals insert band, hairline rules, 2px print corners, index-tab department rail, item numbers on every product plate, Archivo grotesque (weight 900 display, tabular numerals).
STORY: A shopper lands on a composed catalogue spread, navigates by index tabs, compares numbered plates with printed availability lines, narrows with filter chips, and buys guest-first with a delivery date shown before commitment.
FIRST VIEWPORT: Masthead with dominant search; index-tab department rail; ONE composed hero tableau of real products at mismatched scales (never a carousel), aligned to a persistent horizon datum line; the deals band below as a red "sale pages" insert with an honest end date.
FORM: the mail-order index; candidate 6 of 7 on the ordered grounded list; seed key 61608d55.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
`;

// Number of departments surfaced as their own catalogue spread.
const CATEGORY_SHOWCASES = 3;

function productsOf(response: {
	success: boolean;
	data: { products: Product[] };
}) {
	return response.success ? response.data.products ?? [] : [];
}

/**
 * The catalogue's opening spread (async Server Component). All sections read
 * the existing backend APIs through the shared cached actions; any section
 * whose source returns nothing collapses — nothing is faked. Composition:
 * hero tableau on the horizon datum → sale-pages insert → featured plates →
 * department index → department spreads → latest arrivals → brands line →
 * ranked ledgers.
 */
export async function GlobalHome({
	banners,
	featuredCategories,
	features,
}: HomeLayoutProps) {
	const categoriesResponse = await getAllCategories();
	const topCategories =
		categoriesResponse.success && categoriesResponse.data.categories
			? categoriesResponse.data.categories.filter((c) => c.parent_id === null)
			: [];

	// Fetch the primary product sets in parallel.
	const [featuredRes, todayDealRes, topSellingRes, latestRes, topRatedRes, brandsRes] =
		await Promise.all([
			features.featuredProducts ? getFeaturedProducts(12) : Promise.resolve(null),
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

	// The hero tableau shows real, in-stock, photographed products.
	const tableauPool = featuredProducts.length > 0 ? featuredProducts : latestProducts;
	const tableauProducts = tableauPool
		.filter((p) => p.thumbnail_image?.trim() && p.stock > 0)
		.slice(0, 3);
	const heroBanner = banners.length > 0 ? banners[0] : null;

	// Per-department spreads for the first few top categories.
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
		<div className="min-h-screen bg-background">
			<script
				type="text/x-impeccable-contract"
				dangerouslySetInnerHTML={{ __html: IMPECCABLE_CONTRACT }}
			/>
			<NavigationSchema />

			{/* Opening spread on the horizon datum */}
			<HeroTableau banner={heroBanner} products={tableauProducts} />

			<main className="space-y-12 py-10 md:space-y-16 md:py-12">
				{/* The sale pages — the only red in the book */}
				{features.todaysDeals && <DealsInsert products={todayDeals} />}

				{features.featuredProducts && featuredProducts.length > 0 && (
					<section id="featured-products" className="container mx-auto">
						<GlobalSectionTitle
							titleKey="global.featuredProducts"
							viewAllHref={`${ABSOLUTE_ROUTES.PRODUCTS}?is_featured=1`}
						/>
						<GlobalProductsGrid products={featuredProducts} />
					</section>
				)}

				<DepartmentIndex categories={featuredCategories} />

				{showcases.map(({ category, products }) => (
					<div key={category.id} className="container mx-auto">
						<CatalogueShowcase
							title={category.name}
							viewAllHref={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(category.id)}
							products={products}
						/>
					</div>
				))}

				{latestProducts.length > 0 && (
					<section className="container mx-auto">
						<GlobalSectionTitle
							titleKey="global.latestProducts"
							viewAllHref={`${ABSOLUTE_ROUTES.PRODUCTS}?sort=latest`}
						/>
						<GlobalProductsGrid products={latestProducts} />
					</section>
				)}

				<BrandsLine brands={brands} />

				{features.topSelling && (
					<section id="top-selling" className="container mx-auto">
						<RankedColumns bestSelling={topSelling} topRated={topRated} />
					</section>
				)}
			</main>
		</div>
	);
}
