"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { getAllProducts } from "@/(app-routes)/products/action";
import type { Product, PaginationMeta } from "@/(app-routes)/products/model";
import { ProductsGrid } from "./ProductsGrid";

type ProductsQuery = Record<string, string | number | (string | number)[]>;

interface ProductsInfiniteListProps {
	/** Server-rendered first page (SEO/LCP). */
	initialProducts: Product[];
	/** Meta for the first page — gives us `current_page` and `last_page`. */
	initialMeta: PaginationMeta;
	/** Active filters/sort/search (without an appended-page concern). */
	baseQuery: ProductsQuery;
	viewMode: "grid" | "list";
}

/**
 * Infinite-scroll product list. Renders the initial server-fetched page, then
 * appends subsequent pages via the `getAllProducts` server action as a bottom
 * sentinel scrolls into view. Remount (via a `key` on filter change) resets it.
 */
export function ProductsInfiniteList({
	initialProducts,
	initialMeta,
	baseQuery,
	viewMode,
}: ProductsInfiniteListProps) {
	const { t } = useTranslation();

	const [products, setProducts] = React.useState<Product[]>(initialProducts);
	const [page, setPage] = React.useState(initialMeta.current_page || 1);
	const [isLoading, setIsLoading] = React.useState(false);

	const lastPage = initialMeta.last_page || 1;
	const hasMore = page < lastPage;

	const sentinelRef = React.useRef<HTMLDivElement>(null);
	// Guards against the observer firing again before a fetch settles.
	const loadingRef = React.useRef(false);

	const loadMore = React.useCallback(async () => {
		if (loadingRef.current || page >= lastPage) return;
		loadingRef.current = true;
		setIsLoading(true);

		const nextPage = page + 1;
		try {
			const res = await getAllProducts({ ...baseQuery, page: nextPage });
			const newProducts = res?.data?.products ?? [];
			setProducts((prev) => [...prev, ...newProducts]);
			setPage(nextPage);
		} catch (error) {
			console.error("Failed to load more products:", error);
		} finally {
			setIsLoading(false);
			loadingRef.current = false;
		}
	}, [page, lastPage, baseQuery]);

	React.useEffect(() => {
		const node = sentinelRef.current;
		if (!node || !hasMore) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) loadMore();
			},
			// Start fetching a bit before the sentinel is fully visible.
			{ rootMargin: "400px 0px" }
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [hasMore, loadMore]);

	return (
		<div>
			<ProductsGrid products={products} viewMode={viewMode} />

			{/* Sentinel + loading / end-of-list states */}
			<div
				ref={sentinelRef}
				className="mt-8 flex items-center justify-center"
			>
				{isLoading && (
					<span className="flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						{t("products.loadingMore") || "Loading more..."}
					</span>
				)}
				{!hasMore && !isLoading && products.length > 0 && (
					<span className="text-sm text-muted-foreground">
						{t("products.endOfResults") ||
							"You've reached the end"}
					</span>
				)}
			</div>
		</div>
	);
}
