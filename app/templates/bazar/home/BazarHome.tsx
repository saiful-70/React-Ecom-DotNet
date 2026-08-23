import Image from "next/image";
import { BannerLink } from "@/components/analytics/TrackedLinks";
import { NavigationSchema } from "@/components/layout/NavigationSchema";
import { getAllCategories } from "@/components/shared/actions/categories";
import {
	getFeaturedProducts,
	getTodayDealProducts,
	getTopSellingProducts,
} from "@/(app-routes)/products/action";
import type { HomeLayoutProps } from "@/templates/types";
import { BazarDeptRail } from "./BazarDeptRail";
import { BazarOrderSteps } from "./BazarOrderSteps";
import { BazarTariffBoard } from "./BazarTariffBoard";
import { BazarCategoryTiles } from "./BazarCategoryTiles";
import { BazarSectionBand } from "./BazarSectionBand";
import { BazarShowMore } from "./BazarShowMore";
import { BazarProductsGrid } from "../product/BazarProductsGrid";
import "../bazar.css";

const IMPECCABLE_CONTRACT = `
THESIS: Commerce in the grammar of the flexiload counter — the mobile top-up shop every Bangladeshi visits weekly: departments as SIM-coloured chips, offers as a laminated tariff chart, the phone number as identity; it refuses the department-sidebar WooCommerce bazaar arrangement.
OWN-WORLD: laminated chart-white field, board-black chrome, tariff-azure primary, offer-red accent, SIM-colour department coding (each department owns ONE hue end-to-end), Anek Bangla display over Hind Siliguri body, 8px laminated-chip corners, keypad-styled order strip.
STORY: A repeat shopper scans the tariff board, enters a department by its colour chip, adds items from chart rows, and orders phone-first with cash-on-delivery preselected — or taps to call.
FIRST VIEWPORT: Board-black counter header with tap-to-call; beneath it the tariff-board hero lists today's offers as chart rows with big tabular prices; a SIM-coloured department chip rail; a three-step "কীভাবে অর্ডার করবেন" strip; mobile bottom nav pinned in the thumb zone.
FORM: the flexiload counter; candidate 6 of 7 on the ordered grounded list; seed key bd057c37.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
`;

/**
 * The counter homepage. First viewport: tariff-board hero (today's offers as
 * chart rows) beside the laminated poster banner, then the SIM-coloured
 * department rail and the three-step order strip. Deeper: featured and
 * top-selling bands behind hard chart breaks, category tiles, promo posters.
 * Server Component — data comes from the shared cached actions.
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

	// The tariff board reads today's deals; when the flag is off or a source is
	// empty it walks the whole chain — deals → featured → top-selling — so the
	// counter opens with a populated chart whenever ANY product data exists.
	let boardProducts: Awaited<
		ReturnType<typeof getTodayDealProducts>
	>["data"]["products"] = [];
	if (features.todaysDeals) {
		const dealsResponse = await getTodayDealProducts(5);
		boardProducts = dealsResponse.success
			? dealsResponse.data?.products ?? []
			: [];
	}

	let featuredProducts: typeof boardProducts = [];
	if (features.featuredProducts) {
		const response = await getFeaturedProducts(10);
		featuredProducts = response.success
			? response.data?.products ?? []
			: [];
	}

	let topSellingProducts: typeof boardProducts = [];
	if (features.topSelling) {
		const response = await getTopSellingProducts(10);
		topSellingProducts = response.success
			? response.data?.products ?? []
			: [];
	}

	if (boardProducts.length === 0) {
		boardProducts =
			featuredProducts.length > 0
				? featuredProducts.slice(0, 5)
				: topSellingProducts.slice(0, 5);
	}

	const hasBoard = boardProducts.length > 0;
	const [heroBanner, ...promoBanners] = banners;

	return (
		<div className="min-h-screen bg-background">
			<script
				type="text/x-impeccable-contract"
				dangerouslySetInnerHTML={{ __html: IMPECCABLE_CONTRACT }}
			/>
			<NavigationSchema />
			<main className="container mx-auto space-y-10 py-6 md:space-y-14">
				{/* Tariff board + laminated poster — the first viewport. The 7/5
				    split only exists when BOTH are present; a lone board or a
				    lone poster takes the full row, never a half-empty hero. */}
				{(hasBoard || heroBanner) && (
					<section
						id="today-deals"
						className={
							hasBoard && heroBanner
								? "grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"
								: undefined
						}
					>
						{hasBoard && <BazarTariffBoard products={boardProducts} />}
						{heroBanner && (
							<BannerLink
								href={heroBanner.cta_url || "/products"}
								bannerId={heroBanner.id}
								bannerName={heroBanner.title}
								className={
									hasBoard
										? "ring-warm-focus relative block min-h-[220px] overflow-hidden rounded-lg border border-border shadow-warm lg:min-h-[420px] lg:self-stretch"
										: "ring-warm-focus relative block min-h-[220px] w-full overflow-hidden rounded-lg border border-border shadow-warm md:min-h-[360px]"
								}
							>
								<Image
									src={heroBanner.image_url}
									alt={heroBanner.title}
									fill
									priority
									className="object-cover"
									sizes={
										hasBoard
											? "(max-width: 1024px) 100vw, 40vw"
											: "100vw"
									}
								/>
							</BannerLink>
						)}
					</section>
				)}

				{/* SIM-coloured department rail. */}
				<BazarDeptRail categories={categories} />

				{/* কীভাবে অর্ডার করবেন — plain friendly grammar. */}
				<BazarOrderSteps />

				{features.featuredProducts && featuredProducts.length > 0 && (
					<section id="featured-products">
						<BazarSectionBand titleKey="bazar.featuredProduct" />
						<BazarProductsGrid products={featuredProducts} />
						<BazarShowMore href="/products?is_featured=1" />
					</section>
				)}

				{features.topSelling && topSellingProducts.length > 0 && (
					<section id="top-selling">
						<BazarSectionBand
							titleKey="bazar.topSelling"
							defaultTitle="সর্বাধিক বিক্রিত"
							deptIndex={3}
						/>
						<BazarProductsGrid products={topSellingProducts} />
						<BazarShowMore href="/products?top_selling=1" />
					</section>
				)}

				<BazarCategoryTiles categories={featuredCategories} />

				{promoBanners.length > 0 && (
					<section className="grid gap-6 md:grid-cols-2">
						{promoBanners.slice(0, 2).map((banner) => (
							<BannerLink
								key={banner.id}
								href={banner.cta_url || "/products"}
								bannerId={banner.id}
								bannerName={banner.title}
								className="ring-warm-focus relative block h-52 overflow-hidden rounded-lg border border-border shadow-warm-sm md:h-72"
							>
								<Image
									src={banner.image_url}
									alt={banner.title}
									fill
									className="object-cover"
									sizes="(max-width: 768px) 100vw, 50vw"
								/>
							</BannerLink>
						))}
					</section>
				)}
			</main>
		</div>
	);
}
