"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils/utils";
import type { SpecLine } from "../lib";
import { PremiumImage } from "./PremiumImage";
import "../premium.css";

/** Fixed marker positions for up to four exploded callouts. */
const MARKER_POSITIONS: {
	style: React.CSSProperties;
	leader: "right" | "left";
}[] = [
	{ style: { top: "16%", left: "10%" }, leader: "right" },
	{ style: { top: "42%", right: "8%" }, leader: "left" },
	{ style: { bottom: "30%", left: "12%" }, leader: "right" },
	{ style: { bottom: "10%", right: "16%" }, leader: "left" },
];

interface PremiumGalleryProps {
	productName: string;
	thumbnailImage: string;
	galleryImages?: string[];
	colorImage?: string;
	/**
	 * Numbered specs pinned to the primary photograph as instruction-plate
	 * hotspots. Markers show only on the first (specimen) view and only when
	 * there are at least two specs — thinner data degrades to the plain
	 * numbered list rendered by the caller.
	 */
	specs?: SpecLine[];
}

/**
 * Premium specimen gallery: box-board-cornered photograph with numbered
 * exploded callouts, thumbnail keys below (mobile included).
 */
export function PremiumGallery({
	productName,
	thumbnailImage,
	galleryImages,
	colorImage,
	specs = [],
}: PremiumGalleryProps) {
	const { t } = useTranslation();
	const [selectedImage, setSelectedImage] = useState(0);
	const [showColorImage, setShowColorImage] = useState(false);
	// Broken main-image URL: the plate takes over and the callouts come down.
	const [mainBroken, setMainBroken] = useState(false);

	const baseImages = [
		{ url: thumbnailImage, alt: productName },
		...(galleryImages
			? galleryImages.map((url) => ({ url, alt: productName }))
			: []),
	].filter((img) => Boolean(img.url));

	useEffect(() => {
		setShowColorImage(Boolean(colorImage));
	}, [colorImage]);

	const mainImage =
		showColorImage && colorImage
			? colorImage
			: baseImages[selectedImage]?.url || null;

	useEffect(() => {
		// Each view change gets a fresh load attempt.
		setMainBroken(false);
	}, [mainImage]);

	const showMarkers =
		!showColorImage &&
		selectedImage === 0 &&
		specs.length >= 2 &&
		Boolean(mainImage) &&
		!mainBroken;

	return (
		<div className="space-y-3">
			<div className="premium-corners relative aspect-square overflow-hidden bg-muted">
				<PremiumImage
					src={mainImage}
					alt={productName}
					sizes="(max-width: 1024px) 100vw, 55vw"
					className="object-cover"
					priority
					plateClassName="[&>span]:text-4xl"
					onBroken={() => setMainBroken(true)}
				/>
				{showMarkers &&
					specs.map((spec, index) => {
						const pos = MARKER_POSITIONS[index];
						if (!pos) return null;
						return (
							<span
								key={spec.label}
								className="premium-callout-marker"
								style={pos.style}
								data-leader={pos.leader}
								aria-hidden="true"
							>
								{index + 1}
							</span>
						);
					})}
			</div>

			{(baseImages.length > 1 || colorImage) && (
				<div
					className="flex gap-2 overflow-x-auto pb-1"
					role="group"
					aria-label={t("premium.galleryThumbs", "Product views")}
				>
					{baseImages.map((image, index) => (
						<button
							key={`${image.url}-${index}`}
							type="button"
							onClick={() => {
								setSelectedImage(index);
								setShowColorImage(false);
							}}
							className={cn(
								"ring-warm-focus relative h-16 w-16 shrink-0 overflow-hidden border transition-colors",
								!showColorImage && selectedImage === index
									? "border-primary"
									: "border-border/50 hover:border-border"
							)}
							aria-label={`${productName} — ${index + 1}`}
							aria-pressed={!showColorImage && selectedImage === index}
						>
							<PremiumImage
								src={image.url}
								alt=""
								sizes="64px"
								className="object-cover"
								plateClassName="[&>span]:text-[10px]"
							/>
						</button>
					))}
					{colorImage && (
						<button
							type="button"
							onClick={() => setShowColorImage(true)}
							className={cn(
								"ring-warm-focus relative h-16 w-16 shrink-0 overflow-hidden border transition-colors",
								showColorImage
									? "border-primary"
									: "border-border/50 hover:border-border"
							)}
							aria-label={t("premium.colourView", "Selected colour view")}
							aria-pressed={showColorImage}
						>
							<PremiumImage
								src={colorImage}
								alt=""
								sizes="64px"
								className="object-cover"
								plateClassName="[&>span]:text-[10px]"
							/>
						</button>
					)}
				</div>
			)}
		</div>
	);
}
