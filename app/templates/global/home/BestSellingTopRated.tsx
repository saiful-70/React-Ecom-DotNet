"use client";

import Image from "next/image";
import { Award, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import Price from "@/components/shared/Price";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { Product } from "@/(app-routes)/products/model";
import { GlobalRatingStars } from "../product/GlobalRatingStars";

const FALLBACK_IMAGE =
	"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop&q=80";

function CompactRow({ product }: { product: Product }) {
	const image =
		product.thumbnail_image && product.thumbnail_image.trim() !== ""
			? product.thumbnail_image
			: FALLBACK_IMAGE;

	return (
		<Link
			href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
			className="flex items-center gap-3 rounded-md border bg-card p-2.5 transition-colors hover:border-primary/40"
		>
			<span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-white p-1">
				<Image
					src={image}
					alt={product.name}
					width={64}
					height={64}
					className="h-full w-full object-contain"
					sizes="64px"
				/>
			</span>
			<span className="min-w-0 flex-1">
				<span className="line-clamp-1 text-sm font-medium hover:text-primary">
					{product.name}
				</span>
				<span className="mt-1 block text-sm font-bold text-primary tabular-nums">
					<Price amount={product.discounted_price} />
				</span>
				<GlobalRatingStars
					rating={product.average_rating}
					count={product.total_reviews}
					className="mt-1"
				/>
			</span>
		</Link>
	);
}

function Column({
	title,
	icon,
	products,
	viewAllHref,
}: {
	title: string;
	icon: React.ReactNode;
	products: Product[];
	viewAllHref: string;
}) {
	const { t } = useTranslation();

	if (products.length === 0) return null;

	return (
		<div className="rounded-lg border bg-card p-4 shadow-sm">
			<div className="mb-4 flex items-center justify-between">
				<h3 className="flex items-center gap-2 text-lg font-bold">
					{icon}
					{title}
				</h3>
				<Link
					href={viewAllHref}
					className="text-sm font-medium text-primary hover:underline"
				>
					{t("global.viewAll")}
				</Link>
			</div>
			<div className="grid gap-3 sm:grid-cols-2">
				{products.map((product) => (
					<CompactRow key={product.id} product={product} />
				))}
			</div>
		</div>
	);
}

/** Two-column split: Best Selling (left) and Top Rated (right). */
export function BestSellingTopRated({
	bestSelling,
	topRated,
}: {
	bestSelling: Product[];
	topRated: Product[];
}) {
	const { t } = useTranslation();

	if (bestSelling.length === 0 && topRated.length === 0) return null;

	return (
		<section className="grid gap-6 lg:grid-cols-2">
			<Column
				title={t("global.bestSelling")}
				icon={<Trophy className="h-5 w-5 text-warning" />}
				products={bestSelling}
				viewAllHref={`${ABSOLUTE_ROUTES.PRODUCTS}?top_selling=1`}
			/>
			<Column
				title={t("global.topRated")}
				icon={<Award className="h-5 w-5 text-warning" />}
				products={topRated}
				viewAllHref={`${ABSOLUTE_ROUTES.PRODUCTS}?sort=rating`}
			/>
		</section>
	);
}
