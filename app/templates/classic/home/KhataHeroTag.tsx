"use client";

import "../classic.css";

import { useAtomValue } from "jotai";
import { BadgeCheck, Phone, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import Price from "@/components/shared/Price";
import { useCities } from "@/hooks/use-cities";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import {
	getBusinessSettingAsNumber,
} from "@/lib/utils/business-settings";
import { businessSettingsAtom } from "@/store/ui-atoms";
import type { Product } from "@/(app-routes)/products/model";
import { KhataImage } from "../shared/KhataImage";

/**
 * The first viewport: today's offer pinned to the ledger like a gummed price
 * tag. Photo matted on page white, price at poster scale in stamp red, the
 * COD and delivery-fee lines printed BEFORE the order button, and the
 * stamp-red order action in the thumb zone. Everything registers on the left
 * rule-spine.
 */
export function KhataHeroTag({ product }: { product: Product }) {
	const { t } = useTranslation();
	const settings = useAtomValue(businessSettingsAtom);
	const cities = useCities();

	const hasDiscount =
		product.price > product.discounted_price &&
		product.discount_type !== "none";
	const freeShippingOver = settings
		? getBusinessSettingAsNumber(settings, "free_shipping_on_over", 0)
		: 0;

	// Zone fees straight from the backend city table (first two zones keep the
	// tag compact); absent data degrades to the printed promise line alone.
	const feeRows = cities
		.map((city) => ({
			id: city.id,
			name: city.name,
			amount:
				typeof city.shipping_cost === "string"
					? Number(city.shipping_cost)
					: city.shipping_cost,
		}))
		.filter(
			(row) => typeof row.amount === "number" && Number.isFinite(row.amount)
		)
		.slice(0, 2);

	return (
		<section
			aria-labelledby="khata-hero-title"
			className="khata-ruled border-b"
		>
			<div className="container mx-auto py-8 md:py-12">
				<div className="khata-spine pl-5 md:pl-8">
					<div className="grid items-start gap-6 md:grid-cols-2 md:gap-10 lg:grid-cols-[5fr_7fr]">
						{/* Photo matted on page white. */}
						<Link
							href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
							className="ring-warm-focus relative block rounded-md border bg-card p-3 shadow-warm md:p-4"
							aria-label={product.name}
						>
							{/* Gummed tag pinned to the photo mat. */}
							<span className="khata-tag absolute left-5 top-5 z-10 inline-flex rotate-[-3deg] items-center rounded-sm border border-accent/50 bg-card px-2.5 py-1 text-xs font-bold text-accent shadow-warm-sm md:left-6 md:top-6">
								{t("classic2.todaysEntry", "আজকের বিশেষ এন্ট্রি")}
							</span>
							<KhataImage
								src={product.thumbnail_image}
								alt={product.name}
								fallbackText={product.name}
								width={640}
								height={640}
								priority
								className="aspect-square w-full rounded-sm object-cover"
								sizes="(max-width: 768px) 100vw, 40vw"
							/>
						</Link>

						<div className="flex flex-col">
							<h1
								id="khata-hero-title"
								className="font-display text-3xl font-bold leading-tight text-balance md:text-4xl lg:text-5xl"
							>
								{product.name}
							</h1>

							{/* Price at poster scale — red owns the order zone. */}
							<p className="mt-4 flex flex-wrap items-baseline gap-x-3">
								<span className="font-display text-5xl font-bold tabular-nums text-primary md:text-6xl">
									<Price amount={product.discounted_price} />
								</span>
								{hasDiscount && (
									<span className="text-xl tabular-nums text-muted-foreground line-through">
										<Price amount={product.price} />
									</span>
								)}
							</p>

							{/* The shop's terms, printed before the button. */}
							<ul className="mt-5 max-w-md space-y-0 text-sm">
								<li className="flex items-center gap-2 border-b border-dashed py-2 font-semibold">
									<BadgeCheck
										className="h-4 w-4 shrink-0 text-success"
										aria-hidden
									/>
									{t("classic2.codBadge", "ক্যাশ অন ডেলিভারি")}
								</li>
								<li className="flex items-center gap-2 border-b border-dashed py-2 text-muted-foreground">
									<Truck className="h-4 w-4 shrink-0" aria-hidden />
									{t(
										"classic2.deliveryPromise",
										"ঢাকায় ২৪–৪৮ ঘণ্টা, ঢাকার বাইরে ২–৩ দিন"
									)}
								</li>
								{feeRows.map((row) => (
									<li
										key={row.id}
										className="flex items-center justify-between gap-2 border-b border-dashed py-2 text-muted-foreground"
									>
										<span>
											{t(
												"classic2.deliveryFeeZone",
												"ডেলিভারি চার্জ"
											)}{" "}
											— {row.name}
										</span>
										<span className="font-semibold tabular-nums text-foreground">
											<Price amount={row.amount as number} />
										</span>
									</li>
								))}
								{freeShippingOver > 0 && (
									<li className="flex items-center gap-2 border-b border-dashed py-2 text-muted-foreground">
										<span>
											<Price amount={freeShippingOver} />
											{"+ "}
											{t(
												"classic2.freeShippingOver",
												"অর্ডারে ডেলিভারি ফ্রি"
											)}
										</span>
									</li>
								)}
							</ul>

							{/* Order action in the thumb zone. */}
							<div className="mt-6 flex flex-wrap items-center gap-4">
								<Link
									href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(
										product.id
									)}
									className="ring-warm-focus inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-bold text-primary-foreground shadow-warm transition-colors hover:bg-primary/90"
								>
									{t("classic2.orderNowCta", "এখনই অর্ডার করুন")}
								</Link>
								{settings?.contact_phone && (
									<a
										href={`tel:${settings.contact_phone}`}
										className="ring-warm-focus inline-flex min-h-12 items-center gap-2 rounded-md text-sm font-semibold text-accent underline-offset-4 hover:underline"
									>
										<Phone className="h-4 w-4" aria-hidden />
										{t("classic2.callToOrder", "ফোনে অর্ডার")}
										{": "}
										<span className="tabular-nums">
											{settings.contact_phone}
										</span>
									</a>
								)}
							</div>
							<p className="mt-3 text-xs text-muted-foreground">
								{t(
									"classic2.confirmCall",
									"অর্ডার কনফার্ম করতে আমরা ফোনে কল করব"
								)}
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
