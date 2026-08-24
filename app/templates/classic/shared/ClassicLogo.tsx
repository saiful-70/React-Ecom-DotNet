"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/utils";

/**
 * The shop's name over the door. With a working logo URL the mark sits
 * straight on the white chrome, unboxed; when the URL is absent or 404s it
 * degrades to the site name set in the display face — never the browser's
 * broken-image glyph.
 */
export function ClassicLogo({
	src,
	siteName,
	className,
}: {
	src?: string | null;
	siteName: string;
	className?: string;
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
					"font-display text-xl font-extrabold tracking-tight md:text-2xl",
					className
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
				width={160}
				height={44}
				className="h-8 w-auto object-contain md:h-10"
				onError={() => setErrored(true)}
			/>
		</span>
	);
}
