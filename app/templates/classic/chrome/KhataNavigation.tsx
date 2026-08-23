import { getAllCategories } from "@/components/shared/actions/categories";
import { KhataNavigationClient } from "./KhataNavigationClient";

/**
 * Khata chrome: the ledger's column heads — a single ruled strip of category
 * entries under the masthead. Async Server Component; categories come from
 * the shared short-lived cached action (no extra backend cost).
 */
export async function KhataNavigation() {
	const response = await getAllCategories();
	const categories =
		response.success && response.data.categories
			? response.data.categories.filter(
					(category) => category.parent_id === null
				)
			: [];

	return <KhataNavigationClient categories={categories} />;
}
