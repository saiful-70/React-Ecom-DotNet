"use client";

import "../classic.css";

import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { Category } from "@/components/shared/models/category";

/**
 * The ruled category strip. Entries read like column heads written along one
 * ledger line; the strip scrolls sideways on narrow paper.
 */
export function KhataNavigationClient({
	categories,
}: {
	categories: Category[];
}) {
	const { t } = useTranslation();

	return (
		<nav
			aria-label={t("classic2.categoriesNav", "পণ্যের খাত")}
			className="border-b bg-muted"
		>
			<div className="container mx-auto">
				<ul className="flex items-stretch gap-1 overflow-x-auto py-1.5">
					<li className="shrink-0">
						<Link
							href={ABSOLUTE_ROUTES.PRODUCTS}
							className="ring-warm-focus flex h-9 items-center rounded-md px-3 text-sm font-bold text-foreground underline decoration-accent decoration-2 underline-offset-[6px] hover:bg-background"
						>
							{t("classic2.allProducts", "সব পণ্য")}
						</Link>
					</li>
					{categories.map((category) => (
						<li key={category.id} className="shrink-0">
							<Link
								href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(
									category.id
								)}
								className="ring-warm-focus flex h-9 items-center whitespace-nowrap rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
							>
								{category.name}
							</Link>
						</li>
					))}
				</ul>
			</div>
		</nav>
	);
}
