"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { KhataImage } from "../shared/KhataImage";
import { cn } from "@/lib/utils/utils";

interface KhataGalleryProps {
	productName: string;
	thumbnailImage?: string | null;
	galleryImages?: string[] | null;
	/** Photo of the selected colour; overrides the picked frame while set. */
	colorImage?: string;
}

/**
 * The PDP photograph, in-world: main frame matted on page white with a strip
 * of thumbnail frames beneath. Every frame degrades to the printed
 * first-letter plate when its URL is missing or fails to load.
 */
export function KhataGallery({
	productName,
	thumbnailImage,
	galleryImages,
	colorImage,
}: KhataGalleryProps) {
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
		<div className="space-y-3">
			<div className="relative aspect-square overflow-hidden rounded-sm">
				<KhataImage
					src={mainSrc}
					alt={productName}
					fallbackText={productName}
					width={640}
					height={640}
					priority
					className="aspect-square h-full w-full rounded-sm object-cover"
					sizes="(max-width: 1024px) 100vw, 50vw"
				/>
			</div>
			{images.length > 1 && (
				<ul
					className="flex gap-2 overflow-x-auto"
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
										"ring-warm-focus block h-16 w-16 overflow-hidden rounded-sm border-2 transition-colors",
										isActive
											? "border-accent"
											: "border-border hover:border-accent/60"
									)}
								>
									<KhataImage
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
