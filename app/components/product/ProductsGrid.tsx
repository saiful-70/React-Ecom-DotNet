"use client";

import type { ComponentType } from "react";
import type { Product } from "@/(app-routes)/products/model";
import { ProductCardItem } from "./ProductCardItem";
import { cn } from "@/lib/utils/utils";

interface ProductsGridProps {
	products: Product[];
	viewMode?: "grid" | "list";
	/**
	 * Card renderer override (defaults to ProductCardItem). Only pass this
	 * from client components — component functions cannot cross the
	 * server→client serialization boundary.
	 */
	CardComponent?: ComponentType<{ product: Product }>;
}

// Static (non-interpolated) class lookups so Tailwind's JIT scanner can find
// them — dynamic template strings like `grid-cols-${n}` would be purged.
const BASE_COLS_CLASS: Record<number, string> = {
	1: "grid-cols-1",
	2: "grid-cols-2",
};
const MD_COLS_CLASS: Record<number, string> = {
	1: "md:grid-cols-1",
	2: "md:grid-cols-2",
};
const LG_COLS_CLASS: Record<number, string> = {
	1: "lg:grid-cols-1",
	2: "lg:grid-cols-2",
	3: "lg:grid-cols-3",
};
const XL_COLS_CLASS: Record<number, string> = {
	1: "xl:grid-cols-1",
	2: "xl:grid-cols-2",
	3: "xl:grid-cols-3",
	4: "xl:grid-cols-4",
};

// Responsive column counts this grid normally uses, keyed by breakpoint.
const NORMAL_COLS = { base: 2, md: 2, lg: 3, xl: 4 } as const;

export function ProductsGrid({
	products,
	viewMode = "grid",
	CardComponent = ProductCardItem,
}: ProductsGridProps) {
	// Sparse sections (fewer products than the grid's normal column count at a
	// given breakpoint) otherwise reserve empty column tracks under the
	// heading. Cap the effective columns to the product count per breakpoint
	// instead — full sections (>= 4 products) resolve to the exact same
	// classes as before, so their layout is unchanged.
	const count = products.length;
	const isSparseGrid = viewMode === "grid" && count > 0 && count < NORMAL_COLS.xl;

	const gridColsClasses = isSparseGrid
		? cn(
				BASE_COLS_CLASS[Math.min(count, NORMAL_COLS.base)],
				MD_COLS_CLASS[Math.min(count, NORMAL_COLS.md)],
				LG_COLS_CLASS[Math.min(count, NORMAL_COLS.lg)],
				XL_COLS_CLASS[Math.min(count, NORMAL_COLS.xl)]
			)
		: cn(
				"grid-cols-2",
				viewMode === "grid"
					? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
					: "md:grid-cols-1"
			);

	return (
		<div className={cn("grid gap-3", gridColsClasses)}>
			{products.map((product) => (
				<CardComponent key={product.id} product={product} />
			))}
		</div>
	);
}
