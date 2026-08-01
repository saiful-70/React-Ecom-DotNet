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

export function ProductsGrid({
	products,
	viewMode = "grid",
	CardComponent = ProductCardItem,
}: ProductsGridProps) {
	// Fixed responsive column tracks (2 / 2 / 3 / 4). A sparse section (1–2
	// products) keeps its cards at the normal per-track size and simply leaves
	// the trailing tracks empty — the alternative (capping columns to the
	// product count) stretched each card across the whole row, which looked
	// oversized on wide viewports.
	const gridColsClasses = cn(
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
