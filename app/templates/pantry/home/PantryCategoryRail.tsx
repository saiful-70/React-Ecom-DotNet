"use client";

import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { Banner, FeaturedCategory } from "@/components/home/_data/types";
import { PantryImage } from "../shared/PantryImage";
import "../pantry.css";

interface PantryCategoryRailProps {
	categories: FeaturedCategory[];
	banners: Banner[];
}

/**
 * The pantry's departments — ghee, oil, honey, dates, spice.
 *
 * A single-brand shop has few departments, so they are read across a rail of
 * identical tiles rather than a mega-menu. On a phone the rail scrolls
 * horizontally with snap points; from `md` there is room for the whole set as a
 * grid, and the scroll container is dropped entirely so it can never trap a
 * vertical page swipe.
 *
 * Below the rail, at most ONE banner runs as an editorial strip. The backend
 * usually returns several; a wall of them is the marketplace habit this world
 * refuses, so the rest are ignored and an empty list prints nothing.
 */
/**
 * Hard cap on department tiles. A backend configured for a marketplace can
 * return dozens of featured categories; rendered in full they become a wall of
 * near-identical squares that outweighs every shelf of actual goods on the
 * page. A pantry has a handful of departments, so the rail shows a handful and
 * sends the rest to the listing page's own category filter.
 */
const MAX_DEPARTMENTS = 8;

export function PantryCategoryRail({
	categories,
	banners,
}: PantryCategoryRailProps) {
	const { t } = useTranslation();

	const strip = banners.find((b) => b.image_url && b.cta_url) ?? null;
	const shown = categories.slice(0, MAX_DEPARTMENTS);
	const hasMore = categories.length > shown.length;

	if (shown.length === 0 && !strip) return null;

	return (
		<section
			aria-labelledby="pantry-departments-heading"
			className="bg-background"
		>
			<div className="pb-10 pt-14 md:pb-14 md:pt-20 lg:pt-24">
				<div className="container mx-auto">
					<h2
						id="pantry-departments-heading"
						className="mb-7 font-display text-2xl leading-tight text-foreground md:mb-10 md:text-4xl"
					>
						{t("pantry.departments", "আমাদের পণ্যের ধরন")}
					</h2>

					{shown.length > 0 && (
						<ul className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2 md:mx-0 md:grid md:grid-cols-4 md:snap-none md:gap-6 md:overflow-x-visible md:px-0 md:pb-0">
							{shown.map((category) => (
								<li
									key={category.id}
									className="w-[8.5rem] shrink-0 snap-start md:w-auto"
								>
									<Link
										href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(
											category.category_id,
										)}
										className="ring-warm-focus group block rounded-lg"
									>
										<span className="relative block aspect-square overflow-hidden rounded-lg bg-muted shadow-warm-sm transition-transform duration-200 will-change-transform group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
											{/* A department without an icon falls back to the
											    plate at card scale, which carries the
											    department's own name rather than a letter. */}
											<PantryImage
												src={category.icon_url}
												alt={category.name}
												sizes="(min-width: 1024px) 16vw, (min-width: 768px) 24vw, 40vw"
												className="object-cover"
												plateScale="card"
												// The caption below the tile
												// already names the department.
												plateLabel={false}
											/>
										</span>
										<span className="mt-3 block font-display text-base leading-snug text-foreground md:text-lg">
											{category.name}
										</span>
									</Link>
								</li>
							))}
						</ul>
					)}

					{hasMore && (
						<Link
							href={ABSOLUTE_ROUTES.PRODUCTS}
							className="ring-warm-focus mt-6 inline-flex min-h-11 items-center text-base font-semibold text-primary underline-offset-4 hover:underline md:mt-8"
						>
							{t("pantry.viewAll", "সব দেখুন")}
						</Link>
					)}

					{strip && (
						<Link
							href={strip.cta_url}
							className="ring-warm-focus relative mt-10 block overflow-hidden rounded-lg md:mt-14"
						>
							<span className="relative block aspect-[16/7] w-full bg-muted sm:aspect-[16/5] lg:aspect-[16/4]">
								<PantryImage
									src={strip.image_url}
									alt={strip.title || t("pantry.offerStrip", "বিশেষ অফার")}
									sizes="100vw"
									className="object-cover"
								/>
								<span
									className="pn-scrim absolute inset-0"
									aria-hidden="true"
								/>
							</span>
							<span className="absolute inset-x-0 bottom-0 p-5 text-secondary-foreground md:p-8">
								{strip.title && (
									<span className="block max-w-xl font-display text-xl leading-tight md:text-3xl">
										{strip.title}
									</span>
								)}
								{strip.subtitle && (
									<span className="mt-1.5 block max-w-xl text-sm text-secondary-foreground/85 md:text-base">
										{strip.subtitle}
									</span>
								)}
								<span className="mt-3 inline-flex items-center text-sm font-semibold underline md:text-base">
									{strip.cta_label || t("pantry.seeOffer", "দেখুন")}
								</span>
							</span>
						</Link>
					)}
				</div>
			</div>
		</section>
	);
}
