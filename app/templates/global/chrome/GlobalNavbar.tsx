import { getAllCategories } from "@/components/shared/actions/categories";
import { GlobalNavbarClient } from "./GlobalNavbarClient";

/**
 * Global chrome navigation bar (Server Component). Fetches categories via the
 * shared 1h-cached action and hands the top-level tree to the client mega-menu.
 */
export async function GlobalNavbar() {
	const response = await getAllCategories();
	const categories =
		response.success && response.data.categories
			? response.data.categories.filter((c) => c.parent_id === null)
			: [];

	return <GlobalNavbarClient categories={categories} />;
}
