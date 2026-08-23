"use client";

import { useEffect, useState } from "react";
import { Grid2x2 as Grid, List, Search, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { useDebounce } from "@/hooks/use-debounce";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/shared/ui/select";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { trackSortChanged } from "@/lib/analytics/tracking";
import { cn } from "@/lib/utils/utils";
import "../global.css";

/**
 * The listing's control rule: search within the index, sort order, grid/list
 * view, and (on mobile) the Filters button that opens the full-screen sheet.
 * URL semantics — search/sort/view/page — are identical to the shared toolbar.
 */
export function GlobalListingControls({
	activeFiltersCount,
	onOpenFilters,
}: {
	activeFiltersCount: number;
	onOpenFilters: () => void;
}) {
	const { t } = useTranslation();
	const router = useRouter();
	const searchParams = useSearchParams();

	const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
	const [isUserInput, setIsUserInput] = useState(false);
	const debouncedSearch = useDebounce(searchQuery, 500);

	const sortBy = searchParams.get("sort") || "name_asc";
	const viewMode = (searchParams.get("view") as "grid" | "list") || "grid";

	// Follow external URL changes (e.g. header search).
	const urlSearch = searchParams.get("search") || "";
	useEffect(() => {
		setSearchQuery(urlSearch);
		setIsUserInput(false);
	}, [urlSearch]);

	// Debounced search — only when the user typed.
	useEffect(() => {
		if (!isUserInput) return;
		const current = searchParams.get("search") || "";
		if (debouncedSearch !== current) {
			const params = new URLSearchParams(searchParams.toString());
			if (debouncedSearch === "") params.delete("search");
			else params.set("search", debouncedSearch);
			params.set("page", "1");
			router.push(ABSOLUTE_ROUTES.PRODUCT_BY_SEARCH_PARAMS(params.toString()));
		}
	}, [debouncedSearch, searchParams, router, isUserInput]);

	const updateURL = (updates: Record<string, string | null>) => {
		const params = new URLSearchParams(searchParams.toString());
		Object.entries(updates).forEach(([key, value]) => {
			if (value === null || value === "") params.delete(key);
			else params.set(key, value);
		});
		router.push(ABSOLUTE_ROUTES.PRODUCT_BY_SEARCH_PARAMS(params.toString()));
	};

	const sortOptions = [
		{ value: "name_asc", label: t("products.nameAZ", "Name A-Z") },
		{ value: "name_desc", label: t("products.nameZA", "Name Z-A") },
		{
			value: "price_low_high",
			label: t("products.priceLowHigh", "Price: Low to High"),
		},
		{
			value: "price_high_low",
			label: t("products.priceHighLow", "Price: High to Low"),
		},
	];

	const viewButton = (mode: "grid" | "list", Icon: typeof Grid, label: string) => (
		<button
			type="button"
			onClick={() => updateURL({ view: mode })}
			aria-label={label}
			aria-pressed={viewMode === mode}
			className={cn(
				"ring-warm-focus flex h-9 w-9 items-center justify-center transition-colors",
				viewMode === mode
					? "bg-foreground text-background"
					: "bg-background text-muted-foreground hover:text-foreground"
			)}
		>
			<Icon className="h-4 w-4" />
		</button>
	);

	return (
		<div className="mb-4 flex flex-wrap items-center gap-2 border-b border-border pb-4">
			{/* Search within the index */}
			<div className="relative min-w-0 flex-1 basis-56">
				<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<input
					type="search"
					value={searchQuery}
					onChange={(e) => {
						setSearchQuery(e.target.value);
						setIsUserInput(true);
					}}
					placeholder={t("products.searchPlaceholder", "Search products...")}
					aria-label={t("products.searchPlaceholder", "Search products...")}
					className="ring-warm-focus h-9 w-full rounded-sm border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground"
				/>
			</div>

			{/* Mobile: open the filter sheet */}
			<button
				type="button"
				onClick={onOpenFilters}
				className="ring-warm-focus flex h-9 items-center gap-2 rounded-sm border border-border px-3 text-sm font-semibold transition-colors hover:border-foreground lg:hidden"
			>
				<SlidersHorizontal className="h-4 w-4" />
				{t("products.filters", "Filters")}
				{activeFiltersCount > 0 && (
					<span className="rounded-sm bg-primary px-1.5 text-xs font-bold text-primary-foreground tabular-nums">
						{activeFiltersCount}
					</span>
				)}
			</button>

			<Select
				value={sortBy}
				onValueChange={(value) => {
					void trackSortChanged(value);
					updateURL({ sort: value, page: "1" });
				}}
			>
				<SelectTrigger
					className="h-9 w-44 rounded-sm"
					aria-label={t("products.sortBy", "Sort by")}
				>
					<SelectValue placeholder={t("products.sortBy", "Sort by")} />
				</SelectTrigger>
				<SelectContent>
					{sortOptions.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<div className="hidden divide-x divide-border overflow-hidden rounded-sm border border-border md:flex">
				{viewButton("grid", Grid, t("global.filters.gridView", "Grid view"))}
				{viewButton("list", List, t("global.filters.listView", "List view"))}
			</div>
		</div>
	);
}
