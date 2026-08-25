"use client";

import { useAtomValue } from "jotai";
import { PhoneCall, SearchX, Truck, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import Price from "@/components/shared/Price";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductToolbar } from "@/components/product/ProductToolbar";
import { ProductsGrid } from "@/components/product/ProductsGrid";
import { ProductPagination } from "@/components/product/ProductPagination";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { businessSettingsAtom } from "@/store/ui-atoms";
import type { ProductListingLayoutProps } from "@/templates/types";
import { PantryProductCard } from "./PantryProductCard";
import "../pantry.css";

/**
 * The shelf page.
 *
 * A pantry has a handful of departments, so this page refuses the marketplace
 * apparatus: no facet rail of its own, no breadcrumb chain, no chip wall. A
 * plain-language heading on the stone band says which shelf you are standing at
 * and how many goods are on it, the band closes on the world's 2px shelf edge
 * ("goods below"), and then the goods.
 *
 * Everything mechanical is the shared machinery — the sidebar filters, the
 * search/sort/view toolbar, the grid, the pager — so URL semantics here are
 * identical to every other template. Pages rather than infinite scroll: a
 * single-brand shop has an end, and a shopper is allowed to reach it.
 *
 * `CardComponent` is passed from this client component, which is the only place
 * it can be passed from — a component function cannot cross the server→client
 * boundary.
 */
export function PantryProductListing({
	products,
	meta,
	categories,
	brands,
	activeFiltersCount,
	viewMode,
	selectedCategoryName,
}: ProductListingLayoutProps) {
	const { t } = useTranslation();
	const settings = useAtomValue(businessSettingsAtom);

	const total = meta?.total ?? products.length;
	const heading = selectedCategoryName ?? t("pantry.allGoods", "সব পণ্য");

	// The free-delivery threshold is printed only when the merchant actually
	// set a positive one. A missing or zero setting means this page promises
	// nothing about it.
	const freeOverRaw = Number(settings?.free_shipping_on_over);
	const freeOver =
		Number.isFinite(freeOverRaw) && freeOverRaw > 0 ? freeOverRaw : null;

	return (
		<main className="bg-background pb-16 lg:pb-24">
			{/* The shelf label: what you are looking at, and how much of it. */}
			<div className="bg-muted">
				<div className="container mx-auto py-7 md:py-10">
					<h1 className="font-display text-3xl leading-tight text-foreground md:text-4xl">
						{heading}
					</h1>
					<p className="mt-1.5 text-sm tabular-nums text-muted-foreground">
						{t("pantry.goodsCount", {
							defaultValue: "{{count}}টি পণ্য",
							count: total,
						})}
					</p>

					{/* The same terms the home page prints, said again here: a
					    visitor who landed on this shelf from a search engine never
					    saw that strip. Backed facts only — cash on delivery, and the
					    merchant's own free-delivery threshold when there is one. */}
					<div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-sm font-semibold text-success">
						<span className="inline-flex items-center gap-1.5">
							<Wallet className="h-4 w-4 shrink-0" aria-hidden="true" />
							{t("pantry.codOnDelivery", "পণ্য হাতে পেয়ে টাকা দিন")}
						</span>
						{freeOver !== null && (
							<span className="inline-flex items-center gap-1.5">
								<Truck className="h-4 w-4 shrink-0" aria-hidden="true" />
								<span className="tabular-nums">
									<Price amount={freeOver} />
								</span>
								{t("pantry.freeDeliveryOver", "এর বেশি অর্ডারে ফ্রি ডেলিভারি")}
							</span>
						)}
					</div>
				</div>
			</div>
			{/* The shelf edge closes the label band: goods below. */}
			<div className="pn-shelf" aria-hidden="true" />

			<div className="container mx-auto pt-6 md:pt-8">
				{/* Shared sort / view toolbar; the filter sheet rides in it on
				    phones, where the sidebar is hidden. Its search field is opted
				    out: this world's header carries a permanent search box a few
				    hundred pixels above, and two of them is one control too many. */}
				<ProductToolbar
					totalProducts={total}
					displayedProducts={products.length}
					showHeading={false}
					showSearch={false}
					filterButton={
						<div className="lg:hidden">
							<ProductFilters
								categories={categories}
								brands={brands}
								activeFiltersCount={activeFiltersCount}
								buttonOnly
							/>
						</div>
					}
				/>

				<div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start">
					<div className="hidden lg:sticky lg:top-6 lg:block lg:shrink-0">
						<ProductFilters
							categories={categories}
							brands={brands}
							activeFiltersCount={activeFiltersCount}
						/>
					</div>

					<div className="min-w-0 flex-1">
						{products.length === 0 ? (
							/* Empty shelf: say it plainly, then hand back two real ways
							   out — the whole shop, or the shop's phone. */
							<div className="rounded-lg border border-border bg-card px-6 py-14 text-center shadow-warm-sm">
								<SearchX
									className="mx-auto h-8 w-8 text-primary"
									aria-hidden="true"
								/>
								<h2 className="mt-4 font-display text-xl leading-snug text-foreground md:text-2xl">
									{t("pantry.emptyTitle", "এই তাকে কিছু নেই")}
								</h2>
								<p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
									{t(
										"pantry.emptyBody",
										"ফিল্টার সরিয়ে সব পণ্য দেখুন, অথবা আমাদের কল করুন — যা খুঁজছেন আমরা বলে দেব",
									)}
								</p>
								<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
									<Link
										href={ABSOLUTE_ROUTES.PRODUCTS}
										className="pn-pack ring-warm-focus inline-flex min-h-12 items-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground hover:bg-primary/90"
									>
										{t("pantry.clearFilters", "সব পণ্য দেখুন")}
									</Link>
									{settings?.contact_phone && (
										<a
											href={`tel:${settings.contact_phone}`}
											className="pn-pack ring-warm-focus inline-flex min-h-12 items-center gap-2 rounded-lg border border-border bg-background px-6 text-sm font-bold text-primary hover:bg-muted"
										>
											<PhoneCall className="h-4 w-4" aria-hidden="true" />
											{t("pantry.callTheShop", "দোকানে কল করুন")}
										</a>
									)}
								</div>
							</div>
						) : (
							<>
								{/* Two columns on a phone is the floor here: this world
								    sells photographs of jars, and one jar per row turns a
								    shelf into an endless scroll. The shared grid's tracks
								    are 2 / 2 / 3 / 4. */}
								<ProductsGrid
									products={products}
									viewMode={viewMode}
									CardComponent={PantryProductCard}
								/>
								{meta && (
									<div className="mt-10">
										<ProductPagination pagination={meta} />
									</div>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</main>
	);
}
