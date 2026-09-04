"use client";

import { useTranslation } from "react-i18next";
import { BadgeCheck, Phone, ShoppingBasket } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { useAtomValue } from "jotai";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import Price from "@/components/shared/Price";
import { BundleUnitPicker } from "@/components/product/bundle/BundleUnitPicker";
import { useComboLanding } from "@/components/product/bundle/use-combo-landing";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { cn } from "@/lib/utils/utils";
import type { ComboLayoutProps } from "@/templates/types";
import { PantryGallery } from "./PantryGallery";
import { PantryImage } from "../shared/PantryImage";
import "../pantry.css";

/**
 * The combo shelf: several goods sold as one pack.
 *
 * The world's own devices carry it — the photograph is the argument, the
 * packages are pack tiles that fill green when chosen, the shelf edge closes
 * the band of goods, and money speaks in one bold tabular sans voice.
 *
 * DEVIATION, deliberate: this page does NOT carry the on-page order form that
 * the product page uses. A bundle order needs a server-validated tier quote at
 * checkout, which `placePantryOrder` (single product, single variant) cannot
 * express. So the order button goes to the scoped buy-now checkout instead,
 * and the bag stays the quiet secondary path it already is in this world.
 */
export function PantryCombo({ combo }: ComboLayoutProps) {
	const { t, i18n } = useTranslation();
	const settings = useAtomValue(businessSettingsAtom);
	const {
		selectedTier,
		selectedTierId,
		selectTier,
		gallery,
		trust,
		includedItems,
		soldOut,
		addToCart,
		buyNow,
		axesFor,
		unitsFor,
		setAxisValue,
	} = useComboLanding(combo);

	if (!selectedTier) return null;

	const tierUnits = unitsFor(selectedTier);
	const offPercent =
		selectedTier.compare_at_price > selectedTier.price
			? Math.round(
					((selectedTier.compare_at_price - selectedTier.price) /
						selectedTier.compare_at_price) *
						100
				)
			: null;

	/** The offer's real closing date, printed plainly — amber stays unbuyable. */
	const closesOn = (() => {
		if (!combo.ends_at) return null;
		const date = new Date(combo.ends_at);
		if (Number.isNaN(date.getTime())) return null;
		try {
			return new Intl.DateTimeFormat(
				i18n.language === "bn" ? "bn-BD" : "en-GB",
				{ day: "numeric", month: "long" }
			).format(date);
		} catch {
			return date.toDateString();
		}
	})();

	const orderButton = (className?: string) => (
		<button
			type="button"
			onClick={() => buyNow(selectedTier)}
			disabled={soldOut}
			className={cn(
				"ring-warm-focus inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-lg bg-primary px-7 font-display text-lg text-primary-foreground shadow-warm-md transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none md:text-xl",
				className
			)}
		>
			{soldOut
				? t("pantry.stockFinished", "স্টক শেষ")
				: t("pantry.orderNow", "অর্ডার করুন")}
		</button>
	);

	return (
		<main className="bg-background text-foreground">
			<div className="container mx-auto py-6 md:py-8">
				<div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
					{/* The goods. */}
					<div className="lg:col-span-6">
						<PantryGallery
							productName={combo.title}
							thumbnailImage={gallery[0] ?? combo.banner}
							galleryImages={gallery.slice(1)}
							soldOut={soldOut}
						/>
					</div>

					{/* The decision. */}
					<div className="lg:col-span-6">
						<h1 className="font-display text-3xl leading-[1.12] text-foreground md:text-4xl lg:text-[2.75rem]">
							{combo.title}
						</h1>

						<div className="mt-2.5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
							<span className="text-3xl font-bold tabular-nums text-primary md:text-4xl">
								<Price amount={selectedTier.price} />
							</span>
							{offPercent !== null && (
								<>
									<span className="text-lg tabular-nums text-muted-foreground line-through">
										<Price amount={selectedTier.compare_at_price} />
									</span>
									<span className="text-lg font-bold tabular-nums text-accent">
										{t("pantry.percentOff", "{{pct}}% ছাড়", {
											pct: offPercent,
										})}
									</span>
								</>
							)}
						</div>

						{combo.description && (
							<p className="mt-3 max-w-[70ch] text-base leading-relaxed text-muted-foreground">
								{combo.description}
							</p>
						)}

						{combo.highlights?.length ? (
							<ul className="mt-3 space-y-1.5 text-base">
								{combo.highlights.map((highlight, i) => (
									<li key={i} className="flex items-start gap-2">
										<BadgeCheck
											className="mt-1 h-4 w-4 shrink-0 text-success"
											aria-hidden
										/>
										{highlight}
									</li>
								))}
							</ul>
						) : null}

						{/* Packages as pack tiles: chosen means a filled green
						    field, never a tint. */}
						{combo.tiers.length > 1 && (
							<div className="mt-5">
								<p className="text-base font-semibold">
									{t("pantry.choosePack", "প্যাক বেছে নিন")}
								</p>
								<div
									role="radiogroup"
									aria-label={t("pantry.choosePack", "প্যাক বেছে নিন")}
									className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3"
								>
									{combo.tiers.map((tier) => {
										const selected = tier.id === selectedTierId;
										const unavailable = tier.is_available === false;
										return (
											<button
												key={tier.id}
												type="button"
												role="radio"
												aria-checked={selected}
												disabled={unavailable}
												onClick={() => selectTier(tier.id)}
												className={cn(
													"pn-pack ring-warm-focus flex min-h-[3.25rem] flex-col items-start justify-center rounded-lg border px-3 py-2 text-left",
													selected
														? "border-primary bg-primary text-primary-foreground"
														: "border-border bg-background hover:border-primary",
													unavailable &&
														"cursor-not-allowed border-border bg-muted text-muted-foreground hover:border-border"
												)}
											>
												<span className="text-sm font-semibold leading-tight">
													{tier.name}
												</span>
												<span className="mt-0.5 text-sm font-semibold tabular-nums">
													{unavailable ? (
														t("pantry.packSoldOut", "শেষ")
													) : (
														<Price amount={tier.price} />
													)}
												</span>
											</button>
										);
									})}
								</div>
							</div>
						)}

						{tierUnits.hasPicker && (
							<div className="mt-5">
								<p className="mb-2 text-base font-semibold">
									{t("pantry.chooseEachItem", "প্রতিটি পণ্য বাছুন")}
								</p>
								<BundleUnitPicker
									slots={tierUnits.slots}
									selections={tierUnits.selections}
									issues={tierUnits.issues}
									axesFor={axesFor}
									onAxisChange={(slotKey, item, optionName, value) =>
										setAxisValue(
											selectedTier,
											slotKey,
											item,
											optionName,
											value
										)
									}
									showItemName={selectedTier.items.length > 1}
								/>
							</div>
						)}

						{/* The bill, printed above the button. */}
						<dl className="mt-5 space-y-1.5 border-t border-border pt-4 text-base">
							<div className="flex items-baseline justify-between gap-4">
								<dt className="text-muted-foreground">
									{t("bundle.totalPrice")}
								</dt>
								<dd className="font-bold tabular-nums text-primary">
									<Price amount={selectedTier.price} />
								</dd>
							</div>
							{selectedTier.savings > 0 && (
								<div className="flex items-baseline justify-between gap-4">
									<dt className="text-muted-foreground">
										{t("pantry.comboSave", "সাশ্রয়")}
									</dt>
									<dd className="font-bold tabular-nums text-accent">
										<Price amount={selectedTier.savings} />
									</dd>
								</div>
							)}
							{closesOn && (
								<div className="flex items-baseline justify-between gap-4">
									<dt className="text-muted-foreground">
										{t("pantry.offerUntil", "অফার চলবে")}
									</dt>
									<dd className="tabular-nums" suppressHydrationWarning>
										{closesOn}
									</dd>
								</div>
							)}
						</dl>

						<div className="mt-4">{orderButton()}</div>

						{/* The two cash-on-delivery promises, in trust green. */}
						<ul className="mt-3 space-y-1.5 text-base text-success">
							<li className="flex items-center gap-2">
								<BadgeCheck className="h-4 w-4 shrink-0" aria-hidden />
								{t("pantry.codOnDelivery", "পণ্য হাতে পেয়ে টাকা দিন")}
							</li>
							<li className="flex items-center gap-2">
								<Phone className="h-4 w-4 shrink-0" aria-hidden />
								{t(
									"pantry.willConfirmByPhone",
									"অর্ডার কনফার্ম করতে আমরা ফোনে কল করব"
								)}
							</li>
						</ul>

						{/* The bag, kept working but kept quiet. */}
						<div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
							<button
								type="button"
								onClick={() => addToCart(selectedTier)}
								disabled={soldOut}
								className="ring-warm-focus inline-flex min-h-[2.75rem] items-center gap-2 text-base font-semibold text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary disabled:cursor-not-allowed disabled:opacity-55 disabled:no-underline"
							>
								<ShoppingBasket className="h-4 w-4" aria-hidden />
								{t("pantry.addToBag", "ব্যাগে রাখুন")}
							</button>
							<Link
								href={ABSOLUTE_ROUTES.CART}
								className="ring-warm-focus text-base text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
							>
								{t("pantry.viewBag", "ব্যাগ দেখুন")}
							</Link>
						</div>
					</div>
				</div>

				{/* What is in the pack — a shelf of goods, closed by the shelf edge. */}
				<section className="mt-14 md:mt-20" aria-labelledby="pantry-combo-items">
					<h2
						id="pantry-combo-items"
						className="font-display text-2xl text-foreground md:text-4xl"
					>
						{t("bundle.whatsIncluded")}
					</h2>
					<div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
						{includedItems.map((item, i) => (
							<div key={`${item.product_id}-${i}`}>
								<div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
									<PantryImage
										src={item.thumbnail_image}
										alt={item.name}
										sizes="(min-width: 768px) 22vw, 45vw"
										className="object-cover"
									/>
								</div>
								<p className="mt-2 text-base leading-snug">{item.name}</p>
								<p className="text-base font-semibold tabular-nums text-muted-foreground">
									×{item.qty}
								</p>
							</div>
						))}
					</div>
					<div className="pn-shelf mt-4" aria-hidden="true" />
				</section>

				{trust.length > 0 && (
					<section className="mt-10">
						<ul className="pn-proof grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
							{trust.map(({ Icon, label }, i) => (
								<li
									key={`${label}-${i}`}
									className="flex items-start gap-3 px-0 py-3 text-base leading-snug sm:px-5 sm:py-0"
								>
									<Icon
										className="mt-0.5 h-5 w-5 shrink-0 text-primary"
										aria-hidden
									/>
									{label}
								</li>
							))}
						</ul>
					</section>
				)}

				{combo.body && (
					<section
						className="mt-14 max-w-[70ch] md:mt-20"
						aria-labelledby="pantry-combo-about"
					>
						<h2
							id="pantry-combo-about"
							className="font-display text-2xl text-foreground md:text-3xl"
						>
							{t("bundle.aboutOffer")}
						</h2>
						<div
							className="mt-3 text-base leading-relaxed text-muted-foreground [&_a]:underline [&>ol]:mb-3 [&>p]:mb-3 [&>ul]:mb-3"
							dangerouslySetInnerHTML={{
								__html: DOMPurify.sanitize(combo.body),
							}}
						/>
					</section>
				)}

				{combo.terms && (
					<section className="mt-10 max-w-[70ch]">
						<h2 className="font-display text-2xl text-foreground">
							{t("bundle.terms")}
						</h2>
						<p className="mt-2 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
							{combo.terms}
						</p>
					</section>
				)}

				{/* The repeated stone order block, carrying the price. */}
				<section className="mt-14 rounded-lg bg-muted p-5 md:mt-20 md:flex md:items-center md:justify-between md:gap-6 md:p-7">
					<div className="min-w-0">
						<p className="font-display text-2xl leading-tight md:text-3xl">
							{combo.title}
						</p>
						<p className="mt-1 text-2xl font-bold tabular-nums text-primary">
							<Price amount={selectedTier.price} />
						</p>
						{settings?.contact_phone && (
							<a
								href={`tel:${settings.contact_phone}`}
								className="ring-warm-focus mt-1 inline-flex min-h-[2.75rem] items-center gap-2 text-base font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
							>
								<Phone className="h-4 w-4" aria-hidden />
								{t("pantry.orderByPhone", "ফোনে অর্ডার করুন")}:{" "}
								<span className="tabular-nums">
									{settings.contact_phone}
								</span>
							</a>
						)}
					</div>
					{orderButton("mt-4 md:mt-0 md:w-auto md:shrink-0")}
				</section>
			</div>
		</main>
	);
}
