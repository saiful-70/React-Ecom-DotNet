"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

/**
 * Placeholder shown when a cart line has no image or its image fails to load.
 * Kept in sync with the neutral product placeholder used elsewhere.
 */
export const CART_IMAGE_PLACEHOLDER =
	"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop&auto=format";

type CartLineImageProps = Omit<ImageProps, "src" | "onError"> & {
	src: string | null | undefined;
};

/**
 * Cart / checkout line thumbnail that degrades gracefully. Empty, relative, or
 * unreachable image URLs (e.g. combo lines whose backend thumbnail 404s) fall
 * back to a neutral placeholder instead of rendering a broken-image icon.
 */
export function CartLineImage({ src, alt, ...props }: CartLineImageProps) {
	const resolved = src && src.trim() !== "" ? src : CART_IMAGE_PLACEHOLDER;
	const [current, setCurrent] = useState(resolved);

	// Re-sync when the line's image prop changes between renders.
	useEffect(() => setCurrent(resolved), [resolved]);

	return (
		<Image
			{...props}
			src={current}
			alt={alt}
			onError={() => setCurrent(CART_IMAGE_PLACEHOLDER)}
		/>
	);
}
