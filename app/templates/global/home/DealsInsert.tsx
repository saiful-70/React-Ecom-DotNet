"use client";

import { ChevronRight, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { useHydrated } from "@/hooks/use-hydrated";
import type { Product } from "@/(app-routes)/products/model";
import { formatCatalogueDate } from "../_data/catalogue";
import { GlobalProductScroller } from "../product/GlobalProductScroller";
import "../global.css";

/**
 * The sale-pages insert: the ONLY band where sale-red owns the surface.
 * Products come from the backend's today-deal flag, so the printed validity
 * line is honest — "Prices valid today, <date>" restates what `today_deal`
 * means. No countdown theatre, no invented stock counts. Renders nothing
 * without deals.
 */
export function DealsInsert({ products }: { products: Product[] }) {
	const { t, i18n } = useTranslation();
	const isHydrated = useHydrated();

	if (products.length === 0) return null;

	return (
		<section id="today-deals" className="container mx-auto">
			<div className="g-corners g-corners-accent rounded-sm bg-accent p-1.5">
				<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-3 pb-2.5 pt-2 text-accent-foreground">
					<h2 className="flex items-center gap-2 font-display text-xl font-black uppercase tracking-tight md:text-2xl">
						<Tag className="h-5 w-5" aria-hidden="true" />
						{t("global.deals.title", "The sale pages")}
					</h2>
					<p className="text-xs font-medium md:text-sm" suppressHydrationWarning>
						{t("global.deals.validToday", "Prices valid today")}
						{isHydrated && (
							<span className="tabular-nums">
								{", "}
								{formatCatalogueDate(new Date(), i18n.language)}
							</span>
						)}
					</p>
					<Link
						href={`${ABSOLUTE_ROUTES.PRODUCTS}?today_deal=1`}
						className="ring-warm-focus flex items-center gap-1 rounded-sm text-sm font-semibold underline-offset-4 hover:underline"
					>
						{t("global.viewAll")}
						<ChevronRight className="h-4 w-4" />
					</Link>
				</div>
				<div className="rounded-sm bg-background p-3">
					<GlobalProductScroller products={products} />
				</div>
			</div>
		</section>
	);
}
