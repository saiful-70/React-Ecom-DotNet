"use client";

import "../classic.css";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingBasket } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink } from "@/components/shared/ui/variant-link";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { FeaturedCategory } from "@/components/home/_data/types";
import { ClassicImage } from "../shared/ClassicImage";
import { cn } from "@/lib/utils/utils";

/**
 * The department rail: one round photograph per department on the grey band.
 *
 * Two things the plain overflow list got wrong and this fixes. A department
 * with no `icon_url` gets a drawn basket mark on a muted plate — never a
 * transliterated initial, which reads as a foreign monogram on a Bengali page
 * and turns a rail of eleven departments into eleven identical letters. And
 * the rail tells you it continues: the edge fades and, on a pointer device,
 * paddle buttons appear, so the list never just clips mid-item.
 */
export function ClassicDepartmentRail({
	categories,
}: {
	categories: FeaturedCategory[];
}) {
	const { t } = useTranslation();
	const scrollerRef = useRef<HTMLUListElement>(null);
	const [atStart, setAtStart] = useState(true);
	const [atEnd, setAtEnd] = useState(true);

	const measure = useCallback(() => {
		const el = scrollerRef.current;
		if (!el) return;
		const max = el.scrollWidth - el.clientWidth;
		setAtStart(el.scrollLeft <= 2);
		setAtEnd(el.scrollLeft >= max - 2);
	}, []);

	useEffect(() => {
		measure();
		const el = scrollerRef.current;
		if (!el) return;
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		return () => observer.disconnect();
	}, [measure, categories.length]);

	const page = (direction: 1 | -1) => {
		const el = scrollerRef.current;
		if (!el) return;
		el.scrollBy({
			left: direction * Math.max(el.clientWidth * 0.8, 160),
			behavior: "smooth",
		});
	};

	if (categories.length === 0) return null;

	const paddle =
		"ring-warm-focus absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-warm-sm transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-0 lg:flex";

	return (
		<div className="relative">
			<ul
				ref={scrollerRef}
				onScroll={measure}
				className="flex items-start gap-4 overflow-x-auto scroll-smooth md:gap-6"
			>
				{categories.map((category) => (
					<li key={category.id} className="shrink-0">
						<VariantLink
							href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(
								category.category_id
							)}
							className="ring-warm-focus group flex w-20 flex-col items-center gap-2 rounded-lg text-center md:w-24"
						>
							{/* A missing OR failing icon URL lands on the basket
							    mark, never a transliterated initial and never a
							    broken-image glyph. */}
							<ClassicImage
								src={category.icon_url}
								alt=""
								fallbackText={category.name}
								fallbackIcon={ShoppingBasket}
								hideFallbackLetter
								width={96}
								height={96}
								className="h-16 w-16 rounded-full border border-border bg-background object-cover transition-shadow group-hover:shadow-warm md:h-20 md:w-20"
								fallbackClassName="rounded-full"
							/>
							<span className="text-xs font-semibold leading-snug md:text-sm">
								{category.name}
							</span>
						</VariantLink>
					</li>
				))}
			</ul>

			{/* The rail says it continues. Fades sit over the band's own colour,
			    so they read as the list running under the edge, not as glass. */}
			<span
				aria-hidden
				className={cn(
					"pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-muted to-transparent transition-opacity",
					atStart && "opacity-0"
				)}
			/>
			<span
				aria-hidden
				className={cn(
					"pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-muted to-transparent transition-opacity",
					atEnd && "opacity-0"
				)}
			/>
			<button
				type="button"
				onClick={() => page(-1)}
				disabled={atStart}
				aria-label={t("classic2.scrollLeft", "আগের বিভাগ")}
				className={cn(paddle, "-left-3")}
			>
				<ChevronLeft className="h-5 w-5" aria-hidden />
			</button>
			<button
				type="button"
				onClick={() => page(1)}
				disabled={atEnd}
				aria-label={t("classic2.scrollRight", "পরের বিভাগ")}
				className={cn(paddle, "-right-3")}
			>
				<ChevronRight className="h-5 w-5" aria-hidden />
			</button>
		</div>
	);
}
