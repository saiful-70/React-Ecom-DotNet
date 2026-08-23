"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Category, ChildCategory } from "@/components/shared/models/category";
import type { Brand } from "@/components/shared/models/brand";
import { cn } from "@/lib/utils/utils";
import type { CatalogueFilterDraft, SpecialFilter } from "./listing-filters";
import "../global.css";

/**
 * The facet groups of the catalogue index: department, brand, special pages,
 * and price. Every option is a tappable button (multi-select within
 * department and brand), never a dropdown. Fully controlled — the desktop
 * sidebar applies each change immediately; the mobile sheet defers to its
 * "Show N results" button.
 */
export function GlobalFacetGroups({
	draft,
	onChange,
	categories,
	brands,
}: {
	draft: CatalogueFilterDraft;
	onChange: (next: CatalogueFilterDraft) => void;
	categories: Category[];
	brands: Brand[];
}) {
	const { t } = useTranslation();

	// Flatten the 3-level tree the way the shared sidebar does.
	const flatCategories: { id: string; name: string; depth: number }[] = [];
	const walk = (cat: Category | ChildCategory, depth: number) => {
		flatCategories.push({ id: String(cat.id), name: cat.name, depth });
		if ("child_category" in cat && Array.isArray(cat.child_category)) {
			cat.child_category.forEach((child) => walk(child, depth + 1));
		}
	};
	categories.forEach((c) => walk(c, 0));

	const toggle = (list: string[], id: string) =>
		list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

	const specials: { value: SpecialFilter; label: string }[] = [
		{ value: "featured", label: t("products.featured", "Featured Products") },
		{ value: "today_deal", label: t("products.todayDeals", "Today's Deals") },
		{ value: "top_selling", label: t("products.topSelling", "Top Selling") },
	];

	const optionClass = (selected: boolean) =>
		cn(
			"ring-warm-focus rounded-sm border px-2.5 py-1.5 text-xs font-medium transition-colors",
			selected
				? "border-primary bg-primary text-primary-foreground"
				: "border-border bg-background text-foreground hover:border-foreground/60"
		);

	const groupTitle = "mb-2.5 text-[11px] font-black uppercase tracking-[0.14em]";

	return (
		<div className="space-y-6">
			{/* Special pages — single-select, matching the shared semantics */}
			<fieldset>
				<legend className={groupTitle}>
					{t("products.specialOffers", "Special Offers")}
				</legend>
				<div className="flex flex-wrap gap-1.5">
					{specials.map(({ value, label }) => {
						const selected = draft.special === value;
						return (
							<button
								key={value}
								type="button"
								aria-pressed={selected}
								onClick={() =>
									onChange({ ...draft, special: selected ? "" : value })
								}
								className={optionClass(selected)}
							>
								{label}
							</button>
						);
					})}
				</div>
			</fieldset>

			{/* Departments — multi-select */}
			{flatCategories.length > 0 && (
				<fieldset>
					<legend className={groupTitle}>
						{t("products.categories", "Categories")}
					</legend>
					<div className="flex flex-wrap gap-1.5">
						{flatCategories.map(({ id, name, depth }) => {
							const selected = draft.categories.includes(id);
							return (
								<button
									key={id}
									type="button"
									aria-pressed={selected}
									onClick={() =>
										onChange({
											...draft,
											categories: toggle(draft.categories, id),
										})
									}
									className={cn(
										optionClass(selected),
										depth > 0 && !selected && "text-muted-foreground"
									)}
								>
									{name}
								</button>
							);
						})}
					</div>
				</fieldset>
			)}

			{/* Brands — multi-select */}
			{brands.length > 0 && (
				<fieldset>
					<legend className={groupTitle}>
						{t("products.brands", "Brands")}
					</legend>
					<div className="flex flex-wrap gap-1.5">
						{brands.map((brand) => {
							const id = String(brand.id);
							const selected = draft.brands.includes(id);
							return (
								<button
									key={brand.id}
									type="button"
									aria-pressed={selected}
									onClick={() =>
										onChange({ ...draft, brands: toggle(draft.brands, id) })
									}
									className={optionClass(selected)}
								>
									{brand.name}
								</button>
							);
						})}
					</div>
				</fieldset>
			)}

			<PriceFacet draft={draft} onChange={onChange} />
		</div>
	);
}

/**
 * Price is typed, not dragged: min/max fields with an explicit apply so the
 * URL only changes on a settled range.
 */
function PriceFacet({
	draft,
	onChange,
}: {
	draft: CatalogueFilterDraft;
	onChange: (next: CatalogueFilterDraft) => void;
}) {
	const { t } = useTranslation();
	const [min, setMin] = useState(draft.priceMin);
	const [max, setMax] = useState(draft.priceMax);

	// Follow external resets (chips, clear-all).
	useEffect(() => {
		setMin(draft.priceMin);
		setMax(draft.priceMax);
	}, [draft.priceMin, draft.priceMax]);

	const apply = () => onChange({ ...draft, priceMin: min, priceMax: max });
	const dirty = min !== draft.priceMin || max !== draft.priceMax;

	const inputClass =
		"ring-warm-focus h-9 w-full min-w-0 rounded-sm border border-input bg-background px-2.5 text-sm tabular-nums placeholder:text-muted-foreground";

	return (
		<fieldset>
			<legend className="mb-2.5 text-[11px] font-black uppercase tracking-[0.14em]">
				{t("products.priceRange", "Price Range")}
			</legend>
			<form
				className="flex items-center gap-2"
				onSubmit={(e) => {
					e.preventDefault();
					apply();
				}}
			>
				<input
					type="number"
					inputMode="numeric"
					min={0}
					value={min}
					onChange={(e) => setMin(e.target.value)}
					placeholder={t("global.filters.min", "Min")}
					aria-label={t("global.filters.min", "Min")}
					className={inputClass}
				/>
				<span aria-hidden="true" className="text-muted-foreground">
					–
				</span>
				<input
					type="number"
					inputMode="numeric"
					min={0}
					value={max}
					onChange={(e) => setMax(e.target.value)}
					placeholder={t("global.filters.max", "Max")}
					aria-label={t("global.filters.max", "Max")}
					className={inputClass}
				/>
				<button
					type="submit"
					disabled={!dirty}
					className="ring-warm-focus h-9 shrink-0 rounded-sm border border-primary px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent"
				>
					{t("global.filters.apply", "Apply")}
				</button>
			</form>
		</fieldset>
	);
}
