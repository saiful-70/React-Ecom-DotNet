import { ProductToolbar } from "@/components/product/ProductToolbar";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductsInfiniteList } from "@/components/product/ProductsInfiniteList";
import { ProductsEmptyState } from "@/components/product/ProductsEmptyState";
import type { ProductListingLayoutProps } from "../types";

/** The pre-template products page composition, unchanged. */
export function ClassicProductListing({
	products,
	meta,
	categories,
	brands,
	activeFiltersCount,
	baseQuery,
	infiniteListKey,
	viewMode,
	perPage,
}: ProductListingLayoutProps) {
	return (
		<main className="container mx-auto px-4 py-8">
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
			<div className="flex flex-col lg:flex-row gap-6 lg:items-start">
				<ProductFilters
					categories={categories}
					brands={brands}
					activeFiltersCount={activeFiltersCount}
				/>
				<div className="flex-1 min-w-0">
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
						/>
					)}
				</div>
			</div>
		</main>
	);
}
