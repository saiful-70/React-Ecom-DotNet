"use client";

import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import Price from "@/components/shared/Price";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { trackBannerClick } from "@/lib/analytics/tracking";
import type { Banner } from "@/components/home/_data/types";
import type { Product } from "@/(app-routes)/products/model";
import { cn } from "@/lib/utils/utils";
import { itemNo } from "../_data/catalogue";
import { CatalogueImage } from "../product/CatalogueImage";
import "../global.css";

/**
 * The opening spread: ONE composed tableau — never a carousel. Real product
 * figures at mismatched scales stand on the horizon datum (the literal
 * hairline this section registers to), each captioned with its catalogue
 * number and price. The headline comes from the first live banner when the
 * backend supplies one; otherwise the catalogue speaks for itself.
 * Slide-and-settle entrance, staggered across the three figures.
 */
export function HeroTableau({
	banner,
	products,
}: {
	banner: Banner | null;
	products: Product[];
}) {
	const { t } = useTranslation();
	const figures = products.slice(0, 3);

	const headline = banner?.title || t("global.hero.title", "Everything, in order.");
	const subline =
		banner?.subtitle ||
		t(
			"global.hero.subtitle",
			"A numbered catalogue of real stock — availability printed on every page."
		);
	const ctaHref = banner?.cta_url || ABSOLUTE_ROUTES.PRODUCTS;
	const ctaLabel = banner?.cta_label || t("global.hero.cta", "Browse the index");

	// Mismatched print scales, largest first, all grounded on the datum.
	const figureHeights = [
		"h-44 sm:h-56 lg:h-72",
		"h-32 sm:h-40 lg:h-52",
		"h-24 sm:h-28 lg:h-36",
	];

	return (
		<section className="g-datum g-corners container mx-auto">
			<div className="flex flex-col gap-8 pb-0 pt-8 md:pt-12 lg:flex-row lg:items-end lg:gap-12">
				{/* Headline column, grounded on the datum */}
				<div className="g-settle max-w-xl pb-8 lg:pb-10">
					<h1 className="font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-balance sm:text-5xl lg:text-6xl">
						{headline}
					</h1>
					<p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
						{subline}
					</p>
					<Link
						href={ctaHref}
						onClick={() =>
							banner &&
							trackBannerClick({ bannerId: banner.id, bannerName: banner.title })
						}
						className="ring-warm-focus mt-6 inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
					>
						{ctaLabel}
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>

				{/* Sparse data: a single specimen becomes the plate of the spread —
				    composed at catalogue scale on the datum with a printed figure
				    legend, never a shrunken thumbnail or a banner-split. */}
				{figures.length === 1 && (
					<div className="flex min-w-0 flex-1 items-end justify-center lg:justify-end">
						<Link
							href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(figures[0].id)}
							className="g-settle-2 ring-warm-focus group flex w-full max-w-lg flex-col items-center rounded-sm"
						>
							<CatalogueImage
								src={figures[0].thumbnail_image}
								alt={figures[0].name}
								itemId={figures[0].id}
								width={720}
								height={720}
								priority
								className="h-56 w-auto object-contain object-bottom sm:h-72 lg:h-96"
								fallbackClassName="aspect-square"
								sizes="(max-width: 1024px) 80vw, 40vw"
							/>
							{/* Printed figure legend on the datum */}
							<span className="flex w-full flex-wrap items-baseline justify-center gap-x-3 gap-y-0.5 border-t border-border pb-3 pt-2 text-xs">
								<span className="uppercase tracking-[0.08em] text-muted-foreground tabular-nums">
									{t("global.catalogue.no", "No.")} {itemNo(figures[0].id)}
								</span>
								<span className="max-w-[60%] truncate font-medium">
									{figures[0].name}
								</span>
								<span className="font-black tabular-nums group-hover:underline">
									<Price amount={figures[0].discounted_price} />
								</span>
							</span>
						</Link>
					</div>
				)}

				{/* The tableau: figures at mismatched scales standing on the datum */}
				{figures.length > 1 && (
					<div className="flex min-w-0 flex-1 items-end justify-end gap-4 md:gap-8">
						{figures.map((product, i) => (
							<Link
								key={product.id}
								href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
								className={cn(
									"ring-warm-focus group flex min-w-0 flex-col items-center rounded-sm",
									i === 0 ? "g-settle" : i === 1 ? "g-settle-2" : "g-settle-3",
									i === 2 && "hidden sm:flex"
								)}
							>
								<CatalogueImage
									src={product.thumbnail_image}
									alt={product.name}
									itemId={product.id}
									width={480}
									height={480}
									priority={i === 0}
									className={cn(
										"w-auto object-contain object-bottom",
										figureHeights[i]
									)}
									fallbackClassName="aspect-square"
									sizes="(max-width: 1024px) 40vw, 25vw"
								/>
								{/* Caption sits below the datum like a printed figure line */}
								<span className="mt-0 flex w-full items-baseline justify-center gap-2 border-t border-border pb-3 pt-2 text-[11px]">
									<span className="uppercase tracking-[0.08em] text-muted-foreground tabular-nums">
										{t("global.catalogue.no", "No.")} {itemNo(product.id)}
									</span>
									<span className="font-black tabular-nums group-hover:underline">
										<Price amount={product.discounted_price} />
									</span>
								</span>
							</Link>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
