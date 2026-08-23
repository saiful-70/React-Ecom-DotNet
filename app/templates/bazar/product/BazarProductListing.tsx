"use client";

import { useAtomValue } from "jotai";
import { PhoneCall, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ProductsInfiniteList } from "@/components/product/ProductsInfiniteList";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { trackMenuClick } from "@/lib/analytics/tracking";
import type { ProductListingLayoutProps } from "@/templates/types";
import { deptStyle } from "../dept-color";
import { BazarProductCard } from "./BazarProductCard";
import { cn } from "@/lib/utils/utils";
import "../bazar.css";

/**
 * The listing as a department chart: breadcrumb strip with the tabular result
 * count, the SIM-coloured department rail (same colour per department as the
 * home rail — assigned by top-level index, never remixed), an active-filter
 * chip with a clear key, then the infinite chart-tile grid. Filters/search
 * still work via URL params; this paradigm has no filter sidebar.
 */
export function BazarProductListing({
	products,
	meta,
	categories,
	activeFiltersCount,
	baseQuery,
	infiniteListKey,
	perPage,
	selectedCategoryName,
}: ProductListingLayoutProps) {
	const { t } = useTranslation();
	const settings = useAtomValue(businessSettingsAtom);

	const topLevelCategories = categories.filter(
		(category) => category.parent_id === null
	);
	const activeCategoryId = Number(baseQuery.category_id) || null;
	const total = meta?.total ?? products.length;

	return (
		<main className="container mx-auto py-6">
			{/* Breadcrumb strip — a chart line, closed by the board rule. */}
			<nav
				className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-[3px] border-secondary pb-3 text-sm"
				aria-label="Breadcrumb"
			>
				<div>
					<Link
						href="/"
						className="ring-warm-focus rounded-md font-bold underline-offset-4 hover:text-primary hover:underline"
					>
						{t("bazar.home")}
					</Link>
					<span className="mx-2 text-muted-foreground" aria-hidden="true">
						/
					</span>
					<span className="font-display text-base font-bold">
						{selectedCategoryName ?? t("bazar.products")}
					</span>
				</div>
				<span className="bz-num text-xs font-semibold text-muted-foreground">
					{t("bazar.resultCount", {
						defaultValue: "{{count}}টি পণ্য",
						count: total,
					})}
				</span>
			</nav>

			{/* Department rail — enter a department by its colour. */}
			{topLevelCategories.length > 0 && (
				<ul
					className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
					aria-label={t("bazar.allDepartments")}
				>
					{topLevelCategories.map((category, index) => {
						const isActive = category.id === activeCategoryId;
						return (
							<li
								key={category.id}
								className="shrink-0"
								style={deptStyle(index)}
							>
								<Link
									href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(
										category.id
									)}
									onClick={() =>
										trackMenuClick({
											menuId: `category-${category.id}`,
											menuName: category.name,
										})
									}
									aria-current={isActive ? "page" : undefined}
									className={cn(
										"bz-key ring-warm-focus inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-bold",
										isActive
											? "bg-secondary text-secondary-foreground shadow-warm-sm"
											: "bz-dept-chip"
									)}
								>
									<span
										className="bz-dept-dot h-2.5 w-2.5 rounded-full"
										aria-hidden="true"
									/>
									{category.name}
								</Link>
							</li>
						);
					})}
				</ul>
			)}

			{/* Active filters — status pill + clear key. */}
			{activeFiltersCount > 0 && (
				<div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
					<span className="bz-num rounded-full bg-muted px-3 py-1 font-semibold text-muted-foreground">
						{t("bazar.filtersActive", {
							defaultValue: "{{count}}টি ফিল্টার চালু",
							count: activeFiltersCount,
						})}
					</span>
					<Link
						href={ABSOLUTE_ROUTES.PRODUCTS}
						className="bz-key ring-warm-focus inline-flex min-h-8 items-center gap-1 rounded-lg border border-border bg-card px-3 text-xs font-bold hover:border-accent hover:text-accent"
					>
						<X className="h-3.5 w-3.5" aria-hidden="true" />
						{t("bazar.clearFilters", "সব ফিল্টার মুছুন")}
					</Link>
				</div>
			)}

			{products.length === 0 ? (
				/* Empty chart — name the problem, offer the counter's recovery. */
				<div className="rounded-lg border border-dashed border-border bg-card px-6 py-14 text-center shadow-warm-sm">
					<h2 className="font-display text-xl font-bold">
						{t("bazar.emptyTitle", "কোনো পণ্য পাওয়া যায়নি")}
					</h2>
					<p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
						{t(
							"bazar.emptyBody",
							"অন্য বিভাগ দেখুন, অথবা আমাদের কল করুন — আমরা খুঁজে দেব"
						)}
					</p>
					<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
						<Link
							href={ABSOLUTE_ROUTES.PRODUCTS}
							className="bz-key ring-warm-focus inline-flex min-h-12 items-center rounded-lg bg-secondary px-6 text-sm font-bold text-secondary-foreground shadow-warm-sm"
						>
							{t("bazar.browseAll", "সব পণ্য দেখুন")}
						</Link>
						{settings?.contact_phone && (
							<a
								href={`tel:${settings.contact_phone}`}
								className="bz-key ring-warm-focus inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground shadow-warm-sm"
							>
								<PhoneCall className="h-4 w-4" aria-hidden="true" />
								{t("bazar.callNow", "এখনই কল করুন")}
							</a>
						)}
					</div>
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
					viewMode="grid"
					CardComponent={BazarProductCard}
				/>
			)}
		</main>
	);
}
