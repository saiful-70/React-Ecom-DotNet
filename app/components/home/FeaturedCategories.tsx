"use client";

import * as React from "react";
import Image from "next/image";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { useTranslation } from "react-i18next";

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselPrevious,
	CarouselNext,
	type CarouselApi,
} from "@/components/shared/ui/carousel";
import type { FeaturedCategory } from "./_data/types";
import { SECTION_HEADER_MB, SECTION_Y } from "@/lib/ui/rhythm";

const AUTOPLAY_MS = 3500;

interface FeaturedCategoriesProps {
	categories: FeaturedCategory[];
}

export const FeaturedCategories = ({
	categories,
}: FeaturedCategoriesProps) => {
	const { t } = useTranslation();

	const [api, setApi] = React.useState<CarouselApi>();
	const [paused, setPaused] = React.useState(false);

	// Lightweight autoplay (no extra dependency); pauses on hover/focus.
	// Matches the HeroCarousel pattern. Embla disables looping/scrolling when
	// every slide already fits, so this only advances when there's overflow.
	React.useEffect(() => {
		if (!api || paused) return;
		const id = setInterval(() => api.scrollNext(), AUTOPLAY_MS);
		return () => clearInterval(id);
	}, [api, paused]);

	if (categories.length === 0) return null;

	return (
		<section className={SECTION_Y}>
			<div className="container mx-auto">
				{/* Matches the shelf-label treatment in SectionHeader: title left,
				    rule running out to the right. No "view all" — the categories
				    carousel already exposes every category. */}
				<div className={`flex items-end gap-2.5 sm:gap-4 ${SECTION_HEADER_MB}`}>
					<span
						aria-hidden="true"
						className="mb-1 h-6 w-1.5 shrink-0 rounded-full bg-saffron-gradient sm:h-7"
					/>
					<h2 className="font-display text-xl font-bold leading-tight tracking-tight sm:text-2xl">
						{t("home.featuredCategories.title")}
					</h2>
					<span
						aria-hidden="true"
						className="mb-1.5 hidden h-px flex-1 bg-gradient-to-r from-primary/40 to-primary/5 sm:block"
					/>
				</div>

				<Carousel
					setApi={setApi}
					opts={{ align: "start", slidesToScroll: 2, loop: true }}
					className="sm:px-10"
					onMouseEnter={() => setPaused(true)}
					onMouseLeave={() => setPaused(false)}
					onFocusCapture={() => setPaused(true)}
					onBlurCapture={() => setPaused(false)}
				>
					<CarouselContent className="-ml-3 sm:-ml-4">
						{categories.map((category) => {
							const name = category.name;
							return (
								<CarouselItem
									key={category.id}
									className="basis-1/3 pl-3 sm:basis-1/4 sm:pl-4 md:basis-1/5 lg:basis-1/6"
								>
									<Link
										href={`/products?category_id=${category.category_id}`}
										aria-label={name}
										className="group flex flex-col items-center gap-2.5 py-1 text-center transition-transform duration-300 hover:-translate-y-1"
									>
										{/* The gradient ring is the category's whole frame —
										    it replaces the card box, which cost width on a
										    360px phone and made every category read like a
										    form field rather than a stall sign. */}
										<div className="w-full rounded-full bg-saffron-gradient p-[3px] shadow-warm-sm transition-shadow duration-300 group-hover:shadow-warm-md">
											<div className="relative aspect-square w-full overflow-hidden rounded-full bg-muted/40">
												<Image
													src={category.icon_url}
													alt={name}
													fill
													sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 160px"
													className="object-cover transition-transform duration-500 group-hover:scale-110"
												/>
											</div>
										</div>
										<span className="line-clamp-2 text-xs font-semibold leading-tight text-foreground transition-colors group-hover:text-primary sm:text-sm">
											{name}
										</span>
									</Link>
								</CarouselItem>
							);
						})}
					</CarouselContent>

					<CarouselPrevious className="hidden h-9 w-9 border-0 bg-primary text-primary-foreground hover:bg-primary/90 sm:flex" />
					<CarouselNext className="hidden h-9 w-9 border-0 bg-primary text-primary-foreground hover:bg-primary/90 sm:flex" />
				</Carousel>
			</div>
		</section>
	);
};
