"use client";

import type { Product } from "@/(app-routes)/products/model";
import { BazarProductCard } from "./BazarProductCard";

/** Client grid of bazar cards (usable directly from Server Components). */
export function BazarProductsGrid({ products }: { products: Product[] }) {
	return (
		<div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
			{products.map((product) => (
				<BazarProductCard key={product.id} product={product} />
			))}
		</div>
	);
}
