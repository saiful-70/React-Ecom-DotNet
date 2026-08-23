"use client";

import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import Price from "@/components/shared/Price";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { Product } from "@/(app-routes)/products/model";
import { itemNo } from "../_data/catalogue";
import { CatalogueImage } from "../product/CatalogueImage";
import { GlobalRatingStars } from "../product/GlobalRatingStars";
import "../global.css";

function RankedList({ title, products }: { title: string; products: Product[] }) {
	const { t } = useTranslation();

	return (
		<div className="min-w-0">
			<h3 className="border-b border-border pb-2.5 font-display text-lg font-black uppercase tracking-tight">
				{title}
			</h3>
			<ol className="divide-y divide-border">
				{products.map((product, i) => (
					<li key={product.id}>
						<Link
							href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
							className="ring-warm-focus group flex items-center gap-4 rounded-sm py-3 transition-colors hover:bg-muted/60"
						>
							{/* The rank IS the information — a numbered order, not a feed. */}
							<span className="w-8 shrink-0 text-center font-display text-2xl font-black text-muted-foreground tabular-nums">
								{i + 1}
							</span>
							<span className="h-14 w-14 shrink-0 border border-border bg-background p-1">
								<CatalogueImage
									src={product.thumbnail_image}
									alt={product.name}
									itemId={product.id}
									width={56}
									height={56}
									className="h-full w-full object-contain"
								/>
							</span>
							<span className="min-w-0 flex-1">
								<span className="block truncate text-sm font-medium group-hover:underline">
									{product.name}
								</span>
								<span className="block text-[10px] uppercase tracking-[0.08em] text-muted-foreground tabular-nums">
									{t("global.catalogue.no", "No.")} {itemNo(product.id)}
								</span>
								<GlobalRatingStars
									rating={product.average_rating}
									count={product.total_reviews}
								/>
							</span>
							<span className="shrink-0 text-sm font-black tabular-nums">
								<Price amount={product.discounted_price} />
							</span>
						</Link>
					</li>
				))}
			</ol>
		</div>
	);
}

/**
 * Best-selling / top-rated as two ranked ledgers. Ordinal numbers carry real
 * information here (a ranking); rows are ruled lines, not cards.
 */
export function RankedColumns({
	bestSelling,
	topRated,
}: {
	bestSelling: Product[];
	topRated: Product[];
}) {
	const { t } = useTranslation();

	if (bestSelling.length === 0 && topRated.length === 0) return null;

	return (
		<div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
			{bestSelling.length > 0 && (
				<RankedList
					title={t("global.bestSelling")}
					products={bestSelling.slice(0, 6)}
				/>
			)}
			{topRated.length > 0 && (
				<RankedList
					title={t("global.topRated")}
					products={topRated.slice(0, 6)}
				/>
			)}
		</div>
	);
}
