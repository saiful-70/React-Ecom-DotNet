import { getAllCategories } from "@/components/shared/actions/categories";
import { PantryFooterClient } from "./PantryFooterClient";

/**
 * Footer chrome slot (async Server Component). Reads the top-level categories
 * through the shared cached action — the same read the rest of the app uses, so
 * this costs no extra request — and hands them to the client band, which owns
 * the business-settings atom and translations.
 */
export async function PantryFooter() {
	const response = await getAllCategories();
	const topCategories = response.success
		? (response.data.categories ?? []).filter((c) => c.parent_id === null)
		: [];

	return <PantryFooterClient categories={topCategories.slice(0, 6)} />;
}
