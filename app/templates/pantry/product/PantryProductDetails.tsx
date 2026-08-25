"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Leaf, ShoppingBasket } from "lucide-react";
import Price from "@/components/shared/Price";
import { toast } from "@/components/shared/ui/sonner";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { useFeature } from "@/components/shared/providers/variant-provider";
import { ProductReviews } from "@/components/product/product-details";
import { useCart } from "@/contexts/CartContext";
import type { ProductDetailsLayoutProps } from "@/templates/types";
import {
	catalogueLines,
	discountPercent,
	packOptions,
	primaryImage,
	proofLines,
	sellingPrice,
	stockLine,
} from "../lib";
import { PantryGallery } from "./PantryGallery";
import { PantryOrderForm } from "./PantryOrderForm";
import { PantryStickyOrderBar } from "./PantryStickyOrderBar";
import "../pantry.css";

const FORM_ID = "pantry-order-form";

/**
 * The pantry PDP — where this world converts.
 *
 * One decision is on this page: order this jar, in this weight, to this
 * address. So the buy column is not a cart button but the whole order form,
 * complete inside the first desktop viewport, with the delivery charge printed
 * above the button. Everything that argues for the product — description,
 * provenance, reviews, combos — sits below that decision, not around it.
 *
 * The cart survives as the quieter second path for a shopper assembling
 * several goods; it is a text-weight control beside the green form, never
 * competing with it.
 *
 * Client component because the buy column owns the pack selection that the
 * headline price, the form and the sticky bar all read, and because the cart
 * and the feature flags are client concerns.
 */
