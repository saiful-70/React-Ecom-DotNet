"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils/utils";
import { itemNo } from "../_data/catalogue";
import "../global.css";

/**
 * Catalogue product image with an in-world degrade: when the source is
 * missing or fails to load, it prints a newsprint-muted plate carrying the
 * item number in Archivo caps — never the browser's broken-image glyph.
 */
export function CatalogueImage({
	src,
	alt,
	itemId,
	width,
	height,
	className,
	fallbackClassName,
	sizes,
	priority,
}: {
	src?: string | null;
	alt: string;
	/** Product id — the fallback plate prints its catalogue number. */
	itemId: number;
	width: number;
	height: number;
	className?: string;
	/** Extra classes for the fallback plate (e.g. to give it a width). */
	fallbackClassName?: string;
	sizes?: string;
	priority?: boolean;
}) {
	const { t } = useTranslation();
	const [failed, setFailed] = useState(false);
	const cleanSrc = src?.trim() || null;

	// A new source gets a fresh chance (e.g. color-image swaps on the PDP).
	useEffect(() => {
		setFailed(false);
	}, [cleanSrc]);

	if (!cleanSrc || failed) {
		return (
			<span
				role="img"
				aria-label={alt}
				className={cn(
					"flex select-none items-center justify-center bg-muted",
					className,
					fallbackClassName
				)}
			>
				<span className="px-2 text-center font-display text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground tabular-nums">
					{t("global.catalogue.no", "No.")} {itemNo(itemId)}
				</span>
			</span>
		);
	}

	return (
		<Image
			src={cleanSrc}
			alt={alt}
			width={width}
			height={height}
			className={className}
			sizes={sizes}
			priority={priority}
			onError={() => setFailed(true)}
		/>
	);
}
