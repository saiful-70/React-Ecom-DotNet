"use client";

import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import Price from "@/components/shared/Price";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { Product } from "@/(app-routes)/products/model";
import { PantryImage } from "../shared/PantryImage";
import { discountPercent, primaryImage, sellingPrice } from "../lib";
import "../pantry.css";

/**
 * Today's price cuts — the one region of this world where honey amber is
 * allowed, because here it means the only thing it is ever allowed to mean:
 * a real reduction the backend actually returned.
 *
 * Deliberately NOT the urgency stack this section usually becomes. There is no
 * countdown, because no endpoint gives an end time; no "only 3 left", because
 * the stock field says nothing about the offer; no rotated corner ribbon. Just
 * the true percentage and the struck original — and for a product the backend
 * discounted by nothing, no figure at all.
 */
export function PantryDealsBand({
	id,
	products,
}: {
	id: string;
	products: Product[];
}) {
	const { t } = useTranslation();

	if (products.length === 0) return null;

	const headingId = `${id}-heading`;

	return (
		<section id={id} aria-labelledby={headingId} className="bg-accent">
			<div className="pb-10 pt-14 md:pb-14 md:pt-20 lg:pt-24">
				<div className="container mx-auto">
					<h2
						id={headingId}
						className="mb-7 font-display text-2xl leading-tight text-accent-foreground md:mb-10 md:text-4xl"
					>
						{t("pantry.todaysCuts", "আজকের দাম কমেছে")}
					</h2>

					<ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
						{products.map((product) => {
							const off = discountPercent(product);
							const now = sellingPrice(product);

							return (
								<li key={product.id}>
									<Link
										href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
										className="ring-warm-focus group flex h-full flex-col overflow-hidden rounded-lg bg-background shadow-warm transition-transform duration-200 will-change-transform hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
									>
										<span className="relative block aspect-square w-full bg-muted">
											<PantryImage
												src={primaryImage(product)}
												alt={product.name}
												sizes="(min-width: 1024px) 24vw, (min-width: 640px) 32vw, 47vw"
												className="object-cover"
											/>
											{off !== null && (
												<span className="absolute left-2 top-2 inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground tabular-nums">
													{t("pantry.percentOff", "{{pct}}% ছাড়", {
														pct: off,
													})}
												</span>
											)}
										</span>

										<span className="flex flex-1 flex-col p-3.5 md:p-4">
											<span className="line-clamp-2 font-display text-base leading-snug text-foreground md:text-lg">
												{product.name}
											</span>
											<span className="mt-auto flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 pt-3">
												<span className="text-lg font-bold tabular-nums text-primary md:text-xl">
													<Price amount={now} />
												</span>
												{off !== null && (
													<span className="text-sm text-muted-foreground line-through tabular-nums">
														<Price amount={product.price} />
													</span>
												)}
											</span>
										</span>
									</Link>
								</li>
							);
						})}
					</ul>
				</div>
			</div>

			<div className="pn-shelf" aria-hidden="true" />
		</section>
	);
}
