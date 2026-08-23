"use client";

import { useMemo, useState } from "react";
import { ChevronRight, SearchX } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ProductsInfiniteList } from "@/components/product/ProductsInfiniteList";
import type { ProductListingLayoutProps } from "@/templates/types";
import { GlobalProductCard } from "./GlobalProductCard";
import { GlobalListingControls } from "./GlobalListingControls";
import { GlobalFilterChips } from "./GlobalFilterChips";
import { GlobalFilterSheet } from "./GlobalFilterSheet";
import { GlobalFacetGroups } from "./GlobalFacetGroups";
import {
	draftFromParams,
	paramsFromDraft,
	type CatalogueFilterDraft,
} from "./listing-filters";
import "../global.css";

/**
 * The index pages: breadcrumb line, catalogue page header with the printed
 * total, controls rule, applied-filter chips, facet sidebar (desktop,
 * immediate apply) or full-screen sheet (mobile, deferred "Show N results"),
 * and the infinite grid of plates. URL/query semantics are the shared ones.
 */
export function GlobalProductListing({
	products,
	meta,
	categories,
	brands,
	activeFiltersCount,
	baseQuery,
	infiniteListKey,
	viewMode,
	perPage,
	selectedCategoryName,
}: ProductListingLayoutProps) {
	const { t } = useTranslation();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [sheetOpen, setSheetOpen] = useState(false);

	const paramsString = searchParams.toString();
	const draft = useMemo(
		() => draftFromParams(new URLSearchParams(paramsString)),
		[paramsString]
	);

	// Desktop facets apply immediately — same behavior as the shared sidebar.
	const applyDraft = (next: CatalogueFilterDraft) => {
		const params = paramsFromDraft(next, paramsString);
		router.push(`/products?${params.toString()}`, { scroll: false });
	};

	const pageTitle = selectedCategoryName ?? t("global.nav.allProducts");
	const total = meta?.total ?? products.length;

	return (
		<main className="container mx-auto py-6">
			<nav
				className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground"
				aria-label="Breadcrumb"
			>
				<Link href="/" className="ring-warm-focus rounded-sm hover:text-foreground hover:underline">
					{t("global.nav.home")}
				</Link>
				<ChevronRight className="h-4 w-4" aria-hidden="true" />
				<span className="font-medium text-foreground">{pageTitle}</span>
			</nav>

			{/* Catalogue page header */}
			<div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-2 border-foreground pb-3">
				<h1 className="font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
					{pageTitle}
				</h1>
				<p className="text-sm text-muted-foreground tabular-nums">
					{t("global.listing.itemCount", "{{count}} items listed", {
						count: total,
					})}
				</p>
			</div>

			<GlobalListingControls
				activeFiltersCount={activeFiltersCount}
				onOpenFilters={() => setSheetOpen(true)}
			/>

			<GlobalFilterChips categories={categories} brands={brands} />

			<div className="flex flex-col gap-8 lg:flex-row lg:items-start">
				{/* Desktop facet sidebar */}
				<aside className="hidden lg:sticky lg:top-6 lg:block lg:max-h-[calc(100vh-3rem)] lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-border lg:pr-6">
					<GlobalFacetGroups
						draft={draft}
						onChange={applyDraft}
						categories={categories}
						brands={brands}
					/>
				</aside>

				<div className="min-w-0 flex-1">
					{products.length === 0 ? (
						<div className="flex flex-col items-center gap-3 border border-border py-16 text-center">
							<SearchX className="h-8 w-8 text-muted-foreground" />
							<p className="text-sm text-muted-foreground">
								{t(
									"global.listing.emptyTitle",
									"Nothing in the index matches this page."
								)}
							</p>
							<button
								type="button"
								onClick={() => router.push("/products", { scroll: false })}
								className="ring-warm-focus rounded-sm border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
							>
								{t("global.filters.clearAll", "Clear all")}
							</button>
						</div>
					) : (
						<ProductsInfiniteList
							key={infiniteListKey}
							initialProducts={products}
							initialMeta={
								meta ?? {
									current_page: 1,
									per_page: perPage,
									total: products.length,
									last_page: 1,
									from: 1,
									to: products.length,
								}
							}
							baseQuery={baseQuery}
							viewMode={viewMode}
							CardComponent={GlobalProductCard}
						/>
					)}
				</div>
			</div>

			<GlobalFilterSheet
				open={sheetOpen}
				onClose={() => setSheetOpen(false)}
				categories={categories}
				brands={brands}
			/>
		</main>
	);
}
