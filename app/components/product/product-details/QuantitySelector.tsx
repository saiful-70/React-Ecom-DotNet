"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/shared/ui/button";
import { Plus, Minus } from "lucide-react";

interface QuantitySelectorProps {
	quantity: number;
	onQuantityChange: (quantity: number) => void;
	stock?: number;
}

export function QuantitySelector({
	quantity,
	onQuantityChange,
	stock = 0,
}: QuantitySelectorProps) {
	const { t } = useTranslation();

	const handleDecrease = () => {
		if (quantity > 1) {
			onQuantityChange(quantity - 1);
		}
	};

	const handleIncrease = () => {
		if (quantity < stock) {
			onQuantityChange(quantity + 1);
		}
	};

	return (
		<div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
			<span className="text-xs sm:text-sm font-medium whitespace-nowrap">
				{t("productDetails.quantity") || "Quantity:"}
			</span>
			<div className="flex items-center gap-1.5 sm:gap-2">
				<Button
					variant="outline"
					size="icon"
					className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9"
					onClick={handleDecrease}
					disabled={quantity <= 1}
					aria-label={t("a11y.decreaseQuantity")}
				>
					<Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
				</Button>
				<span className="w-8 sm:w-10 lg:w-12 text-center font-medium text-sm sm:text-base">
					{quantity}
				</span>
				<Button
					variant="outline"
					size="icon"
					className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9"
					onClick={handleIncrease}
					disabled={quantity >= stock || stock <= 0}
					aria-label={t("a11y.increaseQuantity")}
				>
					<Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
				</Button>
			</div>
			{stock > 0 && (
				<span className="text-xs sm:text-sm text-muted-foreground ml-2">
					{stock} {t("productDetails.itemsLeft") || "item left"}
				</span>
			)}
		</div>
	);
}
