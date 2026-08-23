"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/utils";

interface KhataImageProps extends Omit<ImageProps, "src" | "alt" | "onError"> {
	/** Absent/empty src renders the fallback plate immediately. */
	src?: string | null;
	alt: string;
	/** Text whose first character letters the fallback plate (defaults to alt). */
	fallbackText?: string;
	/** Extra classes for the fallback plate (e.g. to match rounded corners). */
	fallbackClassName?: string;
}

/**
 * Next <Image> that degrades in-world. When the URL is missing or fails to
 * load, it renders a printed fallback plate — the entry's first letter set in
 * the display bookhand on the aged-paper surface — never the browser's
 * broken-image glyph.
 */
export function KhataImage({
	src,
	alt,
	fallbackText,
	fallbackClassName,
	className,
	fill,
	...rest
}: KhataImageProps) {
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
					"flex select-none items-center justify-center border border-dashed bg-muted",
					fill && "absolute inset-0",
					className,
					fallbackClassName
				)}
			>
				<span
					aria-hidden
					className="font-display text-4xl font-bold text-muted-foreground/70"
				>
					{letter}
				</span>
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
