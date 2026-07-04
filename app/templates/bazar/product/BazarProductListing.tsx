"use client";

import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ProductsInfiniteList } from "@/components/product/ProductsInfiniteList";
import { ProductsEmptyState } from "@/components/product/ProductsEmptyState";
import type { ProductListingLayoutProps } from "../../types";
import { BazarProductCard } from "./BazarProductCard";

/**
 * Bazar listing: breadcrumb strip + infinite-scrolling grid of bazar cards.
 * Filters/search still work via URL params (driven by header search and
 * category links); this paradigm has no filter sidebar.
 */
export function BazarProductListing({
	products,
	meta,
	baseQuery,
	infiniteListKey,
	perPage,
	selectedCategoryName,
}: ProductListingLayoutProps) {
	const { t } = useTranslation();

	return (
		<main className="container mx-auto px-4 py-6">
			<nav
				className="mb-6 rounded-md bg-muted/60 px-4 py-3 text-sm"
				aria-label="Breadcrumb"
			>
				<Link href="/" className="font-semibold hover:text-primary">
					{t("bazar.home")}
				</Link>
				<span className="mx-2 text-muted-foreground">&gt;</span>
				<span className="text-muted-foreground">
					{selectedCategoryName ?? t("bazar.products")}
				</span>
			</nav>
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
					viewMode="grid"
					CardComponent={BazarProductCard}
				/>
			)}
		</main>
	);
}
