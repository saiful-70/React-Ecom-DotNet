"use client";

import * as React from "react";
import Image from "next/image";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	type CarouselApi,
} from "@/components/shared/ui/carousel";
import { Button } from "@/components/shared/ui/button";
import { cn } from "@/lib/utils/utils";
import type { Banner } from "./_data/types";

const AUTOPLAY_MS = 5000;

interface HeroCarouselProps {
	banners: Banner[];
}

export const HeroCarousel = ({ banners }: HeroCarouselProps) => {
	const { i18n } = useTranslation();
	const isBn = i18n.language === "bn";

	const [api, setApi] = React.useState<CarouselApi>();
	const [selected, setSelected] = React.useState(0);
	const [paused, setPaused] = React.useState(false);

	// Banners arrive already filtered (active + in-schedule) and sorted from the
	// server action; render them as-is.
	const slides = banners;

	// Track the active slide for the dot indicators.
	React.useEffect(() => {
		if (!api) return;
		const onSelect = () => setSelected(api.selectedScrollSnap());
		onSelect();
		api.on("select", onSelect);
		api.on("reInit", onSelect);
		return () => {
			api.off("select", onSelect);
		};
	}, [api]);

	// Lightweight autoplay (no extra dependency); pauses on hover/focus.
	React.useEffect(() => {
		if (!api || paused) return;
		const id = setInterval(() => api.scrollNext(), AUTOPLAY_MS);
		return () => clearInterval(id);
	}, [api, paused]);

	if (slides.length === 0) return null;

	return (
		<section
			className="relative bg-secondary"
			aria-roledescription="carousel"
			aria-label={isBn ? "প্রধান ব্যানার" : "Hero banners"}
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			onFocusCapture={() => setPaused(true)}
			onBlurCapture={() => setPaused(false)}
		>
			<Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
				<CarouselContent className="ml-0">
					{slides.map((slide, index) => {
						const title = slide.title;
						const subtitle = slide.subtitle;
						const ctaLabel = slide.cta_label;

						return (
							<CarouselItem key={slide.id} className="pl-0">
								<div className="relative h-[300px] sm:h-[400px] lg:h-[480px] w-full overflow-hidden">
									<Image
										src={slide.image_url}
										alt={title}
										fill
										priority={index === 0}
										sizes="100vw"
										className="object-cover"
									/>
									{/* Forest-green wash so the copy stays legible over any image */}
									<div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/60 to-secondary/10" />

									<div className="relative container mx-auto flex h-full items-center px-4 sm:px-6">
										<div className="max-w-xl space-y-4 text-secondary-foreground sm:space-y-6">
											<h2 className="font-display text-3xl font-semibold leading-[1.1] tracking-tight text-balance sm:text-4xl lg:text-5xl xl:text-6xl">
												{title}
											</h2>
											<p className="max-w-lg text-sm leading-relaxed text-secondary-foreground/85 sm:text-base lg:text-lg">
												{subtitle}
											</p>
											<Button
												asChild
												size="lg"
												className="h-11 px-6 text-sm shadow-warm-md hover:shadow-warm-lg sm:h-12 sm:px-8 sm:text-base"
											>
												<Link href={slide.cta_url}>
													{ctaLabel}
													<ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
												</Link>
											</Button>
										</div>
									</div>
								</div>
							</CarouselItem>
						);
					})}
				</CarouselContent>
			</Carousel>

			{/* Dot indicators */}
			<div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 sm:bottom-6">
				{slides.map((slide, i) => (
					<button
						key={slide.id}
						type="button"
						aria-label={`${isBn ? "স্লাইড" : "Slide"} ${i + 1}`}
						aria-current={selected === i}
						onClick={() => api?.scrollTo(i)}
						className={cn(
							"h-2 rounded-full transition-all",
							selected === i
								? "w-6 bg-primary-foreground"
								: "w-2 bg-primary-foreground/50 hover:bg-primary-foreground/80"
						)}
					/>
				))}
			</div>
		</section>
	);
};
