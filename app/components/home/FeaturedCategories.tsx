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
		<section className="py-6 sm:py-12 lg:py-16">
			<div className="container mx-auto px-4 sm:px-6">
				<div className="mb-4 text-center sm:mb-8 lg:mb-10">
					<h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
						{t("home.featuredCategories.title")}
					</h2>
					<div className="mx-auto mt-3 h-1 w-16 rounded-full bg-primary/40" />
				</div>

				<Carousel
					setApi={setApi}
					opts={{ align: "start", slidesToScroll: 2, loop: true }}
					className="px-2 sm:px-10"
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
										className="group flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 text-center shadow-warm-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-warm-md sm:p-5"
									>
										<div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted/40">
											<Image
												src={category.icon_url}
												alt={name}
												fill
												sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 160px"
												className="object-cover transition-transform duration-500 group-hover:scale-110"
											/>
										</div>
										<span className="line-clamp-2 text-xs font-medium leading-tight text-foreground sm:text-sm">
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
