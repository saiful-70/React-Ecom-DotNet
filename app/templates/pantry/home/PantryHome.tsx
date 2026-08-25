import { NavigationSchema } from "@/components/layout/NavigationSchema";
import {
	getAllProducts,
	getFeaturedProducts,
	getTodayDealProducts,
	getTopSellingProducts,
} from "@/(app-routes)/products/action";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { Product } from "@/(app-routes)/products/model";
import type { HomeLayoutProps } from "@/templates/types";
import { discountPercent, primaryImage } from "../lib";
import { PantryHeroShelf } from "./PantryHeroShelf";
import { PantryProofRail } from "./PantryProofRail";
import { PantryShelfSection } from "./PantryShelfSection";
import { PantryCategoryRail } from "./PantryCategoryRail";
import { PantryDealsBand } from "./PantryDealsBand";
import { PantryPromise } from "./PantryPromise";
import "../pantry.css";

const IMPECCABLE_CONTRACT = `
THESIS: A single-brand Bengali pantry where the food is photographed, not merchandised — it refuses the banner-wall marketplace grid AND its predictable opposite, the cream-paper artisanal metaphor world; PRODUCT.md bans metaphor worlds for this market, so the category standard is played straight at full craft.
OWN-WORLD: white counter ground so the goods are the loudest thing on screen; deep leaf green owning whole regions (promise bar, proof band, footer, every buy field); honey amber as the ONLY other saturated colour, meaning exactly one thing — a real discount; Tiro Bangla, a single-weight Bengali serif, at billboard scale over Hind Siliguri body; 10px pack-tile corners; a 2px green shelf edge as the only structural line above 1px.
STORY: The visitor sees the flagship good full-bleed, reads why it is pure, picks a pack weight off a rail of identical tiles, and orders cash-on-delivery from a form on the product page itself — no cart, no account.
FIRST VIEWPORT: One full-bleed product photograph, 68vh on a phone; the Bengali product name at clamp(1.875rem, 7vw, 4.25rem) over a bottom-anchored forest scrim; price heavy and tabular beside its struck original; one 48px+ green order button at the scrim base with the cash-on-delivery line beside it; the 2px shelf edge and the purity line closing the fold.
FORM: the BD single-brand natural-food storefront, played straight; the standing exit pinned by PRODUCT.md's BD brand commitment over the rolled metaphor challengers; seed key 6f5fa93a.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
`;

function productsOf(response: {
	success: boolean;
	data: { products: Product[] };
}) {
	return response.success ? (response.data.products ?? []) : [];
}

/**
 * Pantry homepage (async Server Component). The scroll is a shop walked
 * front to back: window → why it is pure → the shelf of packs → the
 * departments → today's price cuts → what we promise at the door.
 *
 * Every section is backed by real data and collapses when its source is
 * empty; nothing renders filler.
 */
export async function PantryHome({
	banners,
	featuredCategories,
	features,
}: HomeLayoutProps) {
	const [featuredRes, latestRes, dealsRes, topSellingRes] = await Promise.all([
		features.featuredProducts ? getFeaturedProducts(8) : Promise.resolve(null),
		getAllProducts({ per_page: 12, sort: "latest" }),
		features.todaysDeals ? getTodayDealProducts(8) : Promise.resolve(null),
		features.topSelling ? getTopSellingProducts(8) : Promise.resolve(null),
	]);

	const featured = featuredRes ? productsOf(featuredRes) : [];
	const latest = productsOf(latestRes);
	// The deals band is headed "prices have dropped", so it may only carry
	// products whose price actually dropped. The backend's `today_deal` flag is
	// set independently of any discount, and an amber field full of unreduced
	// prices is a claim the data does not back — so the flag is necessary but
	// not sufficient here, and with nothing left the whole band collapses.
	const deals = (dealsRes ? productsOf(dealsRes) : []).filter(
		(p) => discountPercent(p) !== null,
	);
	const topSelling = topSellingRes ? productsOf(topSellingRes) : [];

	// The window display: prefer a sellable good with a photograph, because
	// this fold IS the photograph. Fall back through photography, then stock,
	// then anything — the plate covers the last case.
	const pool = [...featured, ...latest];
	const flagship =
		pool.find((p) => primaryImage(p) && p.stock > 0) ??
		pool.find((p) => primaryImage(p)) ??
		pool[0] ??
		null;

	const shelf = featured.filter((p) => p.id !== flagship?.id);
	const latestShelf = latest.filter((p) => p.id !== flagship?.id);

	return (
		<div className="min-h-screen bg-background text-foreground">
			<script
				type="text/x-impeccable-contract"
				dangerouslySetInnerHTML={{ __html: IMPECCABLE_CONTRACT }}
			/>
			<NavigationSchema />
			<main className="pb-16 lg:pb-24">
				{flagship && <PantryHeroShelf product={flagship} />}

				{/* Why it is pure — the argument this whole category sells on. */}
				{flagship && <PantryProofRail product={flagship} />}

				{features.featuredProducts && shelf.length > 0 && (
					<PantryShelfSection
						id="featured-products"
						titleKey="pantry.featured"
						titleDefault="আমাদের বাছাই"
						products={shelf}
						viewAllHref={`${ABSOLUTE_ROUTES.PRODUCTS}?is_featured=1`}
					/>
				)}

				<PantryCategoryRail categories={featuredCategories} banners={banners} />

				{features.todaysDeals && deals.length > 0 && (
					<PantryDealsBand id="today-deals" products={deals} />
				)}

				{/* New arrivals run sideways along the shelf — a shop shows what
				    just came in on a rail, not as a second wall of tiles. */}
				{latestShelf.length > 0 && (
					<PantryShelfSection
						titleKey="pantry.newOnShelf"
						titleDefault="নতুন এসেছে"
						products={latestShelf}
						viewAllHref={ABSOLUTE_ROUTES.PRODUCTS}
						banded
						density="rail"
					/>
				)}

				{/* Order volume is the one place a number carries real information,
				    so this shelf is a compact ranked list rather than a grid. */}
				{features.topSelling && topSelling.length > 0 && (
					<PantryShelfSection
						id="top-selling"
						titleKey="pantry.topSelling"
						titleDefault="সবচেয়ে বেশি অর্ডার হয়েছে"
						products={topSelling}
						viewAllHref={`${ABSOLUTE_ROUTES.PRODUCTS}?sort=top_selling`}
						density="ranked"
					/>
				)}

				{/* The close: what we promise at the door. */}
				<PantryPromise />
			</main>
		</div>
	);
}
