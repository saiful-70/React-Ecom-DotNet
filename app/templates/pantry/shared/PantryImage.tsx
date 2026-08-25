"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import "../pantry.css";

interface PantryImageProps {
	/** Image URL; null, empty, or a 404 renders the plate instead. */
	src: string | null | undefined;
	alt: string;
	sizes?: string;
	className?: string;
	priority?: boolean;
	/** Extra classes for the fallback plate. */
	plateClassName?: string;
	/**
	 * How large the box is, so the plate's name can be set to fill it. `card`
	 * (the default) is tuned for a ~140–340px tile; `hero` for a full-bleed
	 * band. Optional: existing call sites keep card behaviour.
	 */
	plateScale?: "card" | "hero";
	/**
	 * Suppress the plate's own lettering. Pass `false` where the surrounding
	 * layout already prints the same name directly beneath the tile (the
	 * department rail), so an image-less item is not named twice.
	 */
	plateLabel?: boolean;
	/** Fired when a URL existed but failed to load. */
	onBroken?: () => void;
}

/**
 * The plate's type. Tiro Bangla has one weight, so the box is filled by scale
 * alone — never by bolding the display face.
 */
const PLATE_TYPE: Record<"card" | "hero", string> = {
	card: "px-3 text-2xl leading-[1.15] md:text-3xl",
	hero: "px-6 text-3xl leading-tight md:text-5xl lg:text-6xl",
};

/**
 * Fill-mode product image for a world whose whole argument is what the food
 * looks like. When the photograph is missing or broken it degrades to a
 * stone plate carrying the item's own NAME in the pantry serif — never an
 * initial, which reads as a broken image and collides the moment two items
 * share a first letter ("Baking" and "Baking tools").
 *
 * This world leans harder on photography than any other, so the plate is
 * treated as a designed state rather than an error: the tile's proportions, the
 * world's 1px hairline, foreground-strength type, and a size per `plateScale`
 * that fills the box instead of floating in the middle of it.
 */
export function PantryImage({
	src,
	alt,
	sizes,
	className,
	priority,
	plateClassName,
	plateScale = "card",
	plateLabel = true,
	onBroken,
}: PantryImageProps) {
	const [broken, setBroken] = useState(false);

	// A new URL gets a fresh chance (gallery thumbnail switching).
	useEffect(() => {
		setBroken(false);
	}, [src]);

	const clean = typeof src === "string" ? src.trim() : "";

	if (!clean || broken) {
		const name = alt.trim();
		return (
			<span
				aria-hidden="true"
				className={cn(
					"absolute inset-0 flex items-center justify-center border border-border bg-muted",
					plateClassName,
				)}
			>
				{plateLabel ? (
					<span
						className={cn(
							"line-clamp-2 text-balance text-center font-display text-foreground",
							PLATE_TYPE[plateScale],
						)}
					>
						{name}
					</span>
				) : (
					<Leaf
						className="h-12 w-12 text-primary/40 md:h-16 md:w-16"
						aria-hidden="true"
					/>
				)}
			</span>
		);
	}

	return (
		<Image
			src={clean}
			alt={alt}
			fill
			sizes={sizes}
			priority={priority}
			className={className}
			onError={() => {
				setBroken(true);
				onBroken?.();
			}}
		/>
	);
}
