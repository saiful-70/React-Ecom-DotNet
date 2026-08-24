"use client";

import "../classic.css";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BannerLink } from "@/components/analytics/TrackedLinks";
import type { Banner } from "@/components/home/_data/types";
import { ClassicImage } from "../shared/ClassicImage";

/** One full cycle of the shopfront window. */
const ADVANCE_MS = 5500;
/** Horizontal travel that counts as a swipe rather than a tap. */
const SWIPE_PX = 44;

/**
 * The first content of the home page: the shopfront window. Full-width slide
 * track, one photograph per active banner, nothing overlaid — the photography
 * is the loudest thing on the page, and the slide glide is the one authored
 * motion of this world.
 *
 * Auto-advance pauses on hover, on focus-within, when the tab is hidden, and
 * on request; under `prefers-reduced-motion` it never runs at all and slide
 * changes are hard cuts. One banner degrades to a static frame with no dots,
 * arrows or timer; zero banners render nothing.
 */
export function ClassicHeroCarousel({ banners }: { banners: Banner[] }) {
	const { t } = useTranslation();

	// The shared action already drops inactive/out-of-schedule banners; this is
	// a cheap guard for a template rendered with a raw list.
	const slides = banners.filter((banner) => banner.status !== "inactive");
	const count = slides.length;

	const [index, setIndex] = useState(0);
	const [hovered, setHovered] = useState(false);
	const [focused, setFocused] = useState(false);
	const [tabHidden, setTabHidden] = useState(false);
	const [userPaused, setUserPaused] = useState(false);
	const [reducedMotion, setReducedMotion] = useState(false);
	const [swiping, setSwiping] = useState(false);
	const touchStartX = useRef<number | null>(null);

	// Reduced motion is a live preference, not a mount-time snapshot.
	useEffect(() => {
		const query = window.matchMedia("(prefers-reduced-motion: reduce)");
		const apply = () => setReducedMotion(query.matches);
		apply();
		query.addEventListener("change", apply);
		return () => query.removeEventListener("change", apply);
	}, []);

	// A timer running against a background tab is wasted battery on a phone.
	useEffect(() => {
		const apply = () => setTabHidden(document.hidden);
		apply();
		document.addEventListener("visibilitychange", apply);
		return () => document.removeEventListener("visibilitychange", apply);
	}, []);

	const go = useCallback(
		(next: number) => {
			if (count === 0) return;
			setIndex(((next % count) + count) % count);
		},
		[count]
	);

	const paused = hovered || focused || tabHidden || userPaused;
	const autoplays = count > 1 && !reducedMotion && !paused;

	useEffect(() => {
		if (!autoplays) return;
		const timer = window.setTimeout(
			() => setIndex((current) => (current + 1) % count),
			ADVANCE_MS
		);
		return () => window.clearTimeout(timer);
	}, [autoplays, count, index]);

	// Zero banners: no empty box, no placeholder.
	if (count === 0) return null;

	const isSingle = count === 1;
	const slideLabel = (position: number) =>
		t("classic2.slideNofM", "স্লাইড {{current}} / {{total}}", {
			current: position + 1,
			total: count,
		});

	return (
		<section
			aria-roledescription="carousel"
			aria-label={t("classic2.carouselLabel", "অফারের ব্যানার")}
			className="relative overflow-hidden bg-muted"
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onFocus={() => setFocused(true)}
			onBlur={() => setFocused(false)}
			onKeyDown={(event) => {
				if (isSingle) return;
				if (event.key === "ArrowLeft") {
					event.preventDefault();
					go(index - 1);
				} else if (event.key === "ArrowRight") {
					event.preventDefault();
					go(index + 1);
				}
			}}
			onTouchStart={(event) => {
				touchStartX.current = event.touches[0]?.clientX ?? null;
			}}
			onTouchEnd={(event) => {
				const start = touchStartX.current;
				touchStartX.current = null;
				if (isSingle || start === null) return;
				const end = event.changedTouches[0]?.clientX ?? start;
				const travel = end - start;
				if (Math.abs(travel) < SWIPE_PX) return;
				// Follow the finger: the change tracks the gesture, so it lands
				// without the glide replaying underneath it.
				setSwiping(true);
				go(travel < 0 ? index + 1 : index - 1);
				window.setTimeout(() => setSwiping(false), 0);
			}}
		>
			{/* Fixed aspect ratio, held at every breakpoint: the slot is the same
			    height before and after the image decodes, so the offer rail below
			    never moves. The desktop ratio is deliberately letterboxed — the
			    window is a banner strip, and the offer rail has to reach the fold
			    at 1440×900. */}
			<div className="relative aspect-video w-full sm:aspect-[21/9] lg:aspect-[24/5]">
				<ul
					className="classic-slide-track absolute inset-0"
					data-animate={reducedMotion || swiping ? "false" : "true"}
					style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
				>
					{slides.map((slide, position) => (
						<li
							key={slide.id}
							className="classic-slide relative h-full"
							role="group"
							aria-roledescription="slide"
							aria-label={slideLabel(position)}
							aria-hidden={position === index ? undefined : true}
						>
							<BannerLink
								href={slide.cta_url || "/products"}
								bannerId={slide.id}
								bannerName={slide.title}
								tabIndex={position === index ? undefined : -1}
								aria-label={slide.title}
								className="ring-warm-focus block h-full w-full"
							>
								<ClassicImage
									src={slide.image_url}
									alt={slide.title}
									fallbackText={slide.title}
									fill
									priority={position === 0}
									loading={position === 0 ? undefined : "lazy"}
									sizes="100vw"
									className="h-full w-full object-cover"
								/>
							</BannerLink>
						</li>
					))}
				</ul>

				{!isSingle && (
					<>
						<button
							type="button"
							onClick={() => go(index - 1)}
							aria-label={t("classic2.prevSlide", "আগের স্লাইড")}
							className="ring-warm-focus absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-secondary/80 text-secondary-foreground backdrop-blur-sm transition-colors hover:bg-secondary active:bg-secondary md:flex"
						>
							<ChevronLeft className="h-5 w-5" aria-hidden />
						</button>
						<button
							type="button"
							onClick={() => go(index + 1)}
							aria-label={t("classic2.nextSlide", "পরের স্লাইড")}
							className="ring-warm-focus absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-secondary/80 text-secondary-foreground backdrop-blur-sm transition-colors hover:bg-secondary active:bg-secondary md:flex"
						>
							<ChevronRight className="h-5 w-5" aria-hidden />
						</button>
					</>
				)}
			</div>

			{!isSingle && (
				<div className="flex items-center justify-center bg-background">
					<ul className="flex items-center">
						{slides.map((slide, position) => (
							<li key={slide.id}>
								<button
									type="button"
									onClick={() => go(position)}
									aria-current={position === index}
									aria-label={slideLabel(position)}
									className="classic-dot ring-warm-focus rounded-full"
								/>
							</li>
						))}
					</ul>
					{!reducedMotion && (
						<button
							type="button"
							onClick={() => setUserPaused((value) => !value)}
							aria-pressed={userPaused}
							aria-label={
								userPaused
									? t("classic2.playSlides", "স্লাইড চালু করুন")
									: t("classic2.pauseSlides", "স্লাইড থামান")
							}
							className="ring-warm-focus ml-1 flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:h-8 lg:w-8"
						>
							{userPaused ? (
								<Play className="h-4 w-4" aria-hidden />
							) : (
								<Pause className="h-4 w-4" aria-hidden />
							)}
						</button>
					)}
				</div>
			)}

			{/* Screen readers hear the change the sighted shopper sees. */}
			<div aria-live="polite" className="sr-only">
				{isSingle ? "" : `${slideLabel(index)} — ${slides[index]?.title}`}
			</div>
		</section>
	);
}
