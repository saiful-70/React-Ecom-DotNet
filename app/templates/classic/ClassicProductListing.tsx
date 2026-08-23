"use client";

import "./classic.css";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/shared/ui/select";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductsInfiniteList } from "@/components/product/ProductsInfiniteList";
import { useDebounce } from "@/hooks/use-debounce";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { trackSortChanged } from "@/lib/analytics/tracking";
import type { ProductListingLayoutProps } from "../types";
import { KhataProductCard } from "./product/KhataProductCard";

/**
 * The khata listing: a full page of the ledger. Heading over its double
 * rule, a written-entry search line and sort, the shared filter sidebar, and
 * the infinite ledger-entry grid (2 columns on phones). Filter/sort/search
 * semantics are URL-driven, identical to the shared toolbar.
 */
export function ClassicProductListing({
	products,
	meta,
	categories,
	brands,
	activeFiltersCount,
	baseQuery,
	infiniteListKey,
	viewMode,
	perPage,
	selectedCategoryName,
}: ProductListingLayoutProps) {
	const { t } = useTranslation();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [searchQuery, setSearchQuery] = useState(
		searchParams.get("search") || ""
	);
	const [isUserInput, setIsUserInput] = useState(false);
	const sortBy = searchParams.get("sort") || "name_asc";
	const debouncedSearchQuery = useDebounce(searchQuery, 500);

	// Keep the input in sync when the URL changes externally (header search).
	useEffect(() => {
		setSearchQuery(searchParams.get("search") || "");
		setIsUserInput(false);
	}, [searchParams.get("search")]);

	// Push the debounced query into the URL only for user-typed input.
	useEffect(() => {
		if (!isUserInput) return;
		const currentSearch = searchParams.get("search") || "";
		if (debouncedSearchQuery !== currentSearch) {
			const params = new URLSearchParams(searchParams.toString());
			if (!debouncedSearchQuery) {
				params.delete("search");
			} else {
				params.set("search", debouncedSearchQuery);
			}
			params.set("page", "1");
			router.push(
				ABSOLUTE_ROUTES.PRODUCT_BY_SEARCH_PARAMS(params.toString())
			);
		}
	}, [debouncedSearchQuery, searchParams, router, isUserInput]);

	const handleSortChange = (value: string) => {
		void trackSortChanged(value);
		const params = new URLSearchParams(searchParams.toString());
		params.set("sort", value);
		params.set("page", "1");
		router.push(ABSOLUTE_ROUTES.PRODUCT_BY_SEARCH_PARAMS(params.toString()));
	};

	const total = meta?.total || 0;

	return (
		<main className="container mx-auto py-6 md:py-8">
			<div className="khata-spine pl-5 md:pl-8">
				{/* Page heading over its double rule. */}
				<h1 className="font-display text-3xl font-bold text-balance md:text-4xl">
					{selectedCategoryName ?? t("classic2.allProducts", "সব পণ্য")}
				</h1>
				<p className="mt-1 text-sm tabular-nums text-muted-foreground">
					{t("classic2.entriesCount", "{{shown}} / {{total}} এন্ট্রি", {
						shown: products.length,
						total,
					})}
				</p>
				<div className="khata-rule-double mt-3" aria-hidden />

				{/* Search + sort written on one ledger line. */}
				<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
					<div className="relative flex-1 sm:max-w-md">
						<Search
							className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
							aria-hidden
						/>
						<input
							type="search"
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								setIsUserInput(true);
							}}
							placeholder={t(
								"classic2.searchPlaceholder",
								"খাতায় খুঁজুন…"
							)}
							aria-label={t(
								"classic2.searchPlaceholder",
								"খাতায় খুঁজুন…"
							)}
							className="ring-warm-focus h-11 w-full rounded-md border border-input bg-card pl-9 pr-3 text-base placeholder:text-muted-foreground md:text-sm"
						/>
					</div>
					<div className="flex items-center gap-2">
						<div className="sm:hidden">
							<ProductFilters
								categories={categories}
								brands={brands}
								activeFiltersCount={activeFiltersCount}
								buttonOnly
							/>
						</div>
						<Select value={sortBy} onValueChange={handleSortChange}>
							<SelectTrigger
								className="h-11 w-44 bg-card sm:w-52"
								aria-label={t("classic2.sortBy", "সাজান")}
							>
								<SelectValue
									placeholder={t("classic2.sortBy", "সাজান")}
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="name_asc">
									{t("classic2.sortNameAsc", "নাম: আগে অ→ঐ")}
								</SelectItem>
								<SelectItem value="name_desc">
									{t("classic2.sortNameDesc", "নাম: শেষ থেকে")}
								</SelectItem>
								<SelectItem value="price_low_high">
									{t(
										"classic2.sortPriceLowHigh",
										"দাম: কম থেকে বেশি"
									)}
								</SelectItem>
								<SelectItem value="price_high_low">
									{t(
										"classic2.sortPriceHighLow",
										"দাম: বেশি থেকে কম"
									)}
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Sidebar + ledger entries. */}
				<div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
					<div className="hidden sm:block">
						<ProductFilters
							categories={categories}
							brands={brands}
							activeFiltersCount={activeFiltersCount}
						/>
					</div>
					<div className="min-w-0 flex-1">
						{products.length === 0 ? (
							<div className="rounded-md border border-dashed bg-card px-6 py-16 text-center">
								<p className="font-display text-xl font-bold">
									{t(
										"classic2.emptyTitle",
										"খাতায় কোনো এন্ট্রি নেই"
									)}
								</p>
								<p className="mt-2 text-sm text-muted-foreground">
									{t(
										"classic2.emptyBody",
										"এই খোঁজে কিছু পাওয়া যায়নি — অন্য নামে খুঁজে দেখুন"
									)}
								</p>
								<Link
									href={ABSOLUTE_ROUTES.PRODUCTS}
									className="ring-warm-focus mt-5 inline-flex min-h-11 items-center rounded-md border border-accent/60 px-5 text-sm font-bold text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
								>
									{t("classic2.clearSearch", "সব পণ্য দেখুন")}
								</Link>
							</div>
						) : (
							<ProductsInfiniteList
								key={infiniteListKey}
								initialProducts={products}
								initialMeta={
									meta ?? {
										current_page: 1,
										per_page: perPage,
										total: products.length,
										last_page: 1,
										from: 1,
										to: products.length,
									}
								}
								baseQuery={baseQuery}
								viewMode={viewMode}
								CardComponent={KhataProductCard}
							/>
						)}
					</div>
				</div>
			</div>
		</main>
	);
}
