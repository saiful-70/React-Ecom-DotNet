"use client";

import { useTranslation } from "react-i18next";
import Price from "@/components/shared/Price";
import { cn } from "@/lib/utils/utils";
import "../global.css";

/**
 * Sticky mobile buy bar. Purely presentational — price, selected-variant
 * text and stock all come from the PDP's single source of truth, and the CTA
 * calls the same add-to-cart handler as the main form. Slides in with the
 * page-turn settle when the buy box scrolls out of view; sits above the
 * mobile bottom nav. The PDP reserves bottom padding so it never causes CLS.
 */
export function GlobalStickyBuyBar({
	visible,
	productName,
	variantText,
	price,
	inStock,
	onAddToCart,
}: {
	visible: boolean;
	productName: string;
	variantText: string | null;
	price: number;
	inStock: boolean;
	onAddToCart: () => void;
}) {
	const { t } = useTranslation();

	return (
		<div
			aria-hidden={!visible}
			className={cn(
				"fixed inset-x-0 bottom-16 z-40 border-t border-border bg-background transition-transform duration-500 [transition-timing-function:var(--g-ease)] md:hidden",
				visible ? "translate-y-0" : "pointer-events-none translate-y-[130%]"
			)}
		>
			<div className="container mx-auto flex items-center gap-3 py-2.5">
				<div className="min-w-0 flex-1">
					<p className="truncate text-xs font-medium">
						{productName}
						{variantText && (
							<span className="text-muted-foreground"> · {variantText}</span>
						)}
					</p>
					<p className="text-base font-black tabular-nums">
						<Price amount={price} />
					</p>
				</div>
				<button
					type="button"
					onClick={onAddToCart}
					disabled={!inStock}
					tabIndex={visible ? 0 : -1}
					className="ring-warm-focus shrink-0 rounded-sm bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
				>
					{inStock ? t("global.addToCart") : t("global.stockOut")}
				</button>
			</div>
		</div>
	);
}
