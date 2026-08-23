"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Product, ProductVariant } from "@/(app-routes)/products/model";
import "../premium.css";

interface PremiumVariantKeysProps {
	product: Product;
	onVariantChange: (variant: ProductVariant) => void;
	onColorChange?: (color: string, colorId?: number) => void;
}

/**
 * The pressed key row: variant selection as physical keys punched into the
 * label panel. Selected keys sit visibly deeper (inset shadow + 1px travel —
 * see .premium-key in premium.css), never tint-only. Buttons, never dropdowns.
 *
 * Combination order mirrors the backend contract: combination[0] is the
 * colour, combination[i+1] is attributes[i] (same as ProductVariantSelector).
 */
export function PremiumVariantKeys({
	product,
	onVariantChange,
	onColorChange,
}: PremiumVariantKeysProps) {
	const { t } = useTranslation();
	const [selectedColor, setSelectedColor] = useState<string>(
		() => product.colors?.[0]?.value || ""
	);
	const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(
		() => {
			const attrs: Record<string, string> = {};
			product.attributes?.forEach((attr) => {
				attrs[attr.name] = attr.values?.[0] || "";
			});
			return attrs;
		}
	);

	const findVariant = (
		color: string,
		attrs: Record<string, string>
	): ProductVariant | null =>
		product.variants?.find((v) => {
			const colorMatch =
				!product.colors?.length ||
				v.combination[0]?.toLowerCase() === color.toLowerCase();
			const attrsMatch = (product.attributes ?? []).every(
				(attr, idx) =>
					v.combination[idx + 1]?.toLowerCase() ===
					attrs[attr.name]?.toLowerCase()
			);
			return colorMatch && attrsMatch;
		}) || null;

	const handleColorClick = (color: string, colorId?: number) => {
		setSelectedColor(color);
		onColorChange?.(color, colorId);
		const variant = findVariant(color, selectedAttrs);
		if (variant) onVariantChange(variant);
	};

	const handleAttrClick = (attrName: string, value: string) => {
		const next = { ...selectedAttrs, [attrName]: value };
		setSelectedAttrs(next);
		const variant = findVariant(selectedColor, next);
		if (variant) onVariantChange(variant);
	};

	if (!product.variants?.length) return null;

	const keyClasses =
		"premium-key ring-warm-focus min-h-9 px-3.5 text-xs uppercase tracking-[0.12em]";

	return (
		<div className="space-y-4">
			{product.colors?.length > 0 && (
				<fieldset>
					<legend className="mb-2 text-[11px] uppercase tracking-[0.16em] text-card-foreground/70">
						{t("premium.colour", "Colour")}
					</legend>
					<div className="flex flex-wrap gap-2" role="group">
						{product.colors.map((color) => (
							<button
								key={color.id}
								type="button"
								onClick={() => handleColorClick(color.value, color.id)}
								className={keyClasses}
								aria-pressed={selectedColor === color.value}
							>
								{color.value}
							</button>
						))}
					</div>
				</fieldset>
			)}

			{product.attributes?.map((attr) => (
				<fieldset key={attr.id}>
					<legend className="mb-2 text-[11px] uppercase tracking-[0.16em] text-card-foreground/70">
						{attr.name}
					</legend>
					<div className="flex flex-wrap gap-2" role="group">
						{attr.values.map((value) => (
							<button
								key={value}
								type="button"
								onClick={() => handleAttrClick(attr.name, value)}
								className={keyClasses}
								aria-pressed={selectedAttrs[attr.name] === value}
							>
								{value}
							</button>
						))}
					</div>
				</fieldset>
			))}
		</div>
	);
}
