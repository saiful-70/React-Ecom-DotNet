"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/utils";

interface BazarBrandMarkProps {
	src?: string | null;
	/** The shop's name — the wordmark when the logo is absent or 404s. */
	name: string;
	/** Classes for the rendered logo <Image>. */
	className?: string;
	/** Classes for the text wordmark fallback. */
	textClassName?: string;
}

/**
 * Brand mark that degrades in-world: when the business-settings logo URL is
 * missing or fails to load, the site name renders as a display-face wordmark
 * on the board chrome instead of the browser's broken-image glyph.
 */
export function BazarBrandMark({
	src,
	name,
	className,
	textClassName,
}: BazarBrandMarkProps) {
	const [errored, setErrored] = useState(false);

	const validSrc =
		typeof src === "string" && src.trim() !== "" ? src : null;

	if (!validSrc || errored) {
		return (
			<span className={cn("font-display font-bold", textClassName)}>
				{name}
			</span>
		);
	}

	return (
		<Image
			src={validSrc}
			alt={name || "Logo"}
			width={140}
			height={40}
			className={className}
			onError={() => setErrored(true)}
		/>
	);
}
