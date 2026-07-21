"use client";

import type { Product } from "@/(app-routes)/products/model";
import { GlobalSectionTitle } from "./GlobalSectionTitle";
import { GlobalProductScroller } from "../product/GlobalProductScroller";

/**
 * A per-category product row: section heading + "View All" + horizontal
 * scroller. Reused for each top category showcase on the homepage.
 */
export function CategoryShowcase({
	title,
	viewAllHref,
	products,
}: {
	title: string;
	viewAllHref: string;
	products: Product[];
}) {
	if (products.length === 0) return null;

	return (
		<section>
			<GlobalSectionTitle title={title} viewAllHref={viewAllHref} />
			<GlobalProductScroller products={products} />
		</section>
	);
}
