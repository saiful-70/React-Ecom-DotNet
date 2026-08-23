"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/utils";
import "../global.css";

/**
 * The brand mark with an in-world degrade: when the business-settings logo is
 * absent or its URL fails, the site name is set as an Archivo-900 wordmark —
 * never a broken-image glyph.
 */
export function BrandMark({
	src,
	name,
	imgClassName,
	textClassName,
	priority,
}: {
	src?: string | null;
	name: string;
	imgClassName?: string;
	textClassName?: string;
	priority?: boolean;
}) {
	const [failed, setFailed] = useState(false);
	const cleanSrc = src?.trim() || null;

	useEffect(() => {
		setFailed(false);
	}, [cleanSrc]);

	if (!cleanSrc || failed) {
		return (
			<span
				className={cn(
					"font-display font-black uppercase tracking-tight",
					textClassName
				)}
			>
				{name}
			</span>
		);
	}

	return (
		<Image
			src={cleanSrc}
			alt={name || "Logo"}
			width={150}
			height={44}
			className={imgClassName}
			priority={priority}
			onError={() => setFailed(true)}
		/>
	);
}
