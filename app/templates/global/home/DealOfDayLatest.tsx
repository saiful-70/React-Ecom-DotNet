"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { Button } from "@/components/shared/ui/button";
import Price from "@/components/shared/Price";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { Product } from "@/(app-routes)/products/model";
import { GlobalSectionTitle } from "./GlobalSectionTitle";
import { GlobalProductsGrid } from "../product/GlobalProductsGrid";

const FALLBACK_IMAGE =
	"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=80";

/**
 * "Deal of the Day" spotlight card (HEURISTIC pick — see _data/mock.ts) beside
 * a grid of the latest products.
 */
export function DealOfDayLatest({
	dealProduct,
	latestProducts,
}: {
	dealProduct: Product | null;
	latestProducts: Product[];
}) {
	const { t } = useTranslation();

	if (latestProducts.length === 0 && !dealProduct) return null;

	const image =
		dealProduct?.thumbnail_image &&
		dealProduct.thumbnail_image.trim() !== ""
			? dealProduct.thumbnail_image
			: FALLBACK_IMAGE;
	const hasDiscount =
		!!dealProduct &&
		dealProduct.price > dealProduct.discounted_price &&
		dealProduct.discount_type !== "none";
	const discountPercent =
		hasDiscount && dealProduct && dealProduct.price > 0
			? Math.round(
					((dealProduct.price - dealProduct.discounted_price) /
						dealProduct.price) *
						100
				)
			: 0;

	return (
		<section className="grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
			{dealProduct && (
				<div className="rounded-lg border bg-card p-4 shadow-sm">
					<h3 className="mb-3 text-center text-sm font-bold uppercase tracking-wide text-primary">
						{t("global.dealOfDay")}
					</h3>
					<Link
						href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(dealProduct.id)}
						className="relative block rounded-md bg-white p-4"
					>
						{discountPercent > 0 && (
							<span className="absolute left-2 top-2 z-10 rounded bg-primary px-1.5 py-0.5 text-[11px] font-bold text-primary-foreground">
								-{discountPercent}%
							</span>
						)}
						<Image
							src={image}
							alt={dealProduct.name}
							width={280}
							height={280}
							className="mx-auto h-48 w-full object-contain"
							sizes="300px"
						/>
					</Link>
					<Link href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(dealProduct.id)}>
						<h4 className="mt-3 line-clamp-2 text-center font-semibold hover:text-primary">
							{dealProduct.name}
						</h4>
					</Link>
					<div className="mt-2 flex items-center justify-center gap-2">
						<span className="text-lg font-bold text-primary tabular-nums">
							<Price amount={dealProduct.discounted_price} />
						</span>
						{hasDiscount && (
							<span className="text-sm text-muted-foreground line-through tabular-nums">
								<Price amount={dealProduct.price} />
							</span>
						)}
					</div>
					<Button asChild className="mt-4 w-full font-semibold">
						<Link href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(dealProduct.id)}>
							{t("global.grabDeal")}
						</Link>
					</Button>
				</div>
			)}

			<div className="min-w-0">
				<GlobalSectionTitle
					title={t("global.latestProducts")}
					viewAllHref={`${ABSOLUTE_ROUTES.PRODUCTS}?sort=latest`}
				/>
				<GlobalProductsGrid products={latestProducts} />
			</div>
		</section>
	);
}
