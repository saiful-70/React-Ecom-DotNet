"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils/utils";

/**
 * Compact star rating. Renders five stars with the filled portion clipped to
 * the average, plus an optional review count. Hidden entirely when there are
 * no reviews (keeps cards clean, like the reference).
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
		<div className={cn("flex items-center gap-1", className)}>
			<div className="relative flex">
				{/* Empty track */}
				<div className="flex text-muted-foreground/40">
					{Array.from({ length: 5 }).map((_, i) => (
						<Star key={i} className="h-3.5 w-3.5" />
					))}
				</div>
				{/* Filled overlay clipped to the rating */}
				<div
					className="absolute inset-0 flex overflow-hidden text-warning"
					style={{ width: `${(clamped / 5) * 100}%` }}
				>
					{Array.from({ length: 5 }).map((_, i) => (
						<Star key={i} className="h-3.5 w-3.5 shrink-0 fill-current" />
					))}
				</div>
			</div>
			<span className="text-xs text-muted-foreground tabular-nums">
				({count})
			</span>
		</div>
	);
}
