"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { FeaturedCategory } from "@/components/home/_data/types";
import { GlobalSectionTitle } from "./GlobalSectionTitle";

/** Circular category shortcuts (image chip + label) linking into the listing. */
export function CategoriesStrip({
	categories,
}: {
	categories: FeaturedCategory[];
}) {
	const { t } = useTranslation();

	if (categories.length === 0) return null;

	return (
		<section>
			<GlobalSectionTitle
				title={t("global.categories")}
				viewAllHref={ABSOLUTE_ROUTES.PRODUCTS}
			/>
			<div className="grid grid-cols-4 gap-4 sm:grid-cols-6 md:grid-cols-8">
				{categories.map((category) => (
					<Link
						key={category.id}
						href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(category.category_id)}
						className="group flex flex-col items-center gap-2 text-center"
					>
						<span className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-full border bg-card p-3 shadow-sm transition-all group-hover:border-primary/40 group-hover:shadow-md">
							<Image
								src={category.icon_url}
								alt={category.name}
								width={80}
								height={80}
								className="h-full w-full object-contain transition-transform group-hover:scale-105"
								sizes="120px"
							/>
						</span>
						<span className="line-clamp-2 text-xs font-medium leading-tight group-hover:text-primary">
							{category.name}
						</span>
					</Link>
				))}
			</div>
		</section>
	);
}
