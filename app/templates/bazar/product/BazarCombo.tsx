"use client";

import "../bazar.css";

import { useTranslation } from "react-i18next";
import { useAtomValue } from "jotai";
import { Check, PhoneCall } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import Price from "@/components/shared/Price";
import { BundleUnitPicker } from "@/components/product/bundle/BundleUnitPicker";
import {
	pad2,
	useComboLanding,
	useOfferCountdown,
} from "@/components/product/bundle/use-combo-landing";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { cn } from "@/lib/utils/utils";
import type { ComboLayoutProps } from "@/templates/types";
import { BazarImage } from "../BazarImage";
import { BazarGallery } from "./BazarGallery";
import { BazarDeliveryChart } from "./BazarDeliveryChart";
import { BazarSectionBand } from "../home/BazarSectionBand";

/**
 * The combo as a tariff sheet.
 *
 * The counter's own grammar applied to a package: the packages are chart rows
 * you press like keys, the contents are printed as a numbered chart, the fees
 * are posted above the ask, and the order block is one keypad. The countdown
 * is board-black digits, because on this counter a running number is a
 * physical display, not a coloured alarm.
 */
export function BazarCombo({ combo }: ComboLayoutProps) {
	const { t } = useTranslation();
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
	const countdown = useOfferCountdown(combo.ends_at);

	if (!selectedTier) return null;

	const tierUnits = unitsFor(selectedTier);

	/* The order keys — rendered twice (purchase column + page bottom). */
	const orderKeys = (
		<div className="grid grid-cols-2 gap-2">
			<button
				type="button"
				onClick={() => addToCart(selectedTier)}
				disabled={soldOut}
				className="bz-key ring-warm-focus min-h-14 rounded-lg bg-secondary px-4 text-sm font-bold text-secondary-foreground shadow-warm-sm disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
			>
				{t("bundle.addComboToCart")}
			</button>
			<button
				type="button"
				onClick={() => buyNow(selectedTier)}
				disabled={soldOut}
				className="bz-key ring-warm-focus min-h-14 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground shadow-warm disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
			>
				{soldOut ? t("bazar.stockSoldOut", "স্টক শেষ") : t("bazar.buyNow")}
			</button>
		</div>
	);

	return (
		<main className="container mx-auto py-6">
			{/* Breadcrumb — a chart line closed by the board rule. */}
			<nav
				className="mb-6 border-b-[3px] border-secondary pb-3 text-sm"
				aria-label="Breadcrumb"
			>
				<Link
					href="/"
					className="ring-warm-focus rounded-md font-bold underline-offset-4 hover:text-primary hover:underline"
				>
					{t("bazar.home")}
				</Link>
				<span className="mx-2 text-muted-foreground" aria-hidden="true">
					/
				</span>
				<span className="line-clamp-1 inline text-muted-foreground">
					{combo.title}
				</span>
			</nav>

			<div className="grid gap-8 lg:grid-cols-2">
				{/* `gallery` already collapses to `[banner]` when the backend
				    omits images[], so the well never repeats the same plate. */}
				<BazarGallery
					productName={combo.title}
					thumbnailImage={gallery[0] ?? combo.banner}
					galleryImages={gallery.slice(1)}
				/>

				<div className="space-y-5">
					<div>
						<h1 className="text-balance font-display text-2xl font-bold leading-tight md:text-3xl">
							{combo.title}
						</h1>
						<p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
							<span
								className={cn(
									"font-bold",
									soldOut ? "text-destructive" : "text-success"
								)}
							>
								{soldOut
									? t("bazar.stockSoldOut", "স্টক শেষ")
									: t("bazar.stockIn")}
							</span>
							{combo.badge && (
								<span className="text-muted-foreground">
									{combo.badge}
								</span>
							)}
						</p>
						{combo.description && (
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
								{combo.description}
							</p>
						)}
					</div>

					{/* The price, chart-entry style: heavy current, struck original. */}
					<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-y border-dashed border-border py-3">
						<span className="bz-num font-display text-4xl font-bold text-primary">
							<Price amount={selectedTier.price} />
						</span>
						{selectedTier.compare_at_price > selectedTier.price && (
							<span className="bz-num text-lg text-muted-foreground line-through">
								<Price amount={selectedTier.compare_at_price} />
							</span>
						)}
						{selectedTier.savings > 0 && (
							<span className="bz-num rounded-md bg-accent px-2.5 py-1 text-sm font-bold text-accent-foreground">
								{t("bazar.save")}{" "}
								<Price amount={selectedTier.savings} />
							</span>
						)}
					</div>

					{combo.highlights?.length ? (
						<ul className="space-y-2 text-sm">
							{combo.highlights.map((highlight, i) => (
								<li key={i} className="flex items-start gap-2">
									<Check
										className="mt-0.5 h-4 w-4 shrink-0 text-primary"
										aria-hidden="true"
									/>
									{highlight}
								</li>
							))}
						</ul>
					) : null}

					{/* The counter clock: board-black cells, tabular digits. */}
					{countdown && (
						<div className="flex flex-wrap items-center gap-3 border-y border-dashed border-border py-3">
							<span className="text-sm font-bold">
								{t("bundle.offerEndsIn")}
							</span>
							<span className="flex items-center gap-1.5">
								{(
									[
										[countdown.days, "bundle.unitLabel_days"],
										[countdown.hours, "bundle.unitLabel_hours"],
										[countdown.minutes, "bundle.unitLabel_minutes"],
										[countdown.seconds, "bundle.unitLabel_seconds"],
									] as const
								).map(([value, labelKey]) => (
									<span
										key={labelKey}
										className="flex flex-col items-center"
									>
										<span className="bz-num grid min-w-10 place-items-center rounded-lg bg-secondary px-2 py-1 font-display text-xl font-bold text-secondary-foreground">
											{pad2(value)}
										</span>
										<span className="mt-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
											{t(labelKey)}
										</span>
									</span>
								))}
							</span>
						</div>
					)}

					{/* The packages, as tariff rows you press. */}
					{combo.tiers.length > 1 && (
						<div className="space-y-2">
							<span className="text-sm font-bold">
								{t("bundle.selectCombo")}
							</span>
							<div
								role="radiogroup"
								aria-label={t("bundle.selectCombo")}
								className="space-y-2"
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
												"bz-key ring-warm-focus flex min-h-14 w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left shadow-warm-sm",
												selected
													? "border-primary bg-primary/5"
													: "border-border bg-card",
												unavailable &&
													"cursor-not-allowed border-border bg-muted text-muted-foreground shadow-none"
											)}
										>
											<span
												aria-hidden="true"
												className={cn(
													"h-8 w-1.5 shrink-0 rounded-sm",
													selected
														? "bg-primary"
														: "bg-border"
												)}
											/>
											<span className="min-w-0 flex-1">
												<span className="block text-sm font-bold">
													{tier.name}
												</span>
												{unavailable ? (
													<span className="mt-0.5 block text-xs">
														{tier.unavailable_reason ||
															t(
																"bazar.stockSoldOut",
																"স্টক শেষ"
															)}
													</span>
												) : (
													tier.savings > 0 && (
														<span className="bz-num mt-0.5 block text-xs font-bold text-accent">
															{t("bazar.save")}{" "}
															<Price
																amount={tier.savings}
															/>
														</span>
													)
												)}
											</span>
											<span className="flex shrink-0 flex-col items-end">
												<span
													className={cn(
														"bz-num font-display text-lg font-bold",
														unavailable
															? "text-muted-foreground"
															: "text-primary"
													)}
												>
													<Price amount={tier.price} />
												</span>
												{tier.compare_at_price > tier.price && (
													<span className="bz-num text-xs text-muted-foreground line-through">
														<Price
															amount={
																tier.compare_at_price
															}
														/>
													</span>
												)}
											</span>
										</button>
									);
								})}
							</div>
						</div>
					)}

					{tierUnits.hasPicker && (
						<div className="space-y-2 rounded-lg border border-border bg-card p-3 shadow-warm-sm">
							<span className="text-sm font-bold">
								{t("bazar.comboChooseUnits", "প্রতিটি পণ্য বাছুন")}
							</span>
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

					{/* Fees before the ask — the counter never surprises. */}
					<BazarDeliveryChart />

					{/* The order strip — one keypad block. */}
					<div className="space-y-3 rounded-lg border border-border bg-card p-3 shadow-warm-sm">
						{orderKeys}
						{settings?.contact_phone && (
							<a
								href={`tel:${settings.contact_phone}`}
								className="bz-key ring-warm-focus inline-flex min-h-12 items-center gap-2 rounded-lg border border-primary/50 bg-card px-4 text-sm font-bold text-primary shadow-warm-sm"
							>
								<PhoneCall className="h-4 w-4" aria-hidden="true" />
								{t("bazar.orderByPhone", "ফোনে অর্ডার করুন")}
							</a>
						)}
					</div>

					{trust.length > 0 && (
						<ul className="bz-chart-divide border-t border-dashed border-border pt-3 text-sm">
							{trust.map(({ Icon, label }, i) => (
								<li
									key={`${label}-${i}`}
									className="flex items-center gap-2 py-1.5 font-semibold"
								>
									<Icon
										className="h-4 w-4 shrink-0 text-primary"
										aria-hidden="true"
									/>
									{label}
								</li>
							))}
						</ul>
					)}
				</div>
			</div>

			{/* What the package holds — printed as a chart. */}
			<section className="mt-12">
				<BazarSectionBand titleKey="bundle.whatsIncluded" />
				<ul className="bz-chart-divide rounded-lg border border-border bg-card">
					{includedItems.map((item, i) => (
						<li
							key={`${item.product_id}-${i}`}
							className="flex min-h-14 items-center gap-3 px-3 py-2.5"
						>
							<BazarImage
								src={item.thumbnail_image}
								alt={item.name}
								fallbackLabel={item.name}
								width={56}
								height={56}
								sizes="56px"
								className="h-14 w-14 shrink-0 rounded-lg object-cover"
								plateClassName="h-14 w-14 shrink-0 rounded-lg text-xl"
							/>
							<span className="min-w-0 flex-1 text-sm font-semibold">
								{item.name}
							</span>
							<span className="bz-num shrink-0 font-display text-base font-bold">
								×{item.qty}
							</span>
						</li>
					))}
				</ul>
			</section>

			{combo.body && (
				<section className="mt-12">
					<BazarSectionBand titleKey="bundle.aboutOffer" />
					<div
						className="prose prose-sm max-w-[70ch] text-sm leading-relaxed text-muted-foreground [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm [&>ol]:mb-2 [&>p]:mb-2 [&>ul]:mb-2"
						dangerouslySetInnerHTML={{
							__html: DOMPurify.sanitize(combo.body),
						}}
					/>
				</section>
			)}

			{/* The order keys again — the thumb ends here. */}
			<div className="mx-auto mt-10 max-w-xl space-y-2 border-t-[3px] border-secondary pt-6">
				<p className="text-center text-sm font-semibold text-muted-foreground">
					{t("bazar.confirmCallNote", "অর্ডার কনফার্ম করতে আমরা ফোনে কল করব")}
				</p>
				{orderKeys}
			</div>

			{combo.terms && (
				<section className="mt-10">
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
