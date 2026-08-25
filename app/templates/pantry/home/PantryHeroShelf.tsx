"use client";

import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { Truck, Wallet } from "lucide-react";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import Price from "@/components/shared/Price";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { businessSettingsAtom } from "@/store/ui-atoms";
import type { Product } from "@/(app-routes)/products/model";
import { PantryImage } from "../shared/PantryImage";
import { discountPercent, primaryImage, sellingPrice } from "../lib";
import "../pantry.css";

/**
 * The thesis viewport: one jar, photographed edge to edge, with its Bengali
 * name set at billboard scale over a bottom-anchored forest scrim and a single
 * green order button. No carousel of banners, no offer wall — a single-brand
 * pantry has one flagship good, and the page opens on it the way a shop opens
 * on the thing in the window.
 *
 * The photograph is the argument. Type sits only in the scrim's dense base so
 * it clears 4.5:1 against whatever the client uploaded, and a missing image
 * degrades to the stone plate rather than collapsing the fold.
 *
 * The stone band under the shelf edge carries terms, not slogans: how you pay
 * (cash on delivery is the only method this product supports) and — only when
 * the client actually configured a threshold — the free-delivery amount. This
 * template is multi-tenant, so a purity or sourcing claim printed here would
 * be a claim made on behalf of every shop that ever uses it.
 */
export function PantryHeroShelf({ product }: { product: Product }) {
	const { t } = useTranslation();
	const settings = useAtomValue(businessSettingsAtom);
	const image = primaryImage(product);
	const now = sellingPrice(product);
	const off = discountPercent(product);
	const href = ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id);

	// `free_shipping_on_over` arrives as a string and is "0" on a shop that
	// grants no free delivery — advertising that would be a lie.
	const freeOver = Number(settings?.free_shipping_on_over);
	const hasFreeOver = Number.isFinite(freeOver) && freeOver > 0;

	return (
		<section className="relative" aria-labelledby="pantry-hero-name">
			{/* The photograph: tall enough on a phone to read as a shop window,
			    wide and cinematic on a desktop where the fold is shallow. */}
			<div className="relative h-[68vh] min-h-[26rem] w-full overflow-hidden bg-muted md:h-[32rem] lg:h-[36rem]">
				<PantryImage
					src={image}
					alt={product.name}
					priority
					sizes="100vw"
					className="object-cover"
					plateClassName="bg-muted"
					plateScale="hero"
				/>
				<div className="pn-scrim absolute inset-0" aria-hidden="true" />

				{/* The name, the price, the button — all inside the scrim base. */}
				<div className="absolute inset-x-0 bottom-0">
					<div className="container mx-auto pb-7 md:pb-10">
						<div className="max-w-2xl text-secondary-foreground">
							{off !== null && (
								<span className="mb-3 inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
									{t("pantry.percentOff", "{{pct}}% ছাড়", { pct: off })}
								</span>
							)}
							<h1 id="pantry-hero-name" className="pn-billboard">
								{product.name}
							</h1>
							<div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-2">
								{/* Money keeps one voice across this world: bold
								    tabular sans, never the display serif. */}
								<span className="text-3xl font-bold tabular-nums md:text-4xl">
									<Price amount={now} />
								</span>
								{off !== null && (
									<span className="text-lg text-secondary-foreground/70 line-through tabular-nums">
										<Price amount={product.price} />
									</span>
								)}
							</div>
							<div className="mt-5 flex flex-wrap items-center gap-3">
								<Link
									href={href}
									className="ring-warm-focus inline-flex h-12 items-center justify-center rounded-lg bg-primary px-7 font-display text-lg text-primary-foreground shadow-warm-md transition-colors hover:bg-primary/90 md:h-14 md:px-9 md:text-xl"
								>
									{t("pantry.orderNow", "অর্ডার করুন")}
								</Link>
								<span className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-foreground/85">
									<Truck className="h-4 w-4" aria-hidden />
									{t("pantry.codOnDelivery", "পণ্য হাতে পেয়ে টাকা দিন")}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* The shelf edge closes the window and says: goods below. */}
			<div className="pn-shelf" aria-hidden="true" />

			{/* One quiet line of terms, on the stone band. Backed facts only. */}
			<div className="bg-muted">
				<div className="container mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-1 py-2.5 text-xs font-semibold text-success">
					<span className="inline-flex items-center gap-1.5">
						<Wallet className="h-4 w-4" aria-hidden />
						{t("pantry.codBadge", "ক্যাশ অন ডেলিভারি")}
					</span>
					{hasFreeOver && (
						<span className="inline-flex items-center gap-1.5">
							<Truck className="h-4 w-4 shrink-0" aria-hidden />
							<span>
								{t("pantry.freeDeliveryOverPre", "ডেলিভারি ফ্রি")}{" "}
								<span className="tabular-nums">
									<Price amount={freeOver} />
								</span>{" "}
								{t("pantry.freeDeliveryOverPost", "এর বেশি অর্ডারে")}
							</span>
						</span>
					)}
				</div>
			</div>
		</section>
	);
}
