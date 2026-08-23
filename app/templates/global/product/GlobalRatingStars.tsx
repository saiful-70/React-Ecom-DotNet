"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils/utils";

/**
 * Catalogue star rating: five ink stars with the filled portion clipped to
 * the average, plus the printed average ("4.3") and count. Hidden entirely
 * when there are no reviews — the catalogue never invents figures.
 */
export function GlobalRatingStars({
	rating,
	count,
	className,
}: {
	rating: number;
	count?: number;
	className?: string;
}) {
	if (!count || count <= 0) return null;

	const clamped = Math.max(0, Math.min(5, rating));

	return (
		<div className={cn("flex items-center gap-1.5", className)}>
			<div className="relative flex" aria-hidden="true">
				<div className="flex text-border">
					{Array.from({ length: 5 }).map((_, i) => (
						<Star key={i} className="h-3.5 w-3.5 fill-current" />
					))}
				</div>
				<div
					className="absolute inset-0 flex overflow-hidden text-foreground"
					style={{ width: `${(clamped / 5) * 100}%` }}
				>
					{Array.from({ length: 5 }).map((_, i) => (
						<Star key={i} className="h-3.5 w-3.5 shrink-0 fill-current" />
					))}
				</div>
			</div>
			<span className="text-xs text-muted-foreground tabular-nums">
				{clamped.toFixed(1)} ({count})
			</span>
		</div>
	);
}
