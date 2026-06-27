"use client";

import { useState } from "react";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { cn } from "@/lib/utils/utils";
import type { Product, ProductVariant } from "@/(app-routes)/products/model";

// Selected = filled primary; unselected = subtle border that becomes a primary
// outline on hover. Shared by the Color and attribute (Fabrics, etc.) options.
const optionClasses = (isSelected: boolean) =>
  cn(
    "h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap transition-all",
    isSelected
      ? "border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
      : "border-input bg-background hover:bg-transparent hover:text-foreground hover:border-primary hover:ring-1 hover:ring-primary"
  );

interface ProductVariantSelectorProps {
  product: Product;
  onVariantChange: (variant: ProductVariant) => void;
  onColorChange?: (color: string, colorId?: number) => void;
}

const getColorHex = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    black: "#000000",
    white: "#ffffff",
    red: "#ef4444",
    blue: "#3b82f6",
    green: "#22c55e",
    yellow: "#eab308",
    orange: "#f97316",
    purple: "#a855f7",
    pink: "#ec4899",
    gray: "#6b7280",
    grey: "#6b7280",
    brown: "#92400e",
    silver: "#c0c0c0",
    gold: "#d4af37",
    mist: "#d1d5db",
    sage: "#9ca3af",
    lavender: "#e9d5ff",
    navy: "#001f3f",
    teal: "#14b8a6",
    indigo: "#4f46e5",
    cyan: "#06b6d4",
    lime: "#84cc16",
    rose: "#f43f5e",
    slate: "#64748b",
    stone: "#78716c",
    zinc: "#71717a",
    amber: "#f59e0b",
    emerald: "#10b981",
    sky: "#0ea5e9",
    fuchsia: "#d946ef",
    violet: "#8b5cf6",
  };
  return colorMap[colorName.toLowerCase().trim()] || "#808080";
};

export function ProductVariantSelector({
  product,
  onVariantChange,
  onColorChange,
}: ProductVariantSelectorProps) {
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
  ): ProductVariant | null => {
    return (
      product.variants?.find((v) => {
        const colorMatch =
          v.combination[0]?.toLowerCase() === color.toLowerCase();
        const attrsMatch = product.attributes?.every(
          (attr, idx) =>
            v.combination[idx + 1]?.toLowerCase() ===
            attrs[attr.name]?.toLowerCase()
        );
        return colorMatch && attrsMatch;
      }) || null
    );
  };

  const handleColorClick = (color: string, colorId?: number) => {
    setSelectedColor(color);
    onColorChange?.(color, colorId);
    const variant = findVariant(color, selectedAttrs);
    if (variant) onVariantChange(variant);
  };

  const handleAttrClick = (attrName: string, value: string) => {
    const newAttrs = { ...selectedAttrs, [attrName]: value };
    setSelectedAttrs(newAttrs);
    const variant = findVariant(selectedColor, newAttrs);
    if (variant) onVariantChange(variant);
  };

  if (!product.variants?.length) return null;

  return (
    <div className="space-y-4 sm:space-y-4 -mt-4">
      {product.colors?.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-medium block">
            Color:
          </label>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <Button
                key={color.id}
                variant="outline"
                size="sm"
                onClick={() =>
                  handleColorClick(color.value, color.id)
                }
                className={optionClasses(
                  selectedColor === color.value
                )}
                title={color.value}
              >
                <div
                  className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0 mr-2"
                  style={{
                    backgroundColor: getColorHex(
                      color.value
                    ),
                  }}
                />
                {color.value}
                {selectedColor === color.value && (
                  <Badge
                    variant="outline"
                    className="ml-2 text-[10px] border-primary-foreground/40 text-primary-foreground"
                  >
                    ✓
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
      )}

      {product.attributes?.map((attr) => (
        <div key={attr.id} className="space-y-2.5">
          <label className="text-xs sm:text-sm font-medium block">
            {attr.name}:
          </label>
          <div className="flex flex-wrap gap-2">
            {attr.values.map((value) => (
              <Button
                key={value}
                variant="outline"
                size="sm"
                onClick={() =>
                  handleAttrClick(attr.name, value)
                }
                className={optionClasses(
                  selectedAttrs[attr.name] === value
                )}
              >
                {value}
                {selectedAttrs[attr.name] === value && (
                  <Badge
                    variant="outline"
                    className="ml-2 text-[10px] border-primary-foreground/40 text-primary-foreground"
                  >
                    ✓
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
      ))}

      {/* {selectedVariant && (
				<div className="text-sm text-muted-foreground">
					{selectedVariantStock > 0 ? (
						<span>{selectedVariantStock} in stock</span>
					) : (
						<span className="text-red-500">Out of Stock</span>
					)}
				</div>
			)} */}
    </div>
  );
}
