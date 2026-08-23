import { BannerLink } from "@/components/analytics/TrackedLinks";
import { NavigationSchema } from "@/components/layout/NavigationSchema";
import { VariantLink } from "@/components/shared/ui/variant-link";
import { getCombos } from "@/(app-routes)/combo/action";
import {
	getFeaturedProducts,
	getTodayDealProducts,
	getTopSellingProducts,
} from "@/(app-routes)/products/action";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { Product } from "@/(app-routes)/products/model";
import type { HomeLayoutProps } from "../types";
import { KhataHeroTag } from "./home/KhataHeroTag";
import { KhataSectionTitle } from "./home/KhataSectionTitle";
import { KhataComboLedger } from "./home/KhataComboLedger";
import { KhataProductCard } from "./product/KhataProductCard";
import { KhataImage } from "./shared/KhataImage";

import "./classic.css";

const IMPECCABLE_CONTRACT = `
THESIS: The storefront as the neighbourhood grocer's khata ledger — trust through the most familiar retail object in Bangladesh; it refuses the banner-wall marketplace arrangement and the sterile white shadcn store.
OWN-WORLD: unbleached khata-paper field, page-white cards, printed rule lines, stamp-red order actions, blue-ballpoint accents, kraft-board chrome; Tiro Bangla display over Hind Siliguri body; flat printed fields (never photographic paper textures); gummed-tag chips; 6px corners.
STORY: A shopper arriving from a Facebook ad recognizes an honest shop: price, delivery fee, and cash-on-delivery are printed up front; they pick a combo tier like a ledger entry and order with name + phone, expecting the confirming call.
FIRST VIEWPORT: Kraft-board masthead (shop sign); beneath it the ruled ledger field opens with the hero offer as a pinned gummed price-tag block — product photo matted on page white, price at poster scale in stamp red, COD + zone-fee lines printed beneath, and the "এখনই অর্ডার করুন" stamp-red button in the thumb zone — everything registered against one left ledger rule-spine.
FORM: the mudir dokan khata; candidate 4 of 7 on the ordered grounded list; seed key 144d8307.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
`;

/** Ledger-entry product grid: dense two columns on phones, four on desk. */
function KhataProductsGrid({ products }: { products: Product[] }) {
	return (
		<div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
			{products.map((product) => (
				<KhataProductCard key={product.id} product={product} />
			))}
		</div>
	);
}

