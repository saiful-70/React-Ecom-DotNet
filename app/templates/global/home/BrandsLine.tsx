"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { Brand } from "@/components/shared/models/brand";
import "../global.css";

/**
 * Brands set as one ruled catalogue line — name (and mark when supplied),
 * separated by hairlines. Collapses when the backend returns none.
 */
export function BrandsLine({ brands }: { brands: Brand[] }) {
	const { t } = useTranslation();

	const active = brands.filter((b) => b.status === 1);
	if (active.length === 0) return null;

	return (
		<section className="container mx-auto">
			<h2 className="sr-only">{t("global.brands")}</h2>
			<ul className="flex flex-wrap items-stretch border-y border-border">
				{active.map((brand) => (
					<li key={brand.id} className="border-r border-border last:border-r-0">
						<Link
							href={`${ABSOLUTE_ROUTES.PRODUCTS}?brand_id=${brand.id}`}
							className="ring-warm-focus flex h-full items-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						>
							{brand.icon && (
								<Image
									src={brand.icon}
									alt=""
									width={24}
									height={24}
									className="h-6 w-6 object-contain"
								/>
							)}
							{brand.name}
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}