export function PantryProductDetails({
	product,
	combos,
}: ProductDetailsLayoutProps) {
	const { t } = useTranslation();
	const { addToCart } = useCart();
	const reviewsEnabled = useFeature("reviews");

	const packs = useMemo(() => packOptions(product), [product]);
	const [selectedPackId, setSelectedPackId] = useState<number | null>(() => {
		const options = packOptions(product);
		if (options.length === 0) return null;
		return (options.find((pack) => pack.inStock) ?? options[0]).variantId;
	});

	const selectedVariant = selectedPackId
		? ((product.variants ?? []).find((v) => v.id === selectedPackId) ?? null)
		: null;
	const selectedPack = selectedPackId
		? (packs.find((pack) => pack.variantId === selectedPackId) ?? null)
		: null;

	// Prices come from the selection when there is one, otherwise the product.
	const unitPrice = selectedPack ? selectedPack.price : sellingPrice(product);
	const listPrice = selectedVariant ? selectedVariant.price : product.price;
	// Amber is earned by a real backend reduction, never by a rounding artefact.
	const offPercent = selectedVariant
		? listPrice > unitPrice
			? Math.round(((listPrice - unitPrice) / listPrice) * 100) || null
			: null
		: discountPercent(product);

	const stock = selectedVariant ? selectedVariant.stock : product.stock;
	const soldOut = packs.length > 0 ? !packs.some((p) => p.inStock) : stock <= 0;
	const maxQuantity = Math.max(1, Math.min(stock > 0 ? stock : 1, 99));

	const shelf = stockLine(product);
	const proof = useMemo(() => proofLines(product), [product]);
	const catalogue = useMemo(() => catalogueLines(product), [product]);
	const image = primaryImage(product);

	const handleAddToCart = () => {
		if (soldOut) return;
		addToCart({
			id: product.id,
			name: selectedVariant
				? `${product.name} - ${selectedVariant.combination_text}`
				: product.name,
			price: unitPrice,
			image: image ?? "",
			variant_id: selectedVariant?.id,
			stock,
			quantity: 1,
			tax: product.tax ? parseFloat(product.tax) : 0,
			tax_type: product.tax_type || "exclude",
		});
		toast.success(t("pantry.addedToCart", "ব্যাগে রাখা হয়েছে"), {
			description: product.name,
		});
	};

	return (
		<main className="bg-background text-foreground">
			<div className="container mx-auto py-6 md:py-8">
				<div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
					{/* The goods. First on a phone: the photograph is the argument.
					    Six columns rather than seven: the square gallery then stops
					    running hundreds of pixels past the buy column's foot, and the
					    wider buy column keeps a long Bengali name on fewer lines, so
					    the order button starts higher. */}
					<div className="lg:col-span-6">
						<PantryGallery
							productName={product.name}
							thumbnailImage={product.thumbnail_image}
							galleryImages={product.gallery_images}
							soldOut={soldOut}
						/>
					</div>

					{/* The decision. */}
					<div className="lg:col-span-6">
						{/* The name is the big serif thing; the price is the heavy
						    thing. Tiro Bangla has one weight, so money leaves the
						    display face entirely and speaks in the same bold tabular
						    sans as every price on a shelf tile — one money voice for
						    the whole world. */}
						<h1 className="font-display text-3xl leading-[1.12] text-foreground md:text-4xl lg:text-[2.75rem]">
							{product.name}
						</h1>

						{/* Price, reduction and the real stock number ride one line so
						    the form's first field starts as high as the head allows. */}
						<div className="mt-2.5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
							<span className="text-3xl font-bold tabular-nums text-primary md:text-4xl">
								<Price amount={unitPrice} />
							</span>
							{offPercent !== null && (
								<>
									<span className="text-lg tabular-nums text-muted-foreground line-through">
										<Price amount={listPrice} />
									</span>
									<span className="text-lg font-bold tabular-nums text-accent">
										{t("pantry.percentOff", "{{pct}}% ছাড়", {
											pct: offPercent,
										})}
									</span>
								</>
							)}
							{shelf && !soldOut && (
								<span className="text-base tabular-nums text-muted-foreground">
									{t("pantry.inStockCount", "স্টকে আছে {{count}}টি", {
										count: shelf.count,
									})}
								</span>
							)}
						</div>

						<PantryOrderForm
							id={FORM_ID}
							className="mt-4"
							product={product}
							packs={packs}
							selectedPackId={selectedPackId}
							onSelectPack={setSelectedPackId}
							unitPrice={unitPrice}
							maxQuantity={maxQuantity}
							soldOut={soldOut}
						/>

						{/* The cart, kept working but kept quiet. */}
						<div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
							<button
								type="button"
								onClick={handleAddToCart}
								disabled={soldOut}
								className="ring-warm-focus inline-flex min-h-[2.75rem] items-center gap-2 text-base font-semibold text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary disabled:cursor-not-allowed disabled:opacity-55 disabled:no-underline"
							>
								<ShoppingBasket className="h-4 w-4" aria-hidden />
								{t("pantry.addToBagMulti", "একসাথে কিনতে ব্যাগে রাখুন")}
							</button>
							<Link
								href={ABSOLUTE_ROUTES.CART}
								className="ring-warm-focus text-base text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
							>
								{t("pantry.viewBag", "ব্যাগ দেখুন")}
							</Link>
						</div>
					</div>
				</div>

				{/* Below the decision: what the good is, and where it came from. */}
				{product.description && (
					<section
						className="mt-14 max-w-[70ch] md:mt-20"
						aria-labelledby="pantry-description-title"
					>
						<h2
							id="pantry-description-title"
							className="font-display text-2xl text-foreground md:text-3xl"
						>
							{t("pantry.aboutProduct", "পণ্যটি সম্পর্কে")}
						</h2>
						<div
							className="mt-4 text-base leading-relaxed text-muted-foreground [&_a]:underline [&_li]:mt-1 [&_p]:mt-3 [&_ul]:list-disc [&_ul]:pl-5"
							dangerouslySetInnerHTML={{ __html: product.description }}
						/>
					</section>
				)}

				{/* Catalogue metadata, printed as exactly that. Brand and category
				    are what the shop filed this good under — they are not a claim
				    about where it came from, so they never sit under a provenance
				    heading. */}
				{catalogue.length > 0 && (
					<section
						className="mt-14 md:mt-20"
						aria-labelledby="pantry-catalogue-title"
					>
						<h2
							id="pantry-catalogue-title"
							className="font-display text-2xl text-foreground md:text-3xl"
						>
							{t("pantry.productDetailsTitle", "পণ্যের তথ্য")}
						</h2>
						<dl className="mt-4 max-w-xl divide-y divide-border border-t border-border">
							{catalogue.map((line) => (
								<div
									key={`${line.label}-${line.value}`}
									className="flex items-baseline justify-between gap-6 py-3"
								>
									<dt className="text-sm text-muted-foreground">
										{line.label}
									</dt>
									<dd className="min-w-0 break-words text-right text-base text-foreground">
										{line.value}
									</dd>
								</div>
							))}
						</dl>
					</section>
				)}

				{/* Provenance, only when the backend actually returned a provenance
				    attribute. Empty means this page makes no origin claim at all. */}
				{proof.length > 0 && (
					<section
						className="mt-14 md:mt-20"
						aria-labelledby="pantry-proof-title"
					>
						<h2
							id="pantry-proof-title"
							className="font-display text-2xl text-foreground md:text-3xl"
						>
							{t("pantry.provenance", "উৎস ও তথ্য")}
						</h2>
						{/* Hairlines, never cards — the pantry world divides on rules. */}
						<dl className="pn-proof mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
							{proof.map((line) => (
								<div
									key={`${line.label}-${line.value}`}
									className="flex items-start gap-3 py-4 sm:px-6 sm:py-2 sm:first:pl-0 lg:px-7"
								>
									<Leaf
										className="mt-0.5 h-5 w-5 shrink-0 text-primary"
										aria-hidden
									/>
									<div className="min-w-0">
										<dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
											{line.label}
										</dt>
										<dd className="mt-1 font-display text-lg leading-snug text-foreground">
											{line.value}
										</dd>
									</div>
								</div>
							))}
						</dl>
					</section>
				)}

				{/* Combo offers: link cards only. Configuration lives on /combo. */}
				{combos && combos.length > 0 && (
					<section
						className="mt-14 md:mt-20"
						aria-labelledby="pantry-combos-title"
					>
						<h2
							id="pantry-combos-title"
							className="font-display text-2xl text-foreground md:text-3xl"
						>
							{t("pantry.comboOffers", "একসাথে নিলে সাশ্রয়")}
						</h2>
						<ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{combos.map((combo) => {
								const savings = combo.compare_at_price - combo.price;
								return (
									<li key={combo.id}>
										<Link
											href={ABSOLUTE_ROUTES.COMBO(combo.slug)}
											className="ring-warm-focus flex h-full flex-col justify-between gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary"
										>
											<span className="font-display text-lg leading-snug text-foreground">
												{combo.title}
											</span>
											<span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
												<span className="text-xl font-bold tabular-nums text-primary">
													<Price amount={combo.price} />
												</span>
												{savings > 0 && (
													<span className="inline-flex items-baseline gap-1 text-base font-bold tabular-nums text-accent">
														<Price amount={savings} />
														{t("pantry.comboSave", "সাশ্রয়")}
													</span>
												)}
											</span>
										</Link>
									</li>
								);
							})}
						</ul>
					</section>
				)}

				{reviewsEnabled && product.total_reviews > 0 && (
					<div className="mt-14 md:mt-20">
						<ProductReviews
							averageRating={product.average_rating}
							totalReviews={product.total_reviews}
							ratingCounts={product.rating_counts}
							reviews={product.reviews}
						/>
					</div>
				)}

				{/* The order action, repeated where the scroll ends. A shopper who
				    read to the bottom should not have to hunt back up the page. */}
				{!soldOut && (
					<section className="mt-14 rounded-lg bg-muted p-5 md:mt-20 md:flex md:items-center md:justify-between md:gap-6 md:p-7">
						<div className="min-w-0">
							<h2 className="font-display text-2xl leading-snug text-foreground md:text-3xl">
								{t("pantry.readyToOrder", "নিতে চান? অর্ডার করুন")}
							</h2>
							<p className="mt-1.5 text-base font-semibold text-success">
								{t("pantry.codOnDelivery", "পণ্য হাতে পেয়ে টাকা দিন")}
							</p>
						</div>
						<a
							href={`#${FORM_ID}`}
							className="ring-warm-focus mt-4 inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-lg bg-primary px-7 font-display text-lg text-primary-foreground shadow-warm-md transition-colors hover:bg-primary/90 md:mt-0 md:shrink-0 md:text-xl"
						>
							{t("pantry.orderNow", "অর্ডার করুন")}
							<span className="tabular-nums">
								<Price amount={unitPrice} />
							</span>
						</a>
					</section>
				)}
			</div>

			<PantryStickyOrderBar
				price={unitPrice}
				originalPrice={offPercent !== null ? listPrice : null}
				soldOut={soldOut}
				targetId={FORM_ID}
			/>
		</main>
	);
}
