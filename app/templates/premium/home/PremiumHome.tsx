import { NavigationSchema } from "@/components/layout/NavigationSchema";
import {
	getAllProducts,
	getFeaturedProducts,
	getTopSellingProducts,
} from "@/(app-routes)/products/action";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { Product } from "@/(app-routes)/products/model";
import type { HomeLayoutProps } from "@/templates/types";
import { primaryImage } from "../lib";
import { PremiumHeroSpecimen } from "./PremiumHeroSpecimen";
import { PremiumEditorialSections } from "./PremiumEditorialSections";
import { PremiumCollectionGrid } from "./PremiumCollectionGrid";
import { PremiumRankedList } from "./PremiumRankedList";
import "../premium.css";

const IMPECCABLE_CONTRACT = `
THESIS: The store as a packaging system — provenance (batch numbers, foil rules, seals) is the premium signal; it refuses the cream-and-serif Aesop default: the world stays drenched viridian lacquer.
OWN-WORLD: viridian-lacquer field, label-stock panels, foil-gold purchase actions, vermilion seal accent, foil hairline rules, Bodoni Moda didone display over Jost label sans, 2px box-board corners, a hard four-colour commitment (viridian, vermilion, foil gold, label stock — no fifth hue).
STORY: A visitor meets one product as a boxed specimen, reads its provenance, configures it on a pressed key-row, and buys from a one-viewport label panel; checkout reads express and guest-first.
FIRST VIEWPORT: The lacquer field; small brand wordmark top; the flagship product centred as a boxed specimen framed by foil hairlines with numbered exploded callouts; the buy label panel — name, batch number, price, variant keys, one gold add-to-cart — complete within the first viewport.
FORM: the apothecary batch label; candidate 5 of 7 on the ordered grounded list; seed key 2dc2f44e.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
`;

function productsOf(response: {
	success: boolean;
	data: { products: Product[] };
}) {
	return response.success ? (response.data.products ?? []) : [];
}

/**
 * Premium homepage (async Server Component): hero specimen → editorial
 * banner sections → collection grid → most-ordered ledger → footer close.
 * No deal walls, no countdowns. All sections come from real backend data;
 * a section with no source is omitted.
 */
export async function PremiumHome({ banners, features }: HomeLayoutProps) {
	const [featuredRes, latestRes, topSellingRes] = await Promise.all([
		features.featuredProducts
			? getFeaturedProducts(9)
			: Promise.resolve(null),
		getAllProducts({ per_page: 12, sort: "latest" }),
		features.topSelling ? getTopSellingProducts(5) : Promise.resolve(null),
	]);

	const featured = featuredRes ? productsOf(featuredRes) : [];
	const latest = productsOf(latestRes);
	const topSelling = topSellingRes ? productsOf(topSellingRes) : [];

	// The flagship specimen: prefer a sellable product with photography, then
	// any with photography, then any at all — the hero must never open on an
	// empty well (imageless picks fall back to the wordmark plate client-side).
	const pool = [...featured, ...latest];
	const flagship =
		pool.find((p) => primaryImage(p) && p.stock > 0) ??
		pool.find((p) => primaryImage(p)) ??
		pool[0] ??
		null;
	// Don't repeat the flagship inside its own grid.
	const featuredRest = featured.filter((p) => p.id !== flagship?.id);
	const collection = latest.filter((p) => p.id !== flagship?.id);

	return (
		<div className="min-h-screen bg-background text-foreground">
			<script
				type="text/x-impeccable-contract"
				dangerouslySetInnerHTML={{ __html: IMPECCABLE_CONTRACT }}
			/>
			<NavigationSchema />
			<main className="space-y-20 pb-20 lg:space-y-28 lg:pb-28">
				{flagship && <PremiumHeroSpecimen product={flagship} />}

				<PremiumEditorialSections banners={banners} />

				{features.featuredProducts && (
					<PremiumCollectionGrid
						id="featured-products"
						titleKey="premium.featured"
						titleDefault="Selected specimens"
						products={featuredRest}
						viewAllHref={`${ABSOLUTE_ROUTES.PRODUCTS}?is_featured=1`}
					/>
				)}

				<PremiumCollectionGrid
					titleKey="premium.latestArrivals"
					titleDefault="Latest to the shelf"
					products={collection}
					viewAllHref={ABSOLUTE_ROUTES.PRODUCTS}
				/>

				{features.topSelling && (
					<PremiumRankedList id="top-selling" products={topSelling} />
				)}
			</main>
		</div>
	);
}
