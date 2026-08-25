"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils/utils";
import { PantryImage } from "../shared/PantryImage";
import "../pantry.css";

interface PantryGalleryProps {
	productName: string;
	thumbnailImage?: string | null;
	galleryImages?: string[];
	/** Out of stock: the hatch is printed over the goods themselves. */
	soldOut?: boolean;
}

/**
 * The photograph set. In a natural-food shop the picture IS the argument —
 * what the ghee looks like in the jar is the whole proof — so the main plate
 * is square, edge to edge, uncropped by any decoration, and the thumbnails sit
 * quietly beneath it as a rail of real buttons.
 *
 * Out of stock is printed on the goods in the world's own material: the
 * `.pn-hatch` diagonal over the photograph plus one forest chip, never a grey
 * wash that makes the food look spoiled.
 */
export function PantryGallery({
	productName,
	thumbnailImage,
	galleryImages,
	soldOut = false,
}: PantryGalleryProps) {
	const { t } = useTranslation();
	const [selected, setSelected] = useState(0);
	const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

	// Deduplicated, so a backend that repeats the thumbnail inside the gallery
	// does not print the same jar twice.
	const views = Array.from(
		new Set(
			[thumbnailImage, ...(galleryImages ?? [])]
				.map((url) => (typeof url === "string" ? url.trim() : ""))
				.filter(Boolean),
		),
	);

	// A shorter gallery (product switch) must not leave a dangling index.
	useEffect(() => {
		setSelected(0);
	}, [productName]);

	const mainImage = views[selected] ?? views[0] ?? null;

	/** Left/right walks the rail, so the set is readable without a mouse. */
	const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
		if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
		event.preventDefault();
		const next =
			event.key === "ArrowRight"
				? (index + 1) % views.length
				: (index - 1 + views.length) % views.length;
		setSelected(next);
		thumbRefs.current[next]?.focus();
	};

	return (
		<div className="space-y-3">
			<div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted">
				<PantryImage
					src={mainImage}
					alt={productName}
					sizes="(max-width: 1024px) 100vw, 55vw"
					className="object-cover"
					priority
				/>
				{soldOut && (
					<>
						<span
							className="pn-hatch pointer-events-none absolute inset-0"
							aria-hidden="true"
						/>
						<span className="absolute left-4 top-4 rounded-md bg-secondary px-3 py-1.5 font-display text-sm text-secondary-foreground">
							{t("pantry.soldOut", "এখন স্টকে নেই")}
						</span>
					</>
				)}
			</div>

			{views.length > 1 && (
				<div
					role="group"
					aria-label={t("pantry.galleryViews", "পণ্যের ছবি")}
					className="flex gap-2 overflow-x-auto pb-1"
				>
					{views.map((url, index) => (
						<button
							key={`${url}-${index}`}
							ref={(node) => {
								thumbRefs.current[index] = node;
							}}
							type="button"
							onClick={() => setSelected(index)}
							onKeyDown={(event) => handleKeyDown(event, index)}
							aria-pressed={selected === index}
							aria-label={t("pantry.galleryView", "ছবি {{n}}", {
								n: index + 1,
							})}
							className={cn(
								"ring-warm-focus relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted transition-colors md:h-[4.5rem] md:w-[4.5rem]",
								selected === index
									? "border-primary"
									: "border-border hover:border-primary/60",
							)}
						>
							<PantryImage
								src={url}
								alt=""
								sizes="72px"
								className="object-cover"
								plateClassName="[&>span]:text-base"
							/>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
