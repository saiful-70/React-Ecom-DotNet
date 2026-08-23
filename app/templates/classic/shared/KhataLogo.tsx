"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/utils";

/**
 * The shop sign. With a working logo URL it hangs as a printed board on page
 * white; when the URL is absent or 404s it degrades to the site name painted
 * straight onto the kraft chrome in the display bookhand — never the
 * browser's broken-image glyph.
 */
export function KhataLogo({
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
					"font-display text-xl font-bold tracking-tight md:text-2xl",
					className
				)}
			>
				{siteName}
			</span>
		);
	}

	return (
		<span
			className={cn(
				"flex items-center rounded-md border border-secondary-foreground/25 bg-card px-3 py-1.5",
				className
			)}
		>
			<Image
				src={cleanSrc}
				alt={siteName || "Logo"}
				width={140}
				height={40}
				className="h-7 w-auto object-contain md:h-8"
				onError={() => setErrored(true)}
			/>
		</span>
	);
}
