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
	return (
		<div
			className={cn(
				// Mobile always uses grid (2 cols even on smallest screens)
				"grid grid-cols-2 gap-3",
				// On md+ screens, list view becomes 1 column, grid stays multi-column
				viewMode === "grid"
					? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
					: "md:grid-cols-1"
			)}
		>
			{products.map((product) => (
				<CardComponent key={product.id} product={product} />
			))}
		</div>
	);
}
