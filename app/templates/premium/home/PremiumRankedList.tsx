"use client";

import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import Price from "@/components/shared/Price";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { Product } from "@/(app-routes)/products/model";
import { lotLine, primaryImage } from "../lib";
import { PremiumImage } from "../product/PremiumImage";
import "../premium.css";

/**
 * "Most ordered" as a ranked ledger: numbered hairline rows (the rank IS the
 * information), small specimen thumbnail, didone name, LOT line, price.
 */
export function PremiumRankedList({
	products,
	id,
}: {
	products: Product[];
	id?: string;
}) {
	const { t } = useTranslation();

	if (products.length === 0) return null;

	return (
		<section id={id} className="container mx-auto">
			<div className="premium-rule-flank mb-8">
				<h2 className="font-display text-2xl tracking-tight md:text-4xl">
					{t("premium.mostOrdered", "Most ordered")}
				</h2>
			</div>
			<ol className="mx-auto max-w-3xl">
				{products.slice(0, 5).map((product, index) => {
					const image = primaryImage(product);
					return (
						<li key={product.id}>
							<Link
								href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
								className="ring-warm-focus group flex items-center gap-5 border-b border-border/40 py-4"
							>
								<span className="w-8 shrink-0 font-display text-2xl text-muted-foreground tabular-nums">
									{index + 1}
								</span>
								<span className="relative h-14 w-14 shrink-0 overflow-hidden bg-muted">
									<PremiumImage
										src={image}
										alt=""
										sizes="56px"
										className="object-cover"
										plateClassName="[&>span]:text-xs"
									/>
								</span>
								<span className="min-w-0 flex-1">
									<span className="block truncate font-display text-lg leading-snug group-hover:underline group-hover:decoration-border group-hover:underline-offset-4">
										{product.name}
									</span>
									<span className="block text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
										{lotLine(product)}
									</span>
								</span>
								<span className="shrink-0 text-sm tabular-nums">
									<Price amount={Number(product.discounted_price)} />
								</span>
							</Link>
						</li>
					);
				})}
			</ol>
		</section>
	);
}
