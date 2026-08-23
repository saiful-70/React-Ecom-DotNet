"use client";

import type { CSSProperties } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import Price from "@/components/shared/Price";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { Product } from "@/(app-routes)/products/model";
import { useQuickAdd } from "../product/use-quick-add";
import { BazarImage } from "../BazarImage";
import "../bazar.css";

/**
 * The tariff board — today's offers as laminated chart rows under a
 * board-black header, the way a flexiload counter lists its packages: name on
 * the left, big tabular price on the right, struck original beneath, one
 * azure add-key per row. Stock state is always printed, never hidden.
 */
export function BazarTariffBoard({ products }: { products: Product[] }) {
	const { t } = useTranslation();

	if (products.length === 0) return null;

	return (
		<div className="overflow-hidden rounded-lg border border-border bg-card shadow-warm">
			<div className="flex items-baseline justify-between gap-3 bg-secondary px-4 py-3 md:px-5">
				<h2 className="font-display text-lg font-bold text-secondary-foreground md:text-xl">
					{t("bazar.todaysOffers", "আজকের অফার")}
				</h2>
				<span className="bz-num text-xs font-semibold text-secondary-foreground/70">
					{t("bazar.offerCount", {
						defaultValue: "{{count}}টি অফার",
						count: products.length,
					})}
				</span>
			</div>
			<ol className="bz-chart-divide">
				{products.map((product, index) => (
					<TariffRow key={product.id} product={product} index={index} />
				))}
			</ol>
		</div>
	);
}

function TariffRow({ product, index }: { product: Product; index: number }) {
	const { t } = useTranslation();
	const { handleAddToCart } = useQuickAdd(product);

	const isOutOfStock = product.stock <= 0;
	const hasDiscount =
		product.price > product.discounted_price &&
		product.discount_type !== "none";
	const saveAmount = hasDiscount ? product.price - product.discounted_price : 0;

	return (
		<li
			className="bz-row-enter"
			style={{ "--i": index } as CSSProperties}
		>
			<div className="group relative flex items-center gap-3 px-3 py-3 transition-colors hover:bg-muted/60 md:gap-4 md:px-5">
				<div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-background md:h-16 md:w-16">
					<BazarImage
						src={product.thumbnail_image}
						alt=""
						fallbackLabel={product.name}
						fill
						className="object-cover"
						plateClassName="text-lg"
						sizes="64px"
					/>
				</div>
				<div className="min-w-0 flex-1">
					<Link
						href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
						className="ring-warm-focus rounded-md text-sm font-bold leading-snug hover:text-primary focus-visible:text-primary md:text-base"
					>
						<span className="absolute inset-0" aria-hidden="true" />
						<span className="line-clamp-2">{product.name}</span>
					</Link>
					<p
						className={
							isOutOfStock
								? "mt-1 text-xs font-bold text-destructive"
								: "mt-1 text-xs font-semibold text-success"
						}
					>
						{isOutOfStock
							? t("bazar.stockSoldOut", "স্টক শেষ")
							: t("bazar.stockIn")}
					</p>
				</div>
				<div className="shrink-0 text-right">
					<p className="bz-num font-display text-lg font-bold text-primary md:text-xl">
						<Price amount={product.discounted_price} />
					</p>
					{hasDiscount && (
						<p className="bz-num text-xs text-muted-foreground">
							<span className="line-through">
								<Price amount={product.price} />
							</span>{" "}
							<span className="font-bold text-accent">
								−<Price amount={saveAmount} />
							</span>
						</p>
					)}
				</div>
				<button
					type="button"
					onClick={handleAddToCart}
					disabled={isOutOfStock}
					aria-label={`${t("bazar.addToCart")} — ${product.name}`}
					className="bz-key ring-warm-focus relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-warm-sm disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
				>
					<Plus className="h-5 w-5" aria-hidden="true" />
				</button>
			</div>
		</li>
	);
}
