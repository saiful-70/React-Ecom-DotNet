"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/utils";

/**
 * The shop's name over the door. With a working logo URL the mark sits
 * straight on the white masthead, unboxed; when the URL is absent or 404s it
 * degrades to the site name set in the display face — never the browser's
 * broken-image glyph.
 *
 * Tiro Bangla ships one weight (400), so emphasis here is SIZE, never
 * `font-bold`.
 */
export function PantryLogo({
	src,
	siteName,
	className,
	textClassName,
	imageClassName,
}: {
	src?: string | null;
	siteName: string;
	className?: string;
	textClassName?: string;
	imageClassName?: string;
}) {
	const [errored, setErrored] = useState(false);

	useEffect(() => {
		setErrored(false);
	}, [src]);

	const cleanSrc = typeof src === "string" ? src.trim() : "";

	if (!cleanSrc || errored) {
		return (
			<span
				className={cn(
					"font-display text-2xl leading-none tracking-tight md:text-3xl",
					className,
					textClassName,
				)}
			>
				{siteName}
			</span>
		);
	}

	return (
		<span className={cn("flex items-center", className)}>
			<Image
				src={cleanSrc}
				alt={siteName || "Logo"}
				width={180}
				height={48}
				className={cn("h-9 w-auto object-contain md:h-11", imageClassName)}
				onError={() => setErrored(true)}
			/>
		</span>
	);
}
