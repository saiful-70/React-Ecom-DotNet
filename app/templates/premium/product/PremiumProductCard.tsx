"use client";

import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import Price from "@/components/shared/Price";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { Product } from "@/(app-routes)/products/model";
import { lotLine, primaryImage } from "../lib";
import { PremiumImage } from "./PremiumImage";
import "../premium.css";

/**
 * Premium collection card: the specimen on the lacquer, framed by box-board
 * corners, with a small label-stock caption strip — didone name, Jost-caps
 * LOT line, tabular price. Whole card is one link; no button clutter.
 */
export function PremiumProductCard({ product }: { product: Product }) {
	const { t } = useTranslation();
	const image = primaryImage(product);
	const price = Number(product.discounted_price);
	const original = Number(product.price);
	const soldOut = product.stock <= 0;

	return (
		<Link
			href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
			className="ring-warm-focus group block"
			aria-label={product.name}
		>
			<div className="premium-corners relative aspect-square overflow-hidden bg-muted">
				<PremiumImage
					src={image}
					alt={product.name}
					sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
					className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
				/>
				{soldOut && (
					<span className="absolute left-2 top-2 z-[3] bg-accent px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-accent-foreground">
						{t("premium.soldOut", "Sold out")}
					</span>
				)}
			</div>

			<div className="mt-3 space-y-1">
				<h3 className="font-display text-lg leading-snug text-foreground group-hover:underline group-hover:decoration-border group-hover:underline-offset-4">
					{product.name}
				</h3>
				<p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
					{lotLine(product)}
				</p>
				<p className="flex items-baseline gap-2 text-sm text-foreground tabular-nums">
					<Price amount={price} />
					{original > price && (
						<span className="text-muted-foreground line-through">
							<Price amount={original} />
						</span>
					)}
				</p>
			</div>
		</Link>
	);
}
