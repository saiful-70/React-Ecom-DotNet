"use client";

import type { Product } from "@/(app-routes)/products/model";
import { GlobalProductCard } from "./GlobalProductCard";

/** Responsive grid of global product cards (safe to use from Server Components). */
export function GlobalProductsGrid({ products }: { products: Product[] }) {
	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-6">
			{products.map((product) => (
				<GlobalProductCard key={product.id} product={product} />
			))}
		</div>
	);
}
