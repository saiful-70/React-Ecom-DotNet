"use client";

import { useTranslation } from "react-i18next";
import { Badge } from "@/components/shared/ui/badge";

interface ProductBadgesProps {
	discount: number;
	isFeatured: boolean;
	isTodayDeal: boolean;
}

export function ProductBadges({
	discount,
	isFeatured,
	isTodayDeal,
}: ProductBadgesProps) {
	const { t } = useTranslation();

	return (
		<div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
			{discount > 0 && (
				<Badge
					variant="destructive"
					className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5"
				>
					{t("productDetails.saleDiscount", {
						discount,
					}) || `Sale -${discount}%`}
				</Badge>
			)}
			{isFeatured && (
				<Badge
					variant="default"
					className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5"
				>
					{t("productDetails.featured") || "Featured"}
				</Badge>
			)}
			{isTodayDeal && (
				<Badge className="bg-accent text-accent-foreground text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
					{t("productDetails.todaysDeal") || "Today's Deal"}
				</Badge>
			)}
		</div>
	);
}
