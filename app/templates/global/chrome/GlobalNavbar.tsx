import { getAllCategories } from "@/components/shared/actions/categories";
import { GlobalNavbarClient } from "./GlobalNavbarClient";

/**
 * Department rail (Server Component). Fetches categories via the shared
 * short-lived cached action and hands the top-level tree to the client
 * index-tab rail. Collapses entirely when there are no categories.
 */
export async function GlobalNavbar() {
	const response = await getAllCategories();
	const categories =
		response.success && response.data.categories
			? response.data.categories.filter((c) => c.parent_id === null)
			: [];

	return <GlobalNavbarClient categories={categories} />;
}
