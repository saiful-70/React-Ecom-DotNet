"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { Brand } from "@/components/shared/models/brand";
import { GlobalSectionTitle } from "./GlobalSectionTitle";

/** Brand shortcuts: circular logo chips linking to the brand-filtered listing. */
export function BrandsStrip({ brands }: { brands: Brand[] }) {
	const { t } = useTranslation();

	if (brands.length === 0) return null;

	return (
		<section>
			<GlobalSectionTitle title={t("global.brands")} />
			<div className="flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{brands.map((brand) => (
					<Link
						key={brand.id}
						href={`${ABSOLUTE_ROUTES.PRODUCTS}?brand_id=${brand.id}`}
						className="group flex w-24 shrink-0 snap-start flex-col items-center gap-2 text-center"
					>
						<span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border bg-card p-3 shadow-sm transition-all group-hover:border-primary/40 group-hover:shadow-md">
							{brand.icon ? (
								<Image
									src={brand.icon}
									alt={brand.name}
									width={64}
									height={64}
									className="h-full w-full object-contain"
									sizes="80px"
								/>
							) : (
								<span className="text-xs font-semibold text-muted-foreground">
									{brand.name.slice(0, 2)}
								</span>
							)}
						</span>
						<span className="line-clamp-1 text-xs font-medium group-hover:text-primary">
							{brand.name}
						</span>
					</Link>
				))}
			</div>
		</section>
	);
}
