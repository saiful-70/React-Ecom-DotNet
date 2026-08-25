"use client";

import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import Price from "@/components/shared/Price";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { Product } from "@/(app-routes)/products/model";
import { PantryProductCard } from "../product/PantryProductCard";
import { PantryImage } from "../shared/PantryImage";
import { discountPercent, primaryImage, sellingPrice } from "../lib";
import "../pantry.css";

/**
 * How a shelf is read.
 *
 * - `grid` — the main shelf: full tiles, four across on a desktop.
 * - `rail` — new arrivals, read along the shelf by pushing goods sideways at
 *   every width, the way a shop shows what just came in.
 * - `ranked` — order volume, where the sequence itself is the information: a
 *   compact numbered row per good, two columns of rows on a desktop, so a
 *   position can be compared instead of a photograph.
 */
export type PantryShelfDensity = "grid" | "rail" | "ranked";

interface PantryShelfSectionProps {
	/** Anchor id for the header's smooth-scroll links. */
	id?: string;
	titleKey: string;
	titleDefault: string;
	products: Product[];
	viewAllHref: string;
	/** Swaps the field to the stone-green band, alternating the scroll. */
	banded?: boolean;
	/** How the goods are laid out. Defaults to the full grid. */
	density?: PantryShelfDensity;
}

/**
 * A titled shelf of goods.
 *
 * The heading is the pantry serif at a real size — Tiro Bangla has a single
 * weight, so scale, not boldness, carries the emphasis.
 *
 * Three shelves of the same tile at the same density is a wall, not a shop, so
 * the layout is a property of what the shelf MEANS: the picked selection gets
 * full tiles, new arrivals get a sideways rail, and order volume gets a ranked
 * list where the numbers are real rank and nothing else.
 *
 * The `.pn-shelf` edge closes the band and means exactly one thing: goods above
 * this line, more shop below it. Every density closes on it.
 */
export function PantryShelfSection({
	id,
	titleKey,
	titleDefault,
	products,
	viewAllHref,
	banded,
	density = "grid",
}: PantryShelfSectionProps) {
	const { t } = useTranslation();

	if (products.length === 0) return null;

	const headingId = id ? `${id}-heading` : undefined;

	return (
		<section
			id={id}
			aria-labelledby={headingId}
			className={banded ? "bg-muted" : "bg-background"}
		>
			<div className="pb-10 pt-14 md:pb-14 md:pt-20 lg:pt-24">
				<div className="container mx-auto">
					<div className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 md:mb-10">
						<h2
							id={headingId}
							className="font-display text-2xl leading-tight text-foreground md:text-4xl"
						>
							{t(titleKey, titleDefault)}
						</h2>
						<Link
							href={viewAllHref}
							className="ring-warm-focus inline-flex h-11 items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-primary hover:underline"
						>
							{t("pantry.viewAll", "সব দেখুন")}
							<ArrowRight className="h-4 w-4" aria-hidden />
						</Link>
					</div>

					{density === "grid" && (
						<ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
							{products.map((product) => (
								<li key={product.id}>
									<PantryProductCard product={product} />
								</li>
							))}
						</ul>
					)}

					{density === "rail" && (
						/* Sideways at every width. The negative margin lets the first
						   and last tile touch the container's own edge while the
						   scrollport keeps its focus ring room. */
						<ul className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 md:gap-6">
							{products.map((product) => (
								<li
									key={product.id}
									className="w-[13.5rem] shrink-0 snap-start sm:w-[15rem] lg:w-[16.5rem]"
								>
									<PantryProductCard product={product} />
								</li>
							))}
						</ul>
					)}

					{density === "ranked" && (
						<ol className="grid grid-cols-1 gap-x-10 lg:grid-cols-2">
							{products.map((product, index) => (
								<PantryRankedRow
									key={product.id}
									product={product}
									rank={index + 1}
								/>
							))}
						</ol>
					)}
				</div>
			</div>

			<div className="pn-shelf" aria-hidden="true" />
		</section>
	);
}

/**
 * One row of the order-volume list: the rank, a thumbnail at a quarter of the
 * tile's size, the name, and the price. Denser than a tile by design — the
 * comparison here is between positions, not between photographs, and the whole
 * row is a single link to the product page where the order form lives.
 *
 * The number is the backend's own top-selling ordering. It is not a score, a
 * rating or a stock figure, and nothing else on the row is invented.
 */
function PantryRankedRow({
	product,
	rank,
}: {
	product: Product;
	rank: number;
}) {
	const off = discountPercent(product);
	const now = sellingPrice(product);
	const image = primaryImage(product);

	return (
		<li className="border-b border-border last:border-b-0">
			<Link
				href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
				className="ring-warm-focus group flex min-h-16 items-center gap-4 rounded-lg py-3"
			>
				<span
					className="w-7 shrink-0 text-center font-display text-xl tabular-nums text-primary md:text-2xl"
					aria-hidden="true"
				>
					{rank}
				</span>

				{/* At 56px a plate carrying a product name would be unreadable, so
				    a good without a photograph simply gives its row to the name. */}
				{image && (
					<span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted shadow-warm-sm md:h-16 md:w-16">
						<PantryImage
							src={image}
							alt={product.name}
							sizes="64px"
							className="object-cover"
						/>
					</span>
				)}

				<span className="min-w-0 flex-1 font-display text-base leading-snug text-foreground transition-colors group-hover:text-primary md:text-lg">
					<span className="line-clamp-2">{product.name}</span>
				</span>

				<span className="shrink-0 text-right">
					<span className="block text-base font-bold tabular-nums text-primary md:text-lg">
						<Price amount={now} />
					</span>
					{off !== null && (
						<span className="block text-xs text-muted-foreground line-through tabular-nums">
							<Price amount={product.price} />
						</span>
					)}
				</span>
			</Link>
		</li>
	);
}
