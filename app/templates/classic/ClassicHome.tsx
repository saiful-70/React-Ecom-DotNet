import { NavigationSchema } from "@/components/layout/NavigationSchema";
import { getCombos } from "@/(app-routes)/combo/action";
import {
	getFeaturedProducts,
	getTodayDealProducts,
	getTopSellingProducts,
} from "@/(app-routes)/products/action";
import type { Product } from "@/(app-routes)/products/model";
import type { HomeLayoutProps } from "../types";
import { ClassicHeroCarousel } from "./home/ClassicHeroCarousel";
import { ClassicDeliveryStrip } from "./home/ClassicDeliveryStrip";
import { ClassicDepartmentRail } from "./home/ClassicDepartmentRail";
import { ClassicSectionTitle } from "./home/ClassicSectionTitle";
import { ClassicComboRail } from "./home/ClassicComboRail";
import { ClassicProductCard } from "./product/ClassicProductCard";

import "./classic.css";

const IMPECCABLE_CONTRACT = `
THESIS: A white shopfloor where the photography is the loudest thing on the page and one saturated vermilion-orange carries every buy action; it refuses both a decorative material metaphor and a wall of competing promotional banners.
OWN-WORLD: pure white field, ink text, hairline separation, faint grey section bands, ink footer band, one vermilion-orange signal, deep green for cash-on-delivery and delivery-window trust lines, 12px soft retail corners, Baloo Da 2 display over Hind Siliguri body, photography at 1:1 with nothing overlaid but a discount chip.
STORY: A shopper arriving from a Facebook ad sees the offer, the real photograph, the price with its markdown, and the delivery cost before the button — then orders with phone and address, expecting the confirming call.
FIRST VIEWPORT: A white sticky header over a thin utility strip carrying phone and cash-on-delivery; below it the banner carousel runs full width as the first content of the page; beneath its dots the delivery costs are printed, then the offer rail opens with its first 1:1 photograph — on mobile that card's heavy price and orange order button land in the thumb zone inside the fold, on desktop the photograph opens the fold and its price sits immediately beneath it.
FORM: the category standard, played straight; seed key 144d8307.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
`;

/** The offer grid: two columns on phones, four on the desk. */
function ClassicProductsGrid({ products }: { products: Product[] }) {
	return (
		<div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
			{products.map((product) => (
				<ClassicProductCard key={product.id} product={product} />
			))}
		</div>
	);
}

/**
 * The shopfront home page. Async Server Component: the carousel opens the
 * page, the delivery terms print directly beneath it so the cost is known
 * before the first order button, then the offer rails alternate white field
 * and grey band down the scroll.
 */
export async function ClassicHome({
	banners,
	featuredCategories,
	features,
}: HomeLayoutProps) {
	const [todayDeals, featured, topSelling, combos] = await Promise.all([
		features.todaysDeals
			? getTodayDealProducts(8).then((r) =>
					r.success ? (r.data?.products ?? []) : []
				)
			: Promise.resolve([] as Product[]),
		features.featuredProducts
			? getFeaturedProducts(8).then((r) =>
					r.success ? (r.data?.products ?? []) : []
				)
			: Promise.resolve([] as Product[]),
		features.topSelling
			? getTopSellingProducts(8).then((r) =>
					r.success ? (r.data?.products ?? []) : []
				)
			: Promise.resolve([] as Product[]),
		features.bundles ? getCombos(4) : Promise.resolve([]),
	]);

	return (
		<div className="min-h-screen bg-background">
			<script
				type="text/x-impeccable-contract"
				dangerouslySetInnerHTML={{ __html: IMPECCABLE_CONTRACT }}
			/>
			<NavigationSchema />
			<main>
				{/* The shopfront window: the first content on the page. */}
				<ClassicHeroCarousel banners={banners} />

				{/* What it costs to get it here — before any order button. */}
				<ClassicDeliveryStrip />

				{/* The offer rail. Its top padding is tighter than the other
				    shelves on purpose: the first card's photograph has to reach
				    the desktop fold, and on mobile its price has to clear the
				    fixed bottom call bar. Do not reclaim this space by shrinking
				    the photograph or by moving the fee strip below the rail. */}
				{features.todaysDeals && todayDeals.length > 0 && (
					<section id="today-deals" className="pb-10 pt-2 md:pb-14 md:pt-4">
						<div className="container mx-auto">
							<ClassicSectionTitle
								titleKey="classic2.todayDeals"
								titleDefault="আজকের অফার"
								viewAllHref="/products?today_deal=1"
							/>
							<ClassicProductsGrid products={todayDeals} />
						</div>
					</section>
				)}

				{/* Departments, as photographs on the grey band. */}
				{featuredCategories.length > 0 && (
					<section className="classic-band py-8 md:py-10">
						<div className="container mx-auto">
							<ClassicDepartmentRail categories={featuredCategories} />
						</div>
					</section>
				)}

				{/* Combo offers. */}
				{combos.length > 0 && (
					<section id="combo-offers" className="py-10 md:py-14">
						<div className="container mx-auto">
							<ClassicSectionTitle
								titleKey="classic2.comboOffers"
								titleDefault="প্যাকেজ অফার"
							/>
							<ClassicComboRail combos={combos} />
						</div>
					</section>
				)}

				{/* Featured, on the grey band. */}
				{features.featuredProducts && featured.length > 0 && (
					<section
						id="featured-products"
						className="classic-band py-10 md:py-14"
					>
						<div className="container mx-auto">
							<ClassicSectionTitle
								titleKey="classic2.featured"
								titleDefault="বাছাই করা পণ্য"
								viewAllHref="/products?is_featured=1"
							/>
							<ClassicProductsGrid products={featured} />
						</div>
					</section>
				)}

				{/* Top selling closes the scroll. */}
				{features.topSelling && topSelling.length > 0 && (
					<section id="top-selling" className="py-10 md:py-14">
						<div className="container mx-auto">
							<ClassicSectionTitle
								titleKey="classic2.topSelling"
								titleDefault="সবচেয়ে বেশি বিক্রি"
								viewAllHref="/products?top_selling=1"
							/>
							<ClassicProductsGrid products={topSelling} />
						</div>
					</section>
				)}
			</main>
		</div>
	);
}
