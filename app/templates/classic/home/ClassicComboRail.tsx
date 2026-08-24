"use client";

import "../classic.css";

import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { CartLineImage } from "@/components/shared/CartLineImage";
import Price from "@/components/shared/Price";
import { trackPromotionClick } from "@/lib/analytics/tracking";
import type { BundleSummary } from "@/lib/bundles/types";

/**
 * Combo offers as one hairline-separated rail: photograph, title, the saving
 * in green, and the package price heavy. One list, no cards inside cards.
 */
export function ClassicComboRail({ combos }: { combos: BundleSummary[] }) {
	const { t } = useTranslation();

	if (combos.length === 0) return null;

	return (
		<ul className="divide-y divide-border border-y border-border bg-background">
			{combos.map((combo) => {
				const savings = combo.compare_at_price - combo.price;
				return (
					<li key={combo.id}>
						<Link
							href={`/combo/${combo.slug}`}
							onClick={() =>
								trackPromotionClick({
									promotionId: combo.id,
									code: combo.slug,
								})
							}
							className="ring-warm-focus group flex min-h-14 items-center gap-3 py-3 transition-colors hover:bg-muted sm:gap-4 sm:py-4"
						>
							<span className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-20 sm:w-20">
								<CartLineImage
									src={combo.banner}
									alt={combo.title}
									fill
									sizes="80px"
									className="object-cover"
								/>
							</span>
							<span className="min-w-0 flex-1">
								<span className="block truncate text-sm font-semibold sm:text-base">
									{combo.title}
								</span>
								{savings > 0 && (
									<span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-success">
										{t("classic2.youSave", "সাশ্রয়")}
										<span className="classic-price">
											<Price amount={savings} />
										</span>
									</span>
								)}
							</span>
							<span className="flex shrink-0 flex-col items-end">
								<span className="classic-price text-lg font-extrabold">
									<Price amount={combo.price} />
								</span>
								{savings > 0 && (
									<span className="classic-price text-xs text-muted-foreground line-through">
										<Price amount={combo.compare_at_price} />
									</span>
								)}
							</span>
							<ArrowRight
								className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
								aria-hidden
							/>
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
