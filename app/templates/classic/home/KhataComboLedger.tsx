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
 * Combo offers written as ledger entries: one row per offer on the ruled
 * page — thumbnail, title, the savings on a gummed tag, and the package
 * price. Rows separate by printed rules, all registered on the band spine.
 */
export function KhataComboLedger({ combos }: { combos: BundleSummary[] }) {
	const { t } = useTranslation();

	if (combos.length === 0) return null;

	return (
		<div className="rounded-md border bg-card shadow-warm-sm">
			<ul className="divide-y">
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
								className="ring-warm-focus group flex min-h-12 items-center gap-3 p-3 transition-colors hover:bg-muted/50 sm:gap-4 sm:p-4"
							>
								<span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-sm border sm:h-16 sm:w-16">
									<CartLineImage
										src={combo.banner}
										alt={combo.title}
										fill
										sizes="64px"
										className="object-cover"
									/>
								</span>
								<span className="min-w-0 flex-1">
									<span className="block truncate text-sm font-semibold sm:text-base">
										{combo.title}
									</span>
									{savings > 0 && (
										<span className="khata-tag mt-1 inline-flex items-center rounded-sm border border-success/40 px-2 py-0.5 text-[11px] font-semibold text-success">
											{t("classic2.youSave", "সাশ্রয়")}{" "}
											<span className="ml-1 tabular-nums">
												<Price amount={savings} />
											</span>
										</span>
									)}
								</span>
								<span className="flex shrink-0 flex-col items-end">
									<span className="text-lg font-bold tabular-nums text-primary">
										<Price amount={combo.price} />
									</span>
									{savings > 0 && (
										<span className="text-xs tabular-nums text-muted-foreground line-through">
											<Price
												amount={combo.compare_at_price}
											/>
										</span>
									)}
								</span>
								<ArrowRight
									className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5"
									aria-hidden
								/>
							</Link>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
