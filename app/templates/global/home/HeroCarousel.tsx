"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import type { Banner } from "@/components/home/_data/types";
import { cn } from "@/lib/utils/utils";

const ROTATE_MS = 5000;

/**
 * Auto-rotating hero banner carousel with dot controls. Pauses rotation while
 * the pointer is over the banner. Falls back gracefully to a single static
 * slide. Respects reduced-motion by not auto-advancing.
 */
export function HeroCarousel({ banners }: { banners: Banner[] }) {
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);
	const count = banners.length;

	const go = useCallback(
		(next: number) => setIndex((next + count) % count),
		[count]
	);

	useEffect(() => {
		if (count <= 1 || paused) return;
		const reduce =
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (reduce) return;
		const id = window.setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
		return () => window.clearInterval(id);
	}, [count, paused]);

	if (count === 0) {
		return (
			<div className="min-h-[220px] flex-1 rounded-md bg-secondary md:min-h-[340px] lg:min-h-[400px]" />
		);
	}

	return (
		<div
			className="relative min-h-[220px] flex-1 overflow-hidden rounded-md md:min-h-[340px] lg:min-h-[400px]"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
		>
			{banners.map((banner, i) => (
				<Link
					key={banner.id}
					href={banner.cta_url || "/products"}
					aria-hidden={i !== index}
					tabIndex={i === index ? 0 : -1}
					className={cn(
						"absolute inset-0 transition-opacity duration-700",
						i === index ? "opacity-100" : "pointer-events-none opacity-0"
					)}
				>
					<Image
						src={banner.image_url}
						alt={banner.title}
						fill
						priority={i === 0}
						className="object-cover"
						sizes="(max-width: 1024px) 100vw, 75vw"
					/>
				</Link>
			))}

			{count > 1 && (
				<div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
					{banners.map((banner, i) => (
						<button
							key={banner.id}
							type="button"
							onClick={() => go(i)}
							aria-label={`Go to slide ${i + 1}`}
							aria-current={i === index}
							className={cn(
								"h-2.5 rounded-full transition-all",
								i === index
									? "w-6 bg-primary"
									: "w-2.5 bg-primary/40 hover:bg-primary/70"
							)}
						/>
					))}
				</div>
			)}
		</div>
	);
}
