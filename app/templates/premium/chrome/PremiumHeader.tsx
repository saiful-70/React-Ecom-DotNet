import { getAllCategories } from "@/components/shared/actions/categories";
import { PremiumHeaderClient } from "./PremiumHeaderClient";

/**
 * Premium chrome header (async Server Component). Reads the top-level
 * categories through the shared cached action and hands them to the client
 * shell, which renders the wordmark, a compact collection nav, and the
 * account/cart keys. There is no separate Navigation slot in this paradigm.
 */
export async function PremiumHeader() {
	const response = await getAllCategories();
	const topCategories = response.success
		? (response.data.categories ?? []).filter((c) => c.parent_id === null)
		: [];

	return <PremiumHeaderClient categories={topCategories.slice(0, 5)} />;
}
