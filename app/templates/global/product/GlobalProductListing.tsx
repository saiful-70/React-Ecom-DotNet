"use client";

import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ProductToolbar } from "@/components/product/ProductToolbar";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductsInfiniteList } from "@/components/product/ProductsInfiniteList";
import { ProductsEmptyState } from "@/components/product/ProductsEmptyState";
import type { ProductListingLayoutProps } from "../../types";
import { GlobalProductCard } from "./GlobalProductCard";

/**
 * Global listing: breadcrumb + filter sidebar + toolbar + infinite grid of
 * global cards. Filters/sort/search reuse the shared components and URL params.
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

	return (
		<main className="container mx-auto px-4 py-6">
			<nav
				className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground"
				aria-label="Breadcrumb"
			>
				<Link href="/" className="hover:text-primary">
					{t("global.nav.home")}
				</Link>
				<ChevronRight className="h-4 w-4" />
				<span className="font-medium text-foreground">
					{selectedCategoryName ?? t("global.nav.allProducts")}
				</span>
			</nav>

			<ProductToolbar
				totalProducts={meta?.total || 0}
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

			<div className="flex flex-col gap-6 lg:flex-row lg:items-start">
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
							CardComponent={GlobalProductCard}
						/>
					)}
				</div>
			</div>
		</main>
	);
}
