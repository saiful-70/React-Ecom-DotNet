"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import Price from "@/components/shared/Price";
import { toast } from "@/components/shared/ui/sonner";
import { useCart } from "@/contexts/CartContext";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { trackUnifiedAddToCart } from "@/lib/analytics";
import type { Product, ProductVariant } from "@/(app-routes)/products/model";
import { deriveSpecs, lotLine, primaryImage } from "../lib";
import { PremiumImage } from "../product/PremiumImage";
import { PremiumVariantKeys } from "../product/PremiumVariantKeys";
import "../premium.css";

/** Fixed hero marker positions (mirrors the gallery's instruction plate). */
const MARKER_POSITIONS: {
	style: React.CSSProperties;
	leader: "right" | "left";
}[] = [
	{ style: { top: "14%", left: "10%" }, leader: "right" },
	{ style: { top: "44%", right: "8%" }, leader: "left" },
	{ style: { bottom: "26%", left: "12%" }, leader: "right" },
	{ style: { bottom: "8%", right: "16%" }, leader: "left" },
];

/**
 * First viewport: the flagship product as a boxed specimen — photography
 * framed by box-board corners with numbered exploded callouts — and the buy
 * label panel (name, LOT line, price, pressed variant keys, one gold
 * add-to-cart), complete without scrolling.
 */
export function PremiumHeroSpecimen({ product }: { product: Product }) {
	const { t } = useTranslation();
	const { items, addToCart } = useCart();
	const [selectedVariant, setSelectedVariant] =
		useState<ProductVariant | null>(
			product.variants && product.variants.length > 0
				? product.variants[0]
				: null
		);
	const [sealed, setSealed] = useState(false);
	const sealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	// Broken backend URL: the plate takes over and the callouts come down.
	const [imageBroken, setImageBroken] = useState(false);

	const image = primaryImage(product);
	const specs = useMemo(() => deriveSpecs(product), [product]);
	const price = selectedVariant
		? Number(selectedVariant.discount_price)
		: Number(product.discounted_price);
	const stock = selectedVariant ? selectedVariant.stock : product.stock;

	const reserved = useMemo(
		() =>
			items
				.filter(
					(item) =>
						item.id === product.id &&
						(selectedVariant
							? item.variant_id === selectedVariant.id
							: !item.variant_id)
				)
				.reduce((sum, item) => sum + item.quantity, 0),
		[items, product.id, selectedVariant]
	);
	const soldOut = Math.max(stock - reserved, 0) <= 0;

	const handleAddToCart = () => {
		if (soldOut) {
			toast.error(t("premium.outOfStock", "This lot is sold out"));
			return;
		}
		addToCart({
			id: product.id,
			name: selectedVariant
				? `${product.name} - ${selectedVariant.combination_text}`
				: product.name,
			price,
			image: image ?? "",
			variant_id: selectedVariant?.id,
			stock,
			quantity: 1,
			tax: product.tax ? parseFloat(product.tax) : 0,
			tax_type: product.tax_type || "exclude",
		});
		trackUnifiedAddToCart(product.id.toString(), product.name, price, 1);
		setSealed(false);
		requestAnimationFrame(() => setSealed(true));
		if (sealTimer.current) clearTimeout(sealTimer.current);
		sealTimer.current = setTimeout(() => setSealed(false), 600);
		toast.success(t("premium.addedToCart", "Added to your order"), {
			description: product.name,
		});
	};

	// No photograph (missing or broken) → nothing to pin markers to.
	const showMarkers = Boolean(image) && !imageBroken && specs.length >= 2;

	return (
		<section
			className="container mx-auto py-4 lg:py-12"
			aria-label={t("premium.hero.label", "Featured specimen")}
		>
			<div className="grid items-center gap-4 lg:grid-cols-12 lg:gap-12">
				{/* The boxed specimen with exploded callouts */}
				<div className="lg:col-span-7">
					<Link
						href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
						className="ring-warm-focus block"
						aria-label={product.name}
					>
						{/* Mobile: a partial-height plate (~38vh) so the label panel —
						    name, LOT, price, keys, gold CTA — completes the first
						    viewport at 390×844. Desktop keeps the 4:3 specimen. */}
						<div className="premium-corners relative h-[38vh] max-h-96 overflow-hidden bg-muted lg:h-auto lg:max-h-none lg:aspect-[4/3]">
							<PremiumImage
								src={image}
								alt={product.name}
								sizes="(max-width: 1024px) 100vw, 55vw"
								className="object-cover"
								priority
								plateClassName="[&>span]:text-4xl md:[&>span]:text-6xl"
								onBroken={() => setImageBroken(true)}
							/>
							{showMarkers &&
								specs.map((spec, index) => {
									const pos = MARKER_POSITIONS[index];
									if (!pos) return null;
									return (
										<span
											key={spec.label}
											className="premium-callout-marker"
											style={pos.style}
											data-leader={pos.leader}
											aria-hidden="true"
										>
											{index + 1}
										</span>
									);
								})}
						</div>
					</Link>
					{specs.length > 0 && (
						<ol
							className="mt-4 hidden flex-wrap gap-x-8 gap-y-1 md:flex"
							aria-label={t("premium.specs", "Specifications")}
						>
							{specs.map((spec, index) => (
								<li
									key={spec.label}
									className="flex items-baseline gap-2 text-xs text-muted-foreground"
								>
									<span className="tabular-nums">{index + 1}</span>
									<span className="uppercase tracking-[0.14em]">
										{spec.label}
									</span>
									<span className="text-foreground">{spec.value}</span>
								</li>
							))}
						</ol>
					)}
				</div>

				{/* The buy label panel — complete within the first viewport */}
				<div className="lg:col-span-5">
					<div className="shadow-warm-lg bg-card p-5 text-card-foreground md:p-8">
						<h1 className="font-display text-3xl leading-[1.05] tracking-tight md:text-5xl">
							{product.name}
						</h1>
						<p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-card-foreground/70">
							{lotLine(product)}
						</p>

						<div className="mt-4 flex items-baseline gap-3 md:mt-5">
							<span className="text-2xl tabular-nums">
								<Price amount={price} />
							</span>
							{Number(product.price) > price && (
								<span className="text-sm text-card-foreground/60 line-through tabular-nums">
									<Price
										amount={
											selectedVariant
												? Number(selectedVariant.price)
												: Number(product.price)
										}
									/>
								</span>
							)}
						</div>

						{product.variants && product.variants.length > 0 && (
							<div className="mt-4 lg:mt-6">
								<PremiumVariantKeys
									product={product}
									onVariantChange={setSelectedVariant}
								/>
							</div>
						)}

						<button
							type="button"
							onClick={handleAddToCart}
							disabled={soldOut}
							data-sealed={sealed}
							className="premium-seal-press ring-warm-focus mt-4 h-12 w-full bg-primary text-sm font-medium uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 lg:mt-6"
						>
							{soldOut
								? t("premium.soldOut", "Sold out")
								: t("premium.addToCart", "Add to cart")}
						</button>
						<Link
							href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
							className="ring-warm-focus mt-3 block text-center text-sm text-card-foreground/80 underline decoration-card-foreground/40 underline-offset-4 transition-colors hover:text-card-foreground"
						>
							{t("premium.readTheLabel", "Read the full label")}
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
