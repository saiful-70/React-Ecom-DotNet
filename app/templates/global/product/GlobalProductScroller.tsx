"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Product } from "@/(app-routes)/products/model";
import { GlobalProductCard } from "./GlobalProductCard";

/**
 * Horizontal, snap-scrolling row of plates with square page-turn controls.
 * Used by the deals insert and per-department showcases.
 */
export function GlobalProductScroller({ products }: { products: Product[] }) {
	const { t } = useTranslation();
	const trackRef = useRef<HTMLDivElement>(null);

	const scrollBy = (direction: 1 | -1) => {
		const el = trackRef.current;
		if (!el) return;
		el.scrollBy({
			left: direction * (el.clientWidth * 0.8),
			behavior: "smooth",
		});
	};

	if (products.length === 0) return null;

	return (
		<div className="relative">
			<div
				ref={trackRef}
				className="g-no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 md:gap-4"
			>
				{products.map((product) => (
					<div
						key={product.id}
						className="w-[45%] shrink-0 snap-start sm:w-[30%] md:w-[23%] lg:w-[19%] xl:w-[15.5%]"
					>
						<GlobalProductCard product={product} />
					</div>
				))}
			</div>

			{products.length > 2 && (
				<>
					<button
						type="button"
						onClick={() => scrollBy(-1)}
						aria-label={t("global.previous")}
						className="ring-warm-focus absolute -left-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-sm border border-border bg-background text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background md:flex"
					>
						<ChevronLeft className="h-5 w-5" />
					</button>
					<button
						type="button"
						onClick={() => scrollBy(1)}
						aria-label={t("global.next")}
						className="ring-warm-focus absolute -right-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-sm border border-border bg-background text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background md:flex"
					>
						<ChevronRight className="h-5 w-5" />
					</button>
				</>
			)}
		</div>
	);
}
