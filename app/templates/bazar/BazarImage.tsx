"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/utils";

interface BazarImageProps {
	src?: string | null;
	alt: string;
	/** Text whose first letter the fallback plate prints; defaults to `alt`. */
	fallbackLabel?: string;
	fill?: boolean;
	width?: number;
	height?: number;
	sizes?: string;
	priority?: boolean;
	/** Classes for the rendered <Image>. */
	className?: string;
	/**
	 * Classes for the fallback plate (size the plate AND its initial here —
	 * font-size inherits to the letter, e.g. "h-40 w-full text-3xl").
	 */
	plateClassName?: string;
}

/**
 * Chart-safe image: some products/categories arrive with no image or a URL
 * that 404s. Instead of the browser's broken-image glyph, a missing or failed
 * image degrades to an in-world plate — chart-white field, the item's initial
 * set in the display face, like the hand-lettered cell of a tariff chart a
 * photo never reached. Error state resets when `src` changes (gallery thumbs).
 */
export function BazarImage({
	src,
	alt,
	fallbackLabel,
	fill,
	width,
	height,
	sizes,
	priority,
	className,
	plateClassName,
}: BazarImageProps) {
	const [failedSrc, setFailedSrc] = useState<string | null>(null);

	const validSrc =
		typeof src === "string" && src.trim() !== "" ? src : null;
	const errored = validSrc !== null && failedSrc === validSrc;

	if (!validSrc || errored) {
		const label = (fallbackLabel ?? alt).trim();
		const initial = label ? Array.from(label)[0] : "৳";
		return (
			<span
				role="img"
				aria-label={alt || undefined}
				className={cn(
					"flex select-none items-center justify-center bg-muted",
					fill && "absolute inset-0",
					plateClassName
				)}
			>
				<span
					aria-hidden="true"
					className="font-display font-bold text-muted-foreground"
				>
					{initial}
				</span>
			</span>
		);
	}

	return (
		<Image
			src={validSrc}
			alt={alt}
			{...(fill ? { fill: true } : { width, height })}
			sizes={sizes}
			priority={priority}
			className={className}
			onError={() => setFailedSrc(validSrc)}
		/>
	);
}
