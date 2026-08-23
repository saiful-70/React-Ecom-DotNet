"use client";

import { useEffect, useMemo, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { Facebook, Heart, Linkedin, PhoneCall, Twitter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { toast } from "@/components/shared/ui/sonner";
import Price from "@/components/shared/Price";
import { useCart } from "@/contexts/CartContext";
import { buyNowCheckoutHref } from "@/lib/utils/buy-now";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { wishlistAtom } from "@/store/wishlist.atom";
import { toggleWishlist } from "@/(app-routes)/(auth)/action";
import {
	trackUnifiedAddToCart,
	trackUnifiedViewProduct,
} from "@/lib/analytics";
import { ProductDetailsTabs } from "@/components/product/product-details";
import { ProductVariantSelector } from "@/components/product/ProductVariantSelector";
import { ComboOfferCard } from "@/components/home/ComboPromo";
import type { Product, ProductVariant } from "@/(app-routes)/products/model";
import type { ProductDetailsLayoutProps } from "@/templates/types";
import { BazarSectionBand } from "../home/BazarSectionBand";
import { BazarProductsGrid } from "./BazarProductsGrid";
import { BazarDeliveryChart } from "./BazarDeliveryChart";
import { BazarGallery } from "./BazarGallery";
import { BazarQuantityKeys } from "./BazarQuantityKeys";
import { cn } from "@/lib/utils/utils";
import "../bazar.css";

/**
 * The PDP as a single tariff entry: breadcrumb chart strip, gallery left,
 * purchase column right. The column reads top-down the way a counter sells —
 * name, printed stock state, heavy tabular price over the struck original,
 * variants, combos, quantity, THE DELIVERY-FEE CHART (fees before the ask),
 * the phone-confirm trust line, then two ≥48px order keys. The order keys
 * repeat at the page bottom after the tabs, so the thumb never has to travel
 * back up.
 */
export function BazarProductDetails({
	product,
	combos,
}: ProductDetailsLayoutProps) {
	const { t } = useTranslation();
	const router = useRouter();
	const { items, addToCart } = useCart();
	const settings = useAtomValue(businessSettingsAtom);
	const [userProfile] = useAtom(miniProfileAtom);
	const [wishlistIds, setWishlistIds] = useAtom(wishlistAtom);
	const [isWishlistLoading, setIsWishlistLoading] = useState(false);
	const [quantity, setQuantity] = useState(1);
	const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
	const [selectedVariant, setSelectedVariant] =
		useState<ProductVariant | null>(
			product.variants && product.variants.length > 0
				? product.variants[0]
				: null
		);

	const isWishlisted = wishlistIds.includes(product.id);
	const price = selectedVariant
		? parseFloat(selectedVariant.discount_price.toString())
		: parseFloat(product.discounted_price.toString());
	const originalPrice = selectedVariant
		? parseFloat(selectedVariant.price.toString())
		: parseFloat(product.price.toString());
	const stock = selectedVariant ? selectedVariant.stock : product.stock;
	const saveAmount = originalPrice > price ? originalPrice - price : 0;

	useEffect(() => {
		trackUnifiedViewProduct(
			product.id.toString(),
			product.name,
			price,
			product.category?.name
		);
		// Track once on mount only.
	}, [product.id]);

	// Units of this product/variant already reserved in the cart.
	const reservedQuantity = useMemo(
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
	const availableStock = Math.max(stock - reservedQuantity, 0);

	// Fallback image for products without thumbnails (mirrors classic PDP).
	const fallbackImage = `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&auto=format`;
	const mainImage =
		(product.gallery_images && product.gallery_images[0]) ||
		product.thumbnail_image ||
		fallbackImage;

	const doAddToCart = (): { id: number; variant_id?: number } | null => {
		if (availableStock <= 0 || quantity > availableStock) {
			toast.error(t("products.outOfStock"));
			return null;
		}
		addToCart({
			id: product.id,
			name: selectedVariant
				? `${product.name} - ${selectedVariant.combination_text}`
				: product.name,
			price,
			image: mainImage,
			variant_id: selectedVariant?.id,
			stock,
			quantity,
			tax: product.tax ? parseFloat(product.tax) : 0,
			tax_type: product.tax_type || "exclude",
		});
		trackUnifiedAddToCart(
			product.id.toString(),
			product.name,
			price,
			quantity
		);
		return { id: product.id, variant_id: selectedVariant?.id };
	};

	const handleAddToCart = () => {
		if (doAddToCart()) {
			toast.success(t("bazar.addToCart"), {
				description: `${product.name} ${t("productCard.addedToCart")}`,
			});
		}
	};

	const handleBuyNow = () => {
		const line = doAddToCart();
		if (line) {
			// Pass the Buy Now quantity so checkout can display/charge just that
			// amount even if it merged into a pre-existing cart line.
			router.push(buyNowCheckoutHref(line.id, line.variant_id, quantity));
		}
	};

	const handleToggleWishlist = async () => {
		if (!userProfile) {
			toast.error(t("productCard.loginRequired"));
			router.push(
				`/login?redirect=${encodeURIComponent(window.location.pathname)}`
			);
			return;
		}
		setIsWishlistLoading(true);
		try {
			const response = await toggleWishlist(product.id);
			if (response.success) {
				setWishlistIds(
					isWishlisted
						? wishlistIds.filter((id) => id !== product.id)
						: [...wishlistIds, product.id]
				);
				toast.success(
					isWishlisted
						? t("productCard.wishlistRemoved")
						: t("productCard.wishlistAdded")
				);
			} else {
				toast.error(
					response.message || t("productCard.wishlistUpdateFailed")
				);
			}
		} catch {
			toast.error(t("productCard.wishlistUpdateFailed"));
		} finally {
			setIsWishlistLoading(false);
		}
	};

	const share = (network: "facebook" | "twitter" | "linkedin") => {
		const url = encodeURIComponent(window.location.href);
		const shareUrls = {
			facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
			twitter: `https://twitter.com/intent/tweet?url=${url}`,
			linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
		};
		window.open(shareUrls[network], "_blank", "noopener,noreferrer");
	};

	const colorImage = selectedColorId
		? product.colors_image?.find((ci) => ci.id === selectedColorId)?.photo
		: undefined;

	/* The order keys — rendered twice (purchase column + page bottom). */
	const orderKeys = (
		<div className="grid grid-cols-2 gap-2">
			<button
				type="button"
				onClick={handleAddToCart}
				disabled={availableStock <= 0}
				className="bz-key ring-warm-focus min-h-14 rounded-lg bg-secondary px-4 text-sm font-bold text-secondary-foreground shadow-warm-sm disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
			>
				{t("bazar.addToCart")}
			</button>
			<button
				type="button"
				onClick={handleBuyNow}
				disabled={availableStock <= 0}
				className="bz-key ring-warm-focus min-h-14 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground shadow-warm disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
			>
				{t("bazar.buyNow")}
			</button>
		</div>
	);

	return (
		<main className="container mx-auto py-6">
			{/* Breadcrumb — a chart line closed by the board rule. */}
			<nav
				className="mb-6 border-b-[3px] border-secondary pb-3 text-sm"
				aria-label="Breadcrumb"
			>
				<Link
					href="/"
					className="ring-warm-focus rounded-md font-bold underline-offset-4 hover:text-primary hover:underline"
				>
					{t("bazar.home")}
				</Link>
				<span className="mx-2 text-muted-foreground" aria-hidden="true">
					/
				</span>
				<span className="line-clamp-1 inline text-muted-foreground">
					{product.name}
				</span>
			</nav>

			<div className="grid gap-8 lg:grid-cols-2">
				<BazarGallery
					productName={product.name}
					thumbnailImage={product.thumbnail_image}
					galleryImages={product.gallery_images}
					colorImage={colorImage}
				/>

				<div className="space-y-5">
					<div>
						<h1 className="text-balance font-display text-2xl font-bold leading-tight md:text-3xl">
							{product.name}
						</h1>
						<p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
							<span
								className={cn(
									"font-bold",
									availableStock > 0
										? "text-success"
										: "text-destructive"
								)}
							>
								{availableStock > 0
									? `${availableStock} ${t("bazar.inStock")}`
									: t("bazar.stockSoldOut", "স্টক শেষ")}
							</span>
							{product.sku && (
								<span className="text-muted-foreground">
									{t("bazar.sku")}: {product.sku}
								</span>
							)}
						</p>
					</div>

					{/* The price, chart-entry style: heavy current, struck original. */}
					<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-y border-dashed border-border py-3">
						<span className="bz-num font-display text-4xl font-bold text-primary">
							<Price amount={price} />
						</span>
						{saveAmount > 0 && (
							<>
								<span className="bz-num text-lg text-muted-foreground line-through">
									<Price amount={originalPrice} />
								</span>
								<span className="bz-num rounded-md bg-accent px-2.5 py-1 text-sm font-bold text-accent-foreground">
									{t("bazar.save")} <Price amount={saveAmount} />
								</span>
							</>
						)}
					</div>

					{product.variants && product.variants.length > 0 && (
						<ProductVariantSelector
							product={product}
							onVariantChange={(variant) => {
								setSelectedVariant(variant);
								setQuantity(1);
							}}
							onColorChange={(_color, colorId) => {
								setSelectedColorId(colorId || null);
							}}
						/>
					)}

					{/* Combo offers anchored to this product — link to /combo/[slug] */}
					{combos && combos.length > 0 && (
						<div className="space-y-2">
							{combos.map((combo) => (
								<ComboOfferCard key={combo.id} combo={combo} />
							))}
						</div>
					)}

					{/* Fees before the ask — the counter never surprises. */}
					<BazarDeliveryChart />

					{/* The order strip — one keypad block: quantity keys over the
					    two order keys, everything a depressing key. */}
					<div className="space-y-3 rounded-lg border border-border bg-card p-3 shadow-warm-sm">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<span className="text-sm font-bold">
								{t("bazar.quantity", "পরিমাণ")}
							</span>
							<BazarQuantityKeys
								quantity={quantity}
								onQuantityChange={setQuantity}
								stock={availableStock}
							/>
						</div>
						{orderKeys}
						<div className="flex items-center justify-between gap-3">
							{settings?.contact_phone ? (
								<a
									href={`tel:${settings.contact_phone}`}
									className="bz-key ring-warm-focus inline-flex min-h-12 items-center gap-2 rounded-lg border border-primary/50 bg-card px-4 text-sm font-bold text-primary shadow-warm-sm"
								>
									<PhoneCall className="h-4 w-4" aria-hidden="true" />
									{t("bazar.orderByPhone", "ফোনে অর্ডার করুন")}
								</a>
							) : (
								<span />
							)}
							<button
								type="button"
								onClick={handleToggleWishlist}
								disabled={isWishlistLoading}
								aria-label={t("bazar.wishlist")}
								aria-pressed={isWishlisted}
								className={cn(
									"bz-key ring-warm-focus flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border shadow-warm-sm disabled:opacity-60",
									isWishlisted
										? "border-accent bg-accent text-accent-foreground"
										: "border-border bg-card text-muted-foreground hover:border-accent hover:text-accent"
								)}
							>
								<Heart
									className={cn(
										"h-5 w-5",
										isWishlisted && "fill-current"
									)}
									aria-hidden="true"
								/>
							</button>
						</div>
					</div>

					<div className="flex items-center gap-3 border-t border-dashed border-border pt-4">
						<span className="text-sm font-bold">
							{t("bazar.shareOn")}:
						</span>
						<button
							type="button"
							onClick={() => share("facebook")}
							aria-label="Facebook"
							className="bz-key ring-warm-focus flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary"
						>
							<Facebook className="h-4 w-4" aria-hidden="true" />
						</button>
						<button
							type="button"
							onClick={() => share("twitter")}
							aria-label="Twitter"
							className="bz-key ring-warm-focus flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary"
						>
							<Twitter className="h-4 w-4" aria-hidden="true" />
						</button>
						<button
							type="button"
							onClick={() => share("linkedin")}
							aria-label="LinkedIn"
							className="bz-key ring-warm-focus flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary"
						>
							<Linkedin className="h-4 w-4" aria-hidden="true" />
						</button>
					</div>
				</div>
			</div>

			<div className="mt-10">
				<ProductDetailsTabs product={product} />
			</div>

			{/* The order keys again — the thumb ends here after reading the tabs. */}
			<div className="mx-auto mt-8 max-w-xl space-y-2 border-t-[3px] border-secondary pt-6">
				<p className="text-center text-sm font-semibold text-muted-foreground">
					{t(
						"bazar.confirmCallNote",
						"অর্ডার কনফার্ম করতে আমরা ফোনে কল করব"
					)}
				</p>
				{orderKeys}
			</div>

			{product.related_products && product.related_products.length > 0 && (
				<section className="mt-12">
					<BazarSectionBand titleKey="bazar.relatedProducts" />
					<BazarProductsGrid
						products={product.related_products as Product[]}
					/>
				</section>
			)}
		</main>
	);
}
