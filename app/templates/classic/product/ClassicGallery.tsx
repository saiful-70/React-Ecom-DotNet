"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ClassicImage } from "../shared/ClassicImage";
import { cn } from "@/lib/utils/utils";

interface ClassicGalleryProps {
	productName: string;
	thumbnailImage?: string | null;
	galleryImages?: string[] | null;
	/** Photo of the selected colour; overrides the picked frame while set. */
	colorImage?: string;
}

/**
 * The PDP photograph: one 1:1 frame given the full column with a strip of
 * thumbnails beneath. Every frame degrades to the in-world fallback plate
 * when its URL is missing or fails to load.
 */
export function ClassicGallery({
	productName,
	thumbnailImage,
	galleryImages,
	colorImage,
}: ClassicGalleryProps) {
	const { t } = useTranslation();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [showColorImage, setShowColorImage] = useState(false);

	const images = useMemo(
		() =>
			[thumbnailImage, ...(galleryImages ?? [])].filter(
				(url): url is string =>
					typeof url === "string" && url.trim() !== ""
			),
		[thumbnailImage, galleryImages]
	);

	useEffect(() => {
		setShowColorImage(Boolean(colorImage));
	}, [colorImage]);

	const mainSrc =
		showColorImage && colorImage
			? colorImage
			: (images[selectedIndex] ?? images[0] ?? null);

	return (
		<div className="space-y-2 md:space-y-3">
			{/* 1:1 always. On a phone the square is capped by viewport HEIGHT via
			    a matching max-width, so the frame stays square (no CLS, no crop)
			    and the name + price clear the fold. Desktop is uncapped. */}
			<div className="relative mx-auto aspect-square w-full max-w-[46vh] overflow-hidden rounded-xl border border-border bg-muted lg:mx-0 lg:max-w-none">
				<ClassicImage
					src={mainSrc}
					alt={productName}
					fallbackText={productName}
					width={720}
					height={720}
					priority
					className="aspect-square h-full w-full object-cover"
					sizes="(max-width: 1024px) 100vw, 50vw"
				/>
			</div>
			{images.length > 1 && (
				<ul
					className="flex justify-center gap-2 overflow-x-auto lg:justify-start"
					aria-label={t("classic2.galleryThumbs", "আরও ছবি")}
				>
					{images.map((url, index) => {
						const isActive =
							!showColorImage && index === selectedIndex;
						return (
							<li key={`${url}-${index}`} className="shrink-0">
								<button
									type="button"
									onClick={() => {
										setSelectedIndex(index);
										setShowColorImage(false);
									}}
									aria-label={`${productName} — ${index + 1}`}
									aria-pressed={isActive}
									className={cn(
										"ring-warm-focus block h-14 w-14 overflow-hidden rounded-lg border bg-muted transition-colors md:h-16 md:w-16",
										isActive
											? "border-primary"
											: "border-border hover:border-muted-foreground/50"
									)}
								>
									<ClassicImage
										src={url}
										alt=""
										fallbackText={productName}
										width={80}
										height={80}
										className="h-full w-full object-cover"
										fallbackClassName="[&>span]:text-lg"
									/>
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
