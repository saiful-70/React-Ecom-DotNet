"use client";

import { useTranslation } from "react-i18next";
import type { ProductVariant } from "@/(app-routes)/products/model";

interface ProductMetaProps {
	brand?: string;
	sku: string;
	selectedVariant?: ProductVariant | null;
}

export function ProductMeta({
	brand,
	sku,
	selectedVariant
}: ProductMetaProps) {
	const { t } = useTranslation();

	// The backend sends placeholders ("N/A", "-", "null") for products with no
	// brand. Printing those verbatim looks like a bug, so treat them as absent.
	const BRAND_PLACEHOLDERS = new Set(["n/a", "na", "-", "--", "null", "none"]);
	const brandName = brand?.trim();
	const hasBrand =
		!!brandName && !BRAND_PLACEHOLDERS.has(brandName.toLowerCase());

	return (
		<div className="space-y-2.5 sm:space-y-5 text-xs sm:text-sm">
			{hasBrand && (
				<div>
					<span className="font-medium">
						{t("productDetails.brand") || "Brand:"}{" "}
					</span>
					<span className="text-muted-foreground">{brandName}</span>
				</div>
			)}

			<div>
				<span className="font-medium">
					{t("productDetails.sku") || "SKU:"}{" "}
				</span>
				<span className="text-muted-foreground">
					{selectedVariant ? selectedVariant.sku : sku}
				</span>
			</div>
		</div>
	);
}
