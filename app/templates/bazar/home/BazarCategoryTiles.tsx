"use client";

import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { FeaturedCategory } from "@/components/home/_data/types";
import { deptStyle } from "../dept-color";
import { BazarImage } from "../BazarImage";
import { BazarSectionBand } from "./BazarSectionBand";
import "../bazar.css";

/**
 * Featured-category tiles, colour-coded by the same SIM cycle as the
 * department rail: each tile's name band reads its department's one hue —
 * dot + tinted chip — so a shopper who entered a colour upstream lands on
 * the same colour here.
 */
export function BazarCategoryTiles({
	categories,
}: {
	categories: FeaturedCategory[];
}) {
	const { t } = useTranslation();

	if (categories.length === 0) return null;

	return (
		<section aria-label={t("bazar.categories")}>
			<BazarSectionBand titleKey="bazar.categories" />
			<div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-5">
				{categories.map((category, index) => (
					<Link
						key={category.id}
						href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(
							category.category_id
						)}
						style={deptStyle(index)}
						className="bz-key ring-warm-focus group overflow-hidden rounded-lg border border-border bg-card shadow-warm-sm hover:shadow-warm"
					>
						<div className="relative aspect-square bg-background">
							<BazarImage
								src={category.icon_url}
								alt={category.name}
								fill
								className="object-contain p-4 transition-transform duration-300 ease-out group-hover:scale-105"
								plateClassName="text-5xl"
								sizes="(max-width: 768px) 50vw, 20vw"
							/>
						</div>
						<div className="bz-dept-band flex items-center justify-center gap-2 px-2 py-2.5 text-center text-xs font-bold">
							<span
								className="bz-dept-dot h-2 w-2 shrink-0 rounded-full"
								aria-hidden="true"
							/>
							<span className="truncate">{category.name}</span>
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}