/**
 * The khata homepage. Async Server Component: hero offer, category tags,
 * combo ledger, and the three shelf bands come from the shared cached
 * actions; each band boundary is a printed rule and every band registers
 * its content on the left rule-spine.
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

	// The pinned offer: today's deal first, then featured, then top selling.
	const heroProduct = todayDeals[0] ?? featured[0] ?? topSelling[0] ?? null;
	const [promoBanner] = banners;

	return (
		<div className="min-h-screen bg-background">
			<script
				type="text/x-impeccable-contract"
				dangerouslySetInnerHTML={{ __html: IMPECCABLE_CONTRACT }}
			/>
			<NavigationSchema />
			<main>
				{/* The ledger opens: today's offer as a pinned gummed price tag. */}
				{heroProduct ? (
					<KhataHeroTag product={heroProduct} />
				) : (
					promoBanner && (
						<section className="border-b">
							<div className="container mx-auto py-8">
								<BannerLink
									href={promoBanner.cta_url || "/products"}
									bannerId={promoBanner.id}
									bannerName={promoBanner.title}
									className="relative block min-h-[220px] overflow-hidden rounded-md border bg-card p-2 shadow-warm md:min-h-[360px]"
								>
									<KhataImage
										src={promoBanner.image_url}
										alt={promoBanner.title}
										fallbackText={promoBanner.title}
										fill
										priority
										className="rounded-sm object-cover"
										sizes="100vw"
									/>
								</BannerLink>
							</div>
						</section>
					)
				)}

				{/* Category tags — the khata's chapter tabs. */}
				{featuredCategories.length > 0 && (
					<section className="border-b bg-muted/60">
						<div className="container mx-auto py-4">
							<ul className="flex items-center gap-2 overflow-x-auto">
								{featuredCategories.map((category) => (
									<li key={category.id} className="shrink-0">
										<VariantLink
											href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(
												category.category_id
											)}
											className="ring-warm-focus flex min-h-11 items-center gap-2 rounded-md border bg-card px-3 text-sm font-semibold shadow-warm-sm transition-colors hover:border-accent hover:text-accent"
										>
											{category.icon_url && (
												<KhataImage
													src={category.icon_url}
													alt=""
													fallbackText={category.name}
													width={20}
													height={20}
													className="h-5 w-5 rounded-sm object-cover"
													fallbackClassName="[&>span]:text-[10px]"
												/>
											)}
											{category.name}
										</VariantLink>
									</li>
								))}
							</ul>
						</div>
					</section>
				)}

				{/* Combo offers, written as ledger entries. */}
				{combos.length > 0 && (
					<section id="combo-offers" className="py-10 md:py-14">
						<div className="container mx-auto">
							<div className="khata-spine pl-5 md:pl-8">
								<KhataSectionTitle
									titleKey="classic2.comboOffers"
									titleDefault="প্যাকেজ অফার"
								/>
								<KhataComboLedger combos={combos} />
							</div>
						</div>
					</section>
				)}

				{/* Top selling — an aged-paper band. */}
				{features.topSelling && topSelling.length > 0 && (
					<section
						id="top-selling"
						className="border-y bg-muted/60 py-10 md:py-14"
					>
						<div className="container mx-auto">
							<div className="khata-spine pl-5 md:pl-8">
								<KhataSectionTitle
									titleKey="classic2.topSelling"
									titleDefault="সবচেয়ে বেশি বিক্রি"
									viewAllHref="/products?top_selling=1"
								/>
								<KhataProductsGrid products={topSelling} />
							</div>
						</div>
					</section>
				)}

				{/* Featured — the ruled field again, quieter. */}
				{features.featuredProducts && featured.length > 0 && (
					<section id="featured-products" className="py-10 md:py-14">
						<div className="container mx-auto">
							<div className="khata-spine pl-5 md:pl-8">
								<KhataSectionTitle
									titleKey="classic2.featured"
									titleDefault="বাছাই করা পণ্য"
									viewAllHref="/products?is_featured=1"
								/>
								<KhataProductsGrid products={featured} />
							</div>
						</div>
					</section>
				)}

				{/* A promotional photograph, matted mid-page. */}
				{heroProduct && promoBanner && (
					<section className="border-y bg-muted/60">
						<div className="container mx-auto py-8">
							<BannerLink
								href={promoBanner.cta_url || "/products"}
								bannerId={promoBanner.id}
								bannerName={promoBanner.title}
								className="relative block h-48 overflow-hidden rounded-md border bg-card p-2 shadow-warm-sm md:h-72"
							>
								<KhataImage
									src={promoBanner.image_url}
									alt={promoBanner.title}
									fallbackText={promoBanner.title}
									fill
									className="rounded-sm object-cover"
									sizes="(max-width: 1400px) 100vw, 1400px"
								/>
							</BannerLink>
						</div>
					</section>
				)}

				{/* Today's deals — the day's last entries before the close. */}
				{features.todaysDeals && todayDeals.length > 0 && (
					<section id="today-deals" className="py-10 md:py-14">
						<div className="container mx-auto">
							<div className="khata-spine pl-5 md:pl-8">
								<KhataSectionTitle
									titleKey="classic2.todayDeals"
									titleDefault="আজকের অফার"
									viewAllHref="/products?today_deal=1"
								/>
								<KhataProductsGrid products={todayDeals} />
							</div>
						</div>
					</section>
				)}
			</main>
		</div>
	);
}
