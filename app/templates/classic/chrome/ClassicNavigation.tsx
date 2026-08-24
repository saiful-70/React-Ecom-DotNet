import { getAllCategories } from "@/components/shared/actions/categories";
import { ClassicNavigationClient } from "./ClassicNavigationClient";

/**
 * The department line under the masthead. Async Server Component; categories
 * come from the shared short-lived cached action (no extra backend cost).
 */
export async function ClassicNavigation() {
	const response = await getAllCategories();
	const categories =
		response.success && response.data.categories
			? response.data.categories.filter(
					(category) => category.parent_id === null
				)
			: [];

	return <ClassicNavigationClient categories={categories} />;
}
