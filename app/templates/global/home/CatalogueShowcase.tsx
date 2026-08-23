import type { Product } from "@/(app-routes)/products/model";
import { GlobalSectionTitle } from "./GlobalSectionTitle";
import { GlobalProductScroller } from "../product/GlobalProductScroller";

/**
 * One department's spread: ruled section header + a row of plates.
 * Collapses when the department has no stock to show.
 */
export function CatalogueShowcase({
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
