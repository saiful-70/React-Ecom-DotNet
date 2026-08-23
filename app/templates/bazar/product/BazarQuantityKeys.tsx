"use client";

import { Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import "../bazar.css";

interface BazarQuantityKeysProps {
	quantity: number;
	onQuantityChange: (quantity: number) => void;
	/** Available stock — the upper bound; 0 disables the whole strip. */
	stock: number;
}

/**
 * Quantity as keypad keys: a minus key, the tabular readout on chart-white,
 * a plus key — each 48px and depressing like the top-up keypad. Bounds are
 * printed behaviour: minus disables at 1, plus disables at stock.
 */
export function BazarQuantityKeys({
	quantity,
	onQuantityChange,
	stock,
}: BazarQuantityKeysProps) {
	const { t } = useTranslation();

	const keyClass =
		"bz-key ring-warm-focus flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground shadow-warm-sm disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none";

	return (
		<div
			role="group"
			aria-label={t("bazar.quantity", "পরিমাণ")}
			className="inline-flex items-center gap-1.5"
		>
			<button
				type="button"
				onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
				disabled={stock <= 0 || quantity <= 1}
				aria-label={t("bazar.qtyDecrease", "পরিমাণ কমান")}
				className={keyClass}
			>
				<Minus className="h-4 w-4" aria-hidden="true" />
			</button>
			<output
				aria-label={t("bazar.quantity", "পরিমাণ")}
				className="bz-num flex h-12 min-w-14 items-center justify-center rounded-lg border border-border bg-background px-3 font-display text-lg font-bold"
			>
				{quantity}
			</output>
			<button
				type="button"
				onClick={() => onQuantityChange(Math.min(stock, quantity + 1))}
				disabled={stock <= 0 || quantity >= stock}
				aria-label={t("bazar.qtyIncrease", "পরিমাণ বাড়ান")}
				className={keyClass}
			>
				<Plus className="h-4 w-4" aria-hidden="true" />
			</button>
		</div>
	);
}
