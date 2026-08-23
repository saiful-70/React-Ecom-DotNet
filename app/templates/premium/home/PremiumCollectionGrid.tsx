"use client";

import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import type { Product } from "@/(app-routes)/products/model";
import { PremiumProductCard } from "../product/PremiumProductCard";
import "../premium.css";

interface PremiumCollectionGridProps {
	titleKey: string;
	titleDefault: string;
	products: Product[];
	viewAllHref?: string;
	/** Anchor id for the shared smooth-scroll navigation contract. */
	id?: string;
}

/**
 * A collection grid section: didone heading flanked by foil rules, specimen
 * cards, and a quiet index link to the full collection.
 */
export function PremiumCollectionGrid({
	titleKey,
	titleDefault,
	products,
	viewAllHref,
	id,
}: PremiumCollectionGridProps) {
	const { t } = useTranslation();

	if (products.length === 0) return null;

	return (
		<section id={id} className="container mx-auto">
			<div className="premium-rule-flank mb-10">
				<h2 className="font-display text-2xl tracking-tight md:text-4xl">
					{t(titleKey, titleDefault)}
				</h2>
			</div>
			<div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
				{products.slice(0, 8).map((product) => (
					<PremiumProductCard key={product.id} product={product} />
				))}
			</div>
			{viewAllHref && (
				<div className="mt-10 text-center">
					<Link
						href={viewAllHref}
						className="ring-warm-focus inline-block border-b border-border pb-1 text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:border-primary"
					>
						{t("premium.viewCollection", "View the collection")}
					</Link>
				</div>
			)}
		</section>
	);
}
