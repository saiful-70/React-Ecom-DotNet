"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils/utils";
import { BazarImage } from "../BazarImage";
import "../bazar.css";

interface BazarGalleryProps {
	productName: string;
	thumbnailImage: string;
	galleryImages?: string[];
	colorImage?: string;
}

/**
 * PDP image well in the chart grammar: laminated main plate, keypad thumbs.
 * Every image goes through BazarImage, so a missing or 404ing URL degrades to
 * the in-world initial plate — never the browser's broken-image glyph. Mirrors
 * the shared gallery's behaviour: thumbnail + gallery images, and a selected
 * colour temporarily takes over the main plate until a thumb is tapped.
 */
export function BazarGallery({
	productName,
	thumbnailImage,
	galleryImages,
	colorImage,
}: BazarGalleryProps) {
	const { t } = useTranslation();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [showColorImage, setShowColorImage] = useState(false);

	const baseImages = [thumbnailImage, ...(galleryImages ?? [])].filter(
		(url) => typeof url === "string" && url.trim() !== ""
	);

	useEffect(() => {
		setShowColorImage(Boolean(colorImage));
	}, [colorImage]);

	const mainImage =
		showColorImage && colorImage
			? colorImage
			: baseImages[selectedIndex] ?? null;

	return (
		<div className="space-y-3">
			<div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-background shadow-warm-sm">
				<BazarImage
					src={mainImage}
					alt={productName}
					fill
					priority
					sizes="(max-width: 1024px) 100vw, 50vw"
					className="object-cover"
					plateClassName="text-7xl"
				/>
			</div>
			{(baseImages.length > 1 || (colorImage && baseImages.length > 0)) && (
				<div
					className="flex gap-2 overflow-x-auto pb-1"
					role="group"
					aria-label={t("bazar.galleryThumbs", "পণ্যের ছবি")}
				>
					{baseImages.map((url, index) => {
						const isActive = !showColorImage && selectedIndex === index;
						return (
							<button
								key={`${url}-${index}`}
								type="button"
								onClick={() => {
									setSelectedIndex(index);
									setShowColorImage(false);
								}}
								aria-pressed={isActive}
								aria-label={`${productName} ${index + 1}`}
								className={cn(
									"bz-key ring-warm-focus relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-background lg:h-20 lg:w-20",
									isActive
										? "border-primary shadow-warm-sm"
										: "border-border"
								)}
							>
								<BazarImage
									src={url}
									alt=""
									fallbackLabel={productName}
									fill
									sizes="80px"
									className="object-cover"
									plateClassName="text-xl"
								/>
							</button>
						);
					})}
					{colorImage && (
						<button
							type="button"
							onClick={() => setShowColorImage(true)}
							aria-pressed={showColorImage}
							aria-label={`${productName} — ${t("bazar.colorPhoto", "রঙের ছবি")}`}
							className={cn(
								"bz-key ring-warm-focus relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-background lg:h-20 lg:w-20",
								showColorImage
									? "border-primary shadow-warm-sm"
									: "border-border"
							)}
						>
							<BazarImage
								src={colorImage}
								alt=""
								fallbackLabel={productName}
								fill
								sizes="80px"
								className="object-cover"
								plateClassName="text-xl"
							/>
						</button>
					)}
				</div>
			)}
		</div>
	);
}
