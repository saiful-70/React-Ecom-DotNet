"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/utils";
import { CatalogueImage } from "./CatalogueImage";
import "../global.css";

/**
 * PDP image gallery, catalogue style: hairline-bordered main plate plus a
 * thumbnail row (present on mobile too). Every image degrades in-world via
 * CatalogueImage — a missing or 404ing URL prints the item-number plate,
 * never a broken-image glyph. Same behavior contract as the shared gallery
 * (thumbnail + gallery images + optional color image override).
 */
export function GlobalImageGallery({
	productId,
	productName,
	thumbnailImage,
	galleryImages,
	colorImage,
}: {
	productId: number;
	productName: string;
	thumbnailImage: string;
	galleryImages?: string[];
	colorImage?: string;
}) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [showColorImage, setShowColorImage] = useState(false);

	const baseImages = [
		thumbnailImage,
		...(galleryImages ?? []),
	].filter((url) => url && url.trim() !== "");

	// A newly selected color takes over the main plate until a thumb is picked.
	useEffect(() => {
		setShowColorImage(Boolean(colorImage));
	}, [colorImage]);

	const mainSrc =
		showColorImage && colorImage
			? colorImage
			: baseImages[selectedIndex] ?? baseImages[0] ?? null;

	return (
		<div className="space-y-2 sm:space-y-3">
			<div className="aspect-square overflow-hidden rounded-sm border border-border bg-background">
				<CatalogueImage
					src={mainSrc}
					alt={productName}
					itemId={productId}
					width={600}
					height={600}
					priority
					className="h-full w-full object-contain"
					fallbackClassName="h-full w-full"
					sizes="(max-width: 1024px) 100vw, 50vw"
				/>
			</div>

			{(baseImages.length > 1 || colorImage) && (
				<div className="g-no-scrollbar flex gap-2 overflow-x-auto pb-1">
					{baseImages.map((url, index) => (
						<button
							key={`${url}-${index}`}
							type="button"
							onClick={() => {
								setSelectedIndex(index);
								setShowColorImage(false);
							}}
							aria-label={`${productName} — ${index + 1}`}
							aria-pressed={!showColorImage && selectedIndex === index}
							className={cn(
								"ring-warm-focus h-16 w-16 shrink-0 overflow-hidden rounded-sm border bg-background p-1 transition-colors lg:h-20 lg:w-20",
								!showColorImage && selectedIndex === index
									? "border-foreground"
									: "border-border hover:border-foreground/50"
							)}
						>
							<CatalogueImage
								src={url}
								alt=""
								itemId={productId}
								width={80}
								height={80}
								className="h-full w-full object-contain"
								fallbackClassName="h-full w-full"
							/>
						</button>
					))}
					{colorImage && (
						<button
							type="button"
							onClick={() => setShowColorImage(true)}
							aria-label={`${productName} — color`}
							aria-pressed={showColorImage}
							className={cn(
								"ring-warm-focus h-16 w-16 shrink-0 overflow-hidden rounded-sm border bg-background p-1 transition-colors lg:h-20 lg:w-20",
								showColorImage
									? "border-foreground"
									: "border-border hover:border-foreground/50"
							)}
						>
							<CatalogueImage
								src={colorImage}
								alt=""
								itemId={productId}
								width={80}
								height={80}
								className="h-full w-full object-contain"
								fallbackClassName="h-full w-full"
							/>
						</button>
					)}
				</div>
			)}
		</div>
	);
}
