"use client";

import * as React from "react";
import Image from "next/image";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { trackBannerClick } from "@/lib/analytics/tracking";

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
								<div className="relative h-[340px] sm:h-[420px] lg:h-[500px] w-full overflow-hidden">
									<Image
										src={slide.image_url}
										alt={title}
										fill
										priority={index === 0}
										sizes="100vw"
										// Slow drift on the slide currently on screen: the only
										// authored motion in the hero besides the timer rail.
										className={cn(
											"object-cover transition-transform duration-[6000ms] ease-out",
											selected === index
												? "motion-safe:scale-[1.06]"
												: "scale-100"
										)}
									/>
									{/* Forest-green wash so the copy stays legible over any
									    image. Phones read bottom-up (the copy sits low in the
									    frame); from `sm` the scrim turns side-on. */}
									<div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/70 to-secondary/10 sm:bg-gradient-to-r sm:from-secondary/95 sm:via-secondary/65 sm:to-secondary/5" />

									<div className="relative container mx-auto flex h-full items-end pb-14 sm:items-center sm:pb-0">
										<div className="max-w-xl space-y-3 text-secondary-foreground sm:space-y-6">
											<h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
												{title}
											</h2>
											<p className="max-w-lg text-sm leading-relaxed text-secondary-foreground/85 sm:text-base lg:text-lg">
												{subtitle}
											</p>
											<Button
												asChild
												size="lg"
												className="h-12 bg-terracotta-gradient px-7 text-sm font-bold shadow-warm-md transition-[filter,box-shadow] hover:shadow-warm-lg hover:brightness-110 sm:h-14 sm:px-9 sm:text-base"
											>
												<Link
													href={slide.cta_url}
													onClick={() =>
														trackBannerClick({
															bannerId: slide.id,
															bannerName: title,
														})
													}
												>
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

			{/* Slide timer rail. The active track fills over one autoplay cycle,
			    so the indicator says how long is left, not just where you are.
			    `key={selected}` restarts the fill on every advance; the fill is
			    a transform, so it costs no layout on a cheap phone. */}
			<div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 sm:bottom-7 sm:gap-2">
				{slides.map((slide, i) => (
					<button
						key={slide.id}
						type="button"
						aria-label={`${isBn ? "স্লাইড" : "Slide"} ${i + 1}`}
						aria-current={selected === i}
						onClick={() => api?.scrollTo(i)}
						className={cn(
							"h-1.5 overflow-hidden rounded-full transition-[width,background-color] duration-300",
							selected === i
								? "w-10 bg-primary-foreground/30 sm:w-14"
								: "w-2.5 bg-primary-foreground/45 hover:bg-primary-foreground/75"
						)}
					>
						{selected === i && (
							<span
								key={selected}
								aria-hidden="true"
								className="block h-full w-full origin-left rounded-full bg-primary-foreground motion-safe:animate-slide-progress"
								style={{
									["--slide-duration" as string]: `${AUTOPLAY_MS}ms`,
									animationPlayState: paused
										? "paused"
										: "running",
								}}
							/>
						)}
					</button>
				))}
			</div>
		</section>
	);
};
