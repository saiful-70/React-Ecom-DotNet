"use client";

import { useTranslation } from "react-i18next";
import { ProductToolbar } from "@/components/product/ProductToolbar";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductsInfiniteList } from "@/components/product/ProductsInfiniteList";
import { ProductsEmptyState } from "@/components/product/ProductsEmptyState";
import type { ProductListingLayoutProps } from "@/templates/types";
import { PremiumProductCard } from "./PremiumProductCard";
import "../premium.css";

/**
 * Premium listing — the collection index. A large didone title over the
 * lacquer with a specimen count, foil hairline, then the shared filter/
 * toolbar machinery feeding an infinite grid of premium specimen cards.
 */
export function PremiumProductListing({
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
	const total = meta?.total || products.length;

	return (
		<main className="container mx-auto py-10 lg:py-14">
			<header className="mb-8">
				<h1 className="font-display text-4xl tracking-tight md:text-6xl">
					{selectedCategoryName ?? t("premium.collectionTitle", "The Collection")}
				</h1>
				<p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
					{t("premium.specimenCount", "{{count}} specimens on the shelf", {
						count: total,
					})}
				</p>
				<div className="premium-hairline mt-6" aria-hidden="true" />
			</header>

			{/* premium-toolbar hides the shared toolbar's built-in <h1> — the
			    didone title above is the page's one heading. */}
			<div className="premium-toolbar">
				<ProductToolbar
					totalProducts={total}
					displayedProducts={products.length}
					filterButton={
						<ProductFilters
							categories={categories}
							brands={brands}
							activeFiltersCount={activeFiltersCount}
							buttonOnly
						/>
					}
				/>
			</div>

			<div className="flex flex-col gap-8 lg:flex-row lg:items-start">
				<ProductFilters
					categories={categories}
					brands={brands}
					activeFiltersCount={activeFiltersCount}
				/>
				<div className="min-w-0 flex-1">
					{products.length === 0 ? (
						<ProductsEmptyState />
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
							CardComponent={PremiumProductCard}
						/>
					)}
				</div>
			</div>
		</main>
	);
}
