"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { FeaturedCategory } from "@/components/home/_data/types";
import "../global.css";

/**
 * Featured departments as an index-tab row on a hairline rule. Backed by the
 * real featured-categories endpoint; collapses when empty.
 */
export function DepartmentIndex({
	categories,
}: {
	categories: FeaturedCategory[];
}) {
	const { t } = useTranslation();

	if (categories.length === 0) return null;

	return (
		<section className="container mx-auto">
			<h2 className="sr-only">{t("global.allCategories")}</h2>
			<nav
				aria-label={t("global.allCategories")}
				className="g-no-scrollbar flex items-end gap-1.5 overflow-x-auto border-b border-border pt-1"
			>
				{categories.map((category) => (
					<Link
						key={category.id}
						href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(category.category_id)}
						className="g-tab ring-warm-focus flex shrink-0 items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.06em]"
					>
						{category.icon_url && (
							<Image
								src={category.icon_url}
								alt=""
								width={20}
								height={20}
								className="h-5 w-5 object-contain"
							/>
						)}
						{category.name}
					</Link>
				))}
			</nav>
		</section>
	);
}
