"use client";

import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";

interface ProductRatingProps {
	averageRating: number;
	totalReviews: number;
}

export function ProductRating({
	averageRating,
	totalReviews,
}: ProductRatingProps) {
	const { t } = useTranslation();

	// An unreviewed product showed "0.0 (0 reviews)" with five empty stars, which
	// reads as a bad score rather than as no data. Render nothing instead.
	if (!totalReviews || totalReviews < 1) return null;

	return (
		<div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 lg:mb-4">
			<div className="flex items-center">
				{[...Array(5)].map((_, i) => (
					<Star
						key={i}
						className={`w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 ${
							i < Math.floor(averageRating || 0)
								? "fill-yellow-400 text-yellow-400"
								: "text-muted-foreground"
						}`}
					/>
				))}
			</div>
			<span className="text-[11px] sm:text-xs lg:text-sm text-muted-foreground">
				{averageRating.toFixed(1)} (
				{t("productDetails.reviewsCount", {
					count: totalReviews,
				}) || `${totalReviews} reviews`}
				)
			</span>
		</div>
	);
}
