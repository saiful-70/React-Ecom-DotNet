"use client";

import "../classic.css";

import { useTranslation } from "react-i18next";
import { BadgeCheck, Check, Phone, ShoppingCart, Truck } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { useAtomValue } from "jotai";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import Price from "@/components/shared/Price";
import { ProductDeliveryInfo } from "@/components/product/product-details";
import { BundleUnitPicker } from "@/components/product/bundle/BundleUnitPicker";
import {
	pad2,
	useComboLanding,
	useOfferCountdown,
} from "@/components/product/bundle/use-combo-landing";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { cn } from "@/lib/utils/utils";
import type { ComboLayoutProps } from "@/templates/types";
import { ClassicImage } from "../shared/ClassicImage";

/**
 * The offer's own shopfront page.
 *
 * Same grammar as the product page — photograph beside the offer, every cost
 * printed before the vermilion order button, hairlines instead of boxes — with
 * the package swapped in for the single product: the tier list is the choice,
 * the contents are a plain list, and the saving is the loudest green on the
 * page.
 */
export function ClassicCombo({ combo }: ComboLayoutProps) {
	const { t } = useTranslation();
	const settings = useAtomValue(businessSettingsAtom);
	const {
		selectedTier,
		selectedTierId,
		selectTier,
		gallery,
		activeImage,
		setActiveImage,
		trust,
		includedItems,
		soldOut,
		addToCart,
		buyNow,
		axesFor,
		unitsFor,
		setAxisValue,
	} = useComboLanding(combo);
	const countdown = useOfferCountdown(combo.ends_at);

	if (!selectedTier) return null;

	const tierUnits = unitsFor(selectedTier);
	const discountPercent =
		selectedTier.compare_at_price > selectedTier.price
			? Math.round(
					((selectedTier.compare_at_price - selectedTier.price) /
						selectedTier.compare_at_price) *
						100
				)
			: 0;

	/** The order actions; reused in the closing band at the bottom of the scroll. */
	const orderActions = (compact = false) => (
		<div className="flex flex-wrap items-center gap-3">
			<button
				type="button"
				onClick={() => buyNow(selectedTier)}
				disabled={soldOut}
				className={cn(
					"ring-warm-focus inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-extrabold text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/95 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
					compact ? "flex-1 sm:flex-none" : "w-full sm:w-auto"
				)}
			>
				{soldOut
					? t("classic2.stockOut", "স্টক শেষ")
					: t("classic2.orderNowCta", "এখনই অর্ডার করুন")}
			</button>
			<button
				type="button"
				onClick={() => addToCart(selectedTier)}
				disabled={soldOut}
				className={cn(
					"ring-warm-focus inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border px-6 text-base font-bold transition-colors hover:bg-accent active:bg-accent disabled:cursor-not-allowed disabled:text-muted-foreground disabled:hover:bg-transparent",
					compact ? "flex-1 sm:flex-none" : "w-full sm:w-auto"
				)}
			>
				<ShoppingCart className="h-5 w-5" aria-hidden />
				{t("classic2.addToBag", "ব্যাগে রাখুন")}
			</button>
		</div>
	);

	return (
		<main className="pb-24 md:pb-0">
			<div className="container mx-auto pt-4 md:pt-6">
				<nav aria-label="Breadcrumb" className="mb-3 text-sm md:mb-6">
					<Link
						href="/"
						className="ring-warm-focus rounded-md text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
					>
						{t("classic2.home", "হোম")}
					</Link>
					<span className="mx-2 text-muted-foreground" aria-hidden>
						/
					</span>
					<span className="font-semibold">{combo.title}</span>
				</nav>

				<div className="grid gap-4 lg:grid-cols-2 lg:gap-14">
					{/* Photograph. Height-capped on a phone so the price still
					    lands inside the first viewport, exactly as the PDP. */}
					<div>
						<div className="relative mx-auto aspect-square w-full max-w-[46vh] overflow-hidden rounded-xl border border-border bg-muted lg:max-w-none">
							<ClassicImage
								src={gallery[activeImage] ?? combo.banner}
								alt={combo.title}
								fallbackText={combo.title}
								fill
								sizes="(min-width: 1024px) 45vw, 100vw"
								className="object-cover"
								priority
							/>
						</div>

						{gallery.length > 1 && (
							<div className="mx-auto mt-3 flex max-w-[46vh] gap-2 overflow-x-auto pb-1 lg:max-w-none">
								{gallery.map((src, i) => (
									<button
										key={`${src}-${i}`}
										type="button"
										onClick={() => setActiveImage(i)}
										aria-label={`${combo.title} ${i + 1}`}
										aria-pressed={i === activeImage}
										className={cn(
											"ring-warm-focus relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-muted transition-colors sm:h-16 sm:w-16",
											i === activeImage
												? "border-primary"
												: "border-border hover:border-muted-foreground"
										)}
									>
										<ClassicImage
											src={src}
											alt=""
											fallbackText={combo.title}
											hideFallbackLetter
											fill
											sizes="64px"
											className="object-cover"
										/>
									</button>
								))}
							</div>
						)}
					</div>

					{/* The offer. */}
					<div className="flex flex-col gap-4 md:gap-6">
						<div>
							<h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-balance sm:text-3xl md:text-4xl">
								{combo.title}
							</h1>
							{combo.badge && (
								<span className="mt-2 inline-block text-sm font-bold text-success">
									{combo.badge}
								</span>
							)}
							{combo.description && (
								<p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
									{combo.description}
								</p>
							)}
						</div>

						{combo.highlights?.length ? (
							<ul className="space-y-2 text-sm">
								{combo.highlights.map((highlight, i) => (
									<li key={i} className="flex items-start gap-2">
										<Check
											className="mt-0.5 h-4 w-4 shrink-0 text-success"
											aria-hidden
										/>
										{highlight}
									</li>
								))}
							</ul>
						) : null}

						{/* Price anchoring: current heavy, original struck, chip. */}
						<div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
							<span
								className={cn(
									"classic-price font-display text-3xl font-extrabold sm:text-4xl md:text-5xl",
									soldOut && "text-muted-foreground"
								)}
							>
								<Price amount={selectedTier.price} />
							</span>
							{selectedTier.compare_at_price > selectedTier.price && (
								<span className="classic-price text-lg text-muted-foreground line-through">
									<Price amount={selectedTier.compare_at_price} />
								</span>
							)}
							{discountPercent > 0 && (
								<span className="classic-price rounded-md bg-primary px-2 py-0.5 text-sm font-extrabold text-primary-foreground">
									−{discountPercent}%
								</span>
							)}
						</div>

						{selectedTier.savings > 0 && (
							<p className="flex items-center gap-1.5 text-base font-bold text-success">
								<BadgeCheck className="h-4 w-4 shrink-0" aria-hidden />
								{t("bundle.youSaveTotal")}{" "}
								<span className="classic-price">
									<Price amount={selectedTier.savings} />
								</span>
							</p>
						)}

						{/* Countdown. Ink figures on the white field: urgency is
						    real (it restates `ends_at`) but it is not a buy
						    action, so it never takes the vermilion. */}
						{countdown && (
							<div className="border-y border-border py-3">
								<p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
									{t("bundle.offerEndsIn")}
								</p>
								<div className="mt-1.5 flex items-baseline gap-1.5">
									{(
										[
											[countdown.days, "bundle.unitLabel_days"],
											[countdown.hours, "bundle.unitLabel_hours"],
											[
												countdown.minutes,
												"bundle.unitLabel_minutes",
											],
											[
												countdown.seconds,
												"bundle.unitLabel_seconds",
											],
										] as const
									).map(([value, labelKey], i) => (
										<span
											key={labelKey}
											className="flex items-baseline gap-1.5"
										>
											{i > 0 && (
												<span
													className="text-lg text-border"
													aria-hidden
												>
													:
												</span>
											)}
											<span className="classic-price font-display text-2xl font-extrabold">
												{pad2(value)}
											</span>
											<span className="text-xs text-muted-foreground">
												{t(labelKey)}
											</span>
										</span>
									))}
								</div>
							</div>
						)}

						{/* Tier choice: one hairline-separated list, radio
						    semantics, the selected row carried by the price and
						    a vermilion mark rather than a box inside a box. */}
						{combo.tiers.length > 1 && (
							<div>
								<h2 className="mb-2 font-display text-lg font-extrabold tracking-tight">
									{t("bundle.selectCombo")}
								</h2>
								<ul
									role="radiogroup"
									aria-label={t("bundle.selectCombo")}
									className="divide-y divide-border border-y border-border"
								>
									{combo.tiers.map((tier) => {
										const selected = tier.id === selectedTierId;
										const unavailable = tier.is_available === false;
										return (
											<li key={tier.id}>
												<button
													type="button"
													role="radio"
													aria-checked={selected}
													disabled={unavailable}
													onClick={() => selectTier(tier.id)}
													className="ring-warm-focus flex min-h-14 w-full items-center gap-3 py-3 text-left transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:hover:bg-transparent"
												>
													<span
														aria-hidden
														className={cn(
															"grid h-5 w-5 shrink-0 place-items-center rounded-full border",
															selected
																? "border-primary"
																: "border-border"
														)}
													>
														{selected && (
															<span className="h-2.5 w-2.5 rounded-full bg-primary" />
														)}
													</span>
													<span className="min-w-0 flex-1">
														<span
															className={cn(
																"block text-sm font-bold sm:text-base",
																unavailable &&
																	"text-muted-foreground"
															)}
														>
															{tier.name}
														</span>
														{unavailable ? (
															<span className="mt-0.5 block text-xs text-muted-foreground">
																{tier.unavailable_reason ||
																	t(
																		"classic2.stockOut",
																		"স্টক শেষ"
																	)}
															</span>
														) : (
															tier.savings > 0 && (
																<span className="mt-0.5 block text-xs font-bold text-success">
																	{t("bundle.youSave")}{" "}
																	<span className="classic-price">
																		<Price
																			amount={
																				tier.savings
																			}
																		/>
																	</span>
																</span>
															)
														)}
													</span>
													<span className="flex shrink-0 flex-col items-end">
														<span
															className={cn(
																"classic-price text-lg font-extrabold",
																unavailable &&
																	"text-muted-foreground"
															)}
														>
															<Price amount={tier.price} />
														</span>
														{tier.compare_at_price >
															tier.price && (
															<span className="classic-price text-xs text-muted-foreground line-through">
																<Price
																	amount={
																		tier.compare_at_price
																	}
																/>
															</span>
														)}
													</span>
												</button>
											</li>
										);
									})}
								</ul>
							</div>
						)}

						{/* Per-unit choices for the selected package. */}
						{tierUnits.hasPicker && (
							<div>
								<h2 className="mb-2 font-display text-lg font-extrabold tracking-tight">
									{t("classic2.comboChooseUnits", "প্রতিটি পণ্য বাছুন")}
								</h2>
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

						{/* Delivery fees printed BEFORE the order button. */}
						<ProductDeliveryInfo />

						<ul className="space-y-2.5 text-sm">
							<li className="flex items-center gap-2 font-bold text-success">
								<BadgeCheck className="h-4 w-4 shrink-0" aria-hidden />
								{t(
									"classic2.codLong",
									"পণ্য হাতে পেয়ে টাকা দিন — ক্যাশ অন ডেলিভারি"
								)}
							</li>
							<li className="flex items-center gap-2 text-success">
								<Truck className="h-4 w-4 shrink-0" aria-hidden />
								{t(
									"classic2.deliveryPromise",
									"ঢাকায় ২৪–৪৮ ঘণ্টা, ঢাকার বাইরে ২–৩ দিন"
								)}
							</li>
							<li className="flex items-center gap-2 text-muted-foreground">
								<Phone className="h-4 w-4 shrink-0" aria-hidden />
								{t(
									"classic2.confirmCall",
									"অর্ডার কনফার্ম করতে আমরা ফোনে কল করব"
								)}
							</li>
						</ul>

						{orderActions()}
					</div>
				</div>
			</div>

			{/* What the package holds, on the grey shelf band. */}
			<div className="classic-band mt-12 py-10 md:mt-16 md:py-14">
				<div className="container mx-auto">
					<h2 className="mb-5 font-display text-2xl font-extrabold tracking-tight md:mb-6 md:text-3xl">
						{t("bundle.whatsIncluded")}
					</h2>
					<ul className="divide-y divide-border border-y border-border bg-background">
						{includedItems.map((item, i) => (
							<li
								key={`${item.product_id}-${i}`}
								className="flex min-h-14 items-center gap-3 px-3 py-3 sm:gap-4 sm:py-4"
							>
								<span className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-20 sm:w-20">
									<ClassicImage
										src={item.thumbnail_image}
										alt={item.name}
										fallbackText={item.name}
										fill
										sizes="80px"
										className="object-cover"
									/>
								</span>
								<span className="min-w-0 flex-1 text-sm font-semibold sm:text-base">
									{item.name}
								</span>
								<span className="classic-price shrink-0 text-base font-extrabold">
									×{item.qty}
								</span>
							</li>
						))}
					</ul>

					{trust.length > 0 && (
						<ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 md:flex md:flex-wrap md:gap-x-8">
							{trust.map(({ Icon, label }, i) => (
								<li
									key={`${label}-${i}`}
									className="flex items-center gap-2 text-sm font-semibold"
								>
									<Icon
										className="h-4 w-4 shrink-0 text-success"
										aria-hidden
									/>
									{label}
								</li>
							))}
						</ul>
					)}
				</div>
			</div>

			{combo.body && (
				<section className="container mx-auto py-10 md:py-12">
					<h2 className="mb-4 font-display text-2xl font-extrabold tracking-tight md:text-3xl">
						{t("bundle.aboutOffer")}
					</h2>
					<div
						className="prose prose-sm max-w-[70ch] text-sm leading-relaxed text-muted-foreground sm:prose [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm [&>ol]:mb-2 [&>p]:mb-2 [&>ul]:mb-2"
						dangerouslySetInnerHTML={{
							__html: DOMPurify.sanitize(combo.body),
						}}
					/>
				</section>
			)}

			{/* The order action, repeated at the bottom of the scroll. */}
			<div className="container mx-auto py-10 md:py-12">
				<div className="rounded-xl border border-border p-4 md:p-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="min-w-0">
							<p className="truncate font-display text-lg font-extrabold">
								{combo.title}
							</p>
							<p className="flex flex-wrap items-baseline gap-x-2">
								<span
									className={cn(
										"classic-price text-2xl font-extrabold",
										soldOut && "text-muted-foreground"
									)}
								>
									<Price amount={selectedTier.price} />
								</span>
								{selectedTier.compare_at_price >
									selectedTier.price && (
									<span className="classic-price text-sm text-muted-foreground line-through">
										<Price
											amount={selectedTier.compare_at_price}
										/>
									</span>
								)}
							</p>
							{settings?.contact_phone && (
								<a
									href={`tel:${settings.contact_phone}`}
									className="ring-warm-focus mt-1 inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-bold text-primary underline-offset-4 hover:underline"
								>
									<Phone className="h-4 w-4" aria-hidden />
									{t("classic2.callToOrder", "ফোনে অর্ডার")}:{" "}
									<span className="classic-price">
										{settings.contact_phone}
									</span>
								</a>
							)}
						</div>
						<div className="shrink-0">{orderActions(true)}</div>
					</div>
					<p className="mt-3 text-xs text-muted-foreground">
						{t(
							"classic2.confirmCall",
							"অর্ডার কনফার্ম করতে আমরা ফোনে কল করব"
						)}
					</p>
				</div>
			</div>

			{combo.terms && (
				<section className="container mx-auto pb-14">
					<h2 className="mb-2 text-sm font-bold text-muted-foreground">
						{t("bundle.terms")}
					</h2>
					<p className="max-w-[70ch] whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
						{combo.terms}
					</p>
				</section>
			)}
		</main>
	);
}
