"use client";

import Image from "next/image";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { FeaturedCategory } from "@/components/home/_data/types";
import { BazarSectionTitle } from "./BazarSectionTitle";

/** Category cards: image with a dark name band, linking into the listing. */
export function BazarCategoryGrid({
	categories,
}: {
	categories: FeaturedCategory[];
}) {
	if (categories.length === 0) return null;

	return (
		<section>
			<BazarSectionTitle titleKey="bazar.categories" />
			<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
				{categories.map((category) => (
					<Link
						key={category.id}
						href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(
							category.category_id
						)}
						className="group overflow-hidden rounded-md border bg-card shadow-sm transition-shadow hover:shadow-md"
					>
						<div className="relative aspect-square bg-white">
							<Image
								src={category.icon_url}
								alt={category.name}
								fill
								className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
								sizes="(max-width: 768px) 50vw, 20vw"
							/>
						</div>
						<div className="bg-secondary/80 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-secondary-foreground">
							{category.name}
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}
