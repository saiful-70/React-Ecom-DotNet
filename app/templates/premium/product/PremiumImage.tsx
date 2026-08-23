"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PremiumPlate } from "./PremiumPlate";

interface PremiumImageProps {
	/** Image URL; null/empty renders the plate immediately. */
	src: string | null | undefined;
	alt: string;
	sizes?: string;
	className?: string;
	priority?: boolean;
	/** Extra classes for the wordmark-plate fallback. */
	plateClassName?: string;
	/** Fired when the URL exists but fails to load (broken backend URL). */
	onBroken?: () => void;
}

/**
 * Fill-mode product image that degrades in-world: a missing OR broken URL
 * renders the label-stock wordmark plate (PremiumPlate) instead of the
 * browser's broken-image glyph. Parents that pin callout markers to the
 * photograph can listen on `onBroken` to suppress them.
 */
export function PremiumImage({
	src,
	alt,
	sizes,
	className,
	priority,
	plateClassName,
	onBroken,
}: PremiumImageProps) {
	const [broken, setBroken] = useState(false);

	// A new URL gets a fresh chance (e.g. thumbnail switching).
	useEffect(() => {
		setBroken(false);
	}, [src]);

	if (!src || broken) {
		return <PremiumPlate className={plateClassName} />;
	}

	return (
		<Image
			src={src}
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
