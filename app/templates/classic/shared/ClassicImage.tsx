"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState, type ComponentType } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils/utils";

interface ClassicImageProps extends Omit<ImageProps, "src" | "alt" | "onError"> {
	/** Absent/empty src renders the fallback plate immediately. */
	src?: string | null;
	alt: string;
	/** Text whose first character letters the fallback plate (defaults to alt). */
	fallbackText?: string;
	/** Extra classes for the fallback plate (e.g. to match rounded corners). */
	fallbackClassName?: string;
	/**
	 * Mark drawn on the fallback plate. Defaults to a "no image" glyph, which
	 * is honest for a product photo — but a surface whose subject is known
	 * (a department, a brand) should pass its own mark instead, so a failed
	 * icon URL never reads as a broken image.
	 */
	fallbackIcon?: ComponentType<{ className?: string }>;
	/**
	 * Drop the initial from the plate. Use where the label sits right next to
	 * the image (the initial then repeats it) or where the source text is not
	 * in the page's script.
	 */
	hideFallbackLetter?: boolean;
}

/**
 * Next <Image> that degrades in-world. A missing or failing URL renders a
 * faint grey plate carrying the item's initial and a drawn icon — the same
 * neutral surface the section bands use — never the browser's broken-image
 * glyph.
 */
export function ClassicImage({
	src,
	alt,
	fallbackText,
	fallbackClassName,
	fallbackIcon: FallbackIcon = ImageOff,
	hideFallbackLetter = false,
	className,
	fill,
	...rest
}: ClassicImageProps) {
	const [errored, setErrored] = useState(false);

	// A new URL gets a fresh chance (e.g. color-image swaps on the PDP).
	useEffect(() => {
		setErrored(false);
	}, [src]);

	const cleanSrc = typeof src === "string" ? src.trim() : "";

	if (!cleanSrc || errored) {
		const letter = (fallbackText ?? alt).trim().charAt(0) || "?";
		return (
			<span
				role="img"
				aria-label={alt}
				className={cn(
					"flex select-none flex-col items-center justify-center gap-1 bg-muted",
					fill && "absolute inset-0",
					className,
					fallbackClassName
				)}
			>
				{!hideFallbackLetter && (
					<span
						aria-hidden
						className="font-display text-3xl font-extrabold leading-none text-muted-foreground/60"
					>
						{letter}
					</span>
				)}
				<FallbackIcon
					className={cn(
						"text-muted-foreground/40",
						hideFallbackLetter ? "h-6 w-6" : "h-4 w-4"
					)}
				/>
			</span>
		);
	}

	return (
		<Image
			src={cleanSrc}
			alt={alt}
			fill={fill}
			className={className}
			onError={() => setErrored(true)}
			{...rest}
		/>
	);
}
