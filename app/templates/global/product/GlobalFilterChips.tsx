"use client";

import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import type { Category, ChildCategory } from "@/components/shared/models/category";
import type { Brand } from "@/components/shared/models/brand";
import { trackFilterChanged } from "@/lib/analytics/tracking";
import {
	draftFromParams,
	paramsFromDraft,
	type CatalogueFilterDraft,
} from "./listing-filters";
import "../global.css";

/**
 * Applied-filter chips printed above the grid: each with its own ×, plus
 * "Clear all". Removing a chip rewrites the same URL params the shared
 * filters use (page reset to 1, scroll kept).
 */
export function GlobalFilterChips({
	categories,
	brands,
}: {
	categories: Category[];
	brands: Brand[];
}) {
	const { t } = useTranslation();
	const router = useRouter();
	const searchParams = useSearchParams();
	const draft = draftFromParams(searchParams);
	const search = searchParams.get("search") ?? "";

	const categoryNames = new Map<string, string>();
	const walk = (cat: Category | ChildCategory) => {
		categoryNames.set(String(cat.id), cat.name);
		if ("child_category" in cat && Array.isArray(cat.child_category)) {
			cat.child_category.forEach(walk);
		}
	};
	categories.forEach(walk);
	const brandNames = new Map(brands.map((b) => [String(b.id), b.name]));

	const push = (next: CatalogueFilterDraft, clearSearch = false) => {
		const params = paramsFromDraft(next, searchParams.toString());
		if (clearSearch) params.delete("search");
		router.push(`/products?${params.toString()}`, { scroll: false });
	};

	const specialLabels: Record<string, string> = {
		featured: t("products.featured", "Featured Products"),
		today_deal: t("products.todayDeals", "Today's Deals"),
		top_selling: t("products.topSelling", "Top Selling"),
	};

	const chips: { key: string; label: string; onRemove: () => void }[] = [];

	draft.categories.forEach((id) =>
		chips.push({
			key: `cat-${id}`,
			label: categoryNames.get(id) ?? `#${id}`,
			onRemove: () => {
				void trackFilterChanged("Category", categoryNames.get(id) ?? id);
				push({ ...draft, categories: draft.categories.filter((c) => c !== id) });
			},
		})
	);
	draft.brands.forEach((id) =>
		chips.push({
			key: `brand-${id}`,
			label: brandNames.get(id) ?? `#${id}`,
			onRemove: () => {
				void trackFilterChanged("Brand", brandNames.get(id) ?? id);
				push({ ...draft, brands: draft.brands.filter((b) => b !== id) });
			},
		})
	);
	if (draft.priceMin || draft.priceMax) {
		chips.push({
			key: "price",
			label: `${t("products.priceRange", "Price Range")}: ${draft.priceMin || "0"}–${draft.priceMax || "∞"}`,
			onRemove: () => {
				void trackFilterChanged("Price", "(cleared)");
				push({ ...draft, priceMin: "", priceMax: "" });
			},
		});
	}
	if (draft.special) {
		chips.push({
			key: "special",
			label: specialLabels[draft.special],
			onRemove: () => {
				void trackFilterChanged("SpecialOffer", "(cleared)");
				push({ ...draft, special: "" });
			},
		});
	}
	if (search) {
		chips.push({
			key: "search",
			label: `${t("global.filters.searchChip", "Search")}: “${search}”`,
			onRemove: () => push(draft, true),
		});
	}

	if (chips.length === 0) return null;

	return (
		<div className="mb-4 flex flex-wrap items-center gap-1.5 border-b border-border pb-4">
			{chips.map(({ key, label, onRemove }) => (
				<span
					key={key}
					className="flex items-center gap-1 rounded-sm border border-border bg-muted py-1 pl-2.5 pr-1 text-xs font-medium"
				>
					{label}
					<button
						type="button"
						onClick={onRemove}
						aria-label={t("global.filters.remove", "Remove filter: {{name}}", {
							name: label,
						})}
						className="ring-warm-focus rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
					>
						<X className="h-3.5 w-3.5" />
					</button>
				</span>
			))}
			<button
				type="button"
				onClick={() => {
					void trackFilterChanged("All", "(cleared)");
					router.push("/products", { scroll: false });
				}}
				className="ring-warm-focus ml-1 rounded-sm text-xs font-semibold text-primary underline-offset-4 hover:underline"
			>
				{t("global.filters.clearAll", "Clear all")}
			</button>
		</div>
	);
}
