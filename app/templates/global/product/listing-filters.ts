/**
 * Catalogue filter model for the global listing. This is presentation
 * plumbing only — the URL contract (category_id/brand_id CSVs, price_range
 * "min-max", is_featured/today_deal/top_selling flags, search/sort/view/page)
 * is exactly the one the shared listing actions already parse.
 */

export const PRICE_MIN_DEFAULT = 0;
export const PRICE_MAX_DEFAULT = 100000;

export type SpecialFilter = "" | "featured" | "today_deal" | "top_selling";

export interface CatalogueFilterDraft {
	categories: string[];
	brands: string[];
	/** Raw input strings so partially-typed values don't jump around. */
	priceMin: string;
	priceMax: string;
	/** Mutually exclusive, matching the shared filters' behavior. */
	special: SpecialFilter;
}

type ParamsLike = { get(name: string): string | null };

export function draftFromParams(params: ParamsLike): CatalogueFilterDraft {
	const csv = (value: string | null) =>
		value ? value.split(",").filter(Boolean) : [];
	const priceRange = params.get("price_range");
	const [min, max] = priceRange ? priceRange.split("-") : ["", ""];

	const special: SpecialFilter =
		params.get("is_featured") === "1"
			? "featured"
			: params.get("today_deal") === "1"
				? "today_deal"
				: params.get("top_selling") === "1"
					? "top_selling"
					: "";

	return {
		categories: csv(params.get("category_id")),
		brands: csv(params.get("brand_id")),
		priceMin: min ?? "",
		priceMax: max ?? "",
		special,
	};
}

/** Whether the draft carries a price constraint worth writing to the URL. */
function priceRangeOf(draft: CatalogueFilterDraft): string | null {
	const min = draft.priceMin.trim();
	const max = draft.priceMax.trim();
	if (!min && !max) return null;
	const lo = Number(min) || PRICE_MIN_DEFAULT;
	const hi = max ? Number(max) || PRICE_MAX_DEFAULT : PRICE_MAX_DEFAULT;
	return `${lo}-${hi}`;
}

/**
 * Merge a draft into the current params, preserving search/sort/view and
 * resetting to page 1 — identical to what the shared filter sidebar does.
 */
export function paramsFromDraft(
	draft: CatalogueFilterDraft,
	current: string
): URLSearchParams {
	const params = new URLSearchParams(current);
	const setOrDelete = (key: string, value: string | null) => {
		if (value === null || value === "") params.delete(key);
		else params.set(key, value);
	};

	setOrDelete(
		"category_id",
		draft.categories.length > 0 ? draft.categories.join(",") : null
	);
	setOrDelete("brand_id", draft.brands.length > 0 ? draft.brands.join(",") : null);
	setOrDelete("price_range", priceRangeOf(draft));
	setOrDelete("is_featured", draft.special === "featured" ? "1" : null);
	setOrDelete("today_deal", draft.special === "today_deal" ? "1" : null);
	setOrDelete("top_selling", draft.special === "top_selling" ? "1" : null);
	params.set("page", "1");
	return params;
}

/** Query object for a "how many results" probe (per_page 1). */
export function queryFromDraft(
	draft: CatalogueFilterDraft,
	current: string
): Record<string, string | number> {
	const params = paramsFromDraft(draft, current);
	params.delete("view");
	params.set("per_page", "1");
	params.set("page", "1");
	const query: Record<string, string | number> = {};
	params.forEach((value, key) => {
		query[key] = value;
	});
	return query;
}

export function countActiveFilters(draft: CatalogueFilterDraft): number {
	return (
		draft.categories.length +
		draft.brands.length +
		(priceRangeOf(draft) ? 1 : 0) +
		(draft.special ? 1 : 0)
	);
}
