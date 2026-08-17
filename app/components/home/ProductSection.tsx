import {
	getFeaturedProducts,
	getTopSellingProducts,
	getTodayDealProducts,
} from "@/(app-routes)/products/action";
import { ProductsGrid } from "../product/ProductsGrid";
import { SectionHeader } from "./SectionHeader";
import { SECTION_Y } from "@/lib/ui/rhythm";

interface ProductSectionProps {
	type: "featured" | "top-selling" | "today-deals";
	titleKey: string;
	descriptionKey: string;
	viewAllHref: string;
	perPage?: number;
	bgClass?: string;
	id?: string;
	/**
	 * Marks the band as a deal event: adds the diagonal weave behind the grid.
	 * Use on at most one shelf per page — the motif only means anything while
	 * the shelves around it stay plain.
	 */
	motif?: boolean;
}

export async function ProductSection({
	type,
	titleKey,
	descriptionKey,
	viewAllHref,
	perPage = 12,
	bgClass = "",
	id,
	motif = false,
}: ProductSectionProps) {
	try {
		let response;

		// Use the appropriate server action based on type
		switch (type) {
			case "featured":
				response = await getFeaturedProducts(perPage);
				break;
			case "top-selling":
				response = await getTopSellingProducts(perPage);
				break;
			case "today-deals":
				response = await getTodayDealProducts(perPage);
				break;
			default:
				return null;
		}

		// Check if response is valid and has products
		if (!response.success || !response.data?.products || response.data.products.length === 0) {
			return null;
		}

		return (
			<section
				id={id}
				className={`relative overflow-hidden ${SECTION_Y} ${bgClass}`}
			>
				{motif && (
					<div
						aria-hidden
						className="pointer-events-none absolute inset-0 bg-weave-motif opacity-[0.05]"
					/>
				)}
				<div className="relative container mx-auto">
					<SectionHeader
						titleKey={titleKey}
						descriptionKey={descriptionKey}
						viewAllHref={viewAllHref}
					/>
					<ProductsGrid products={response.data.products} />
				</div>
			</section>
		);
	} catch (error) {
		console.error(`Error in ProductSection for ${type}:`, error);
		return null;
	}
}
