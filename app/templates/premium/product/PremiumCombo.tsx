"use client";

import { useTranslation } from "react-i18next";
import DOMPurify from "isomorphic-dompurify";
import Price from "@/components/shared/Price";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/shared/ui/accordion";
import { BundleUnitPicker } from "@/components/product/bundle/BundleUnitPicker";
import { useComboLanding } from "@/components/product/bundle/use-combo-landing";
import { INTL_SHIPPING } from "@/lib/constants/delivery";
import { cn } from "@/lib/utils/utils";
import type { ComboLayoutProps } from "@/templates/types";
import { estimatedDeliveryDate } from "../lib";
import { PremiumGallery } from "./PremiumGallery";
import { PremiumImage } from "./PremiumImage";
import "../premium.css";

/**
 * The set, presented as one boxed label.
 *
 * Specimen photography on the left, a single label-stock panel on the right
 * carrying the whole purchase: the set's own LOT line, the packages as
 * physically pressed keys, the shipping terms printed on the label, and the
 * gold seal-press action.
 *
 * This world prints no countdown. `ends_at` is real data, so it is honoured —
 * but as a dated provenance line ("Available until Friday, 5 September")
 * rather than a ticking clock, which would drag the deal-wall grammar this
 * template exists to refuse into the label.
 */
export function PremiumCombo({ combo }: ComboLayoutProps) {
	const { t, i18n } = useTranslation();
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
	const estimated = estimatedDeliveryDate(i18n.language);
	const setLot = `LOT ${String(combo.id).padStart(4, "0")}`;
	const unitCount = includedItems.reduce((sum, item) => sum + item.qty, 0);

	/** The offer's closing date, printed rather than counted down. */
	const closesOn = (() => {
		if (!combo.ends_at) return null;
		const date = new Date(combo.ends_at);
		if (Number.isNaN(date.getTime())) return null;
		try {
			return new Intl.DateTimeFormat(
				i18n.language === "bn" ? "bn-BD" : "en-GB",
				{ weekday: "long", day: "numeric", month: "long" }
			).format(date);
		} catch {
			return date.toDateString();
		}
	})();

	return (
		<main className="bg-background pb-24 text-foreground lg:pb-0">
			<div className="container mx-auto py-8 lg:py-12">
				<div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
					{/* Specimen. */}
					<div className="lg:col-span-7">
						<PremiumGallery
							productName={combo.title}
							thumbnailImage={gallery[0] ?? combo.banner}
							galleryImages={gallery.slice(1)}
						/>

						{/* The contents, numbered like a spec sheet. */}
						<ol
							className="mt-6 space-y-2"
							aria-label={t("bundle.whatsIncluded")}
						>
							{includedItems.map((item, index) => (
								<li
									key={`${item.product_id}-${index}`}
									className="flex items-center gap-3 border-b border-border/30 pb-2 text-sm"
								>
									<span className="w-5 shrink-0 tabular-nums text-muted-foreground">
										{index + 1}
									</span>
									<span className="relative block h-12 w-12 shrink-0 overflow-hidden">
										<PremiumImage
											src={item.thumbnail_image}
											alt={item.name}
											sizes="48px"
											className="object-cover"
											plateClassName="text-[10px]"
										/>
									</span>
									<span className="min-w-0 flex-1">{item.name}</span>
									<span className="shrink-0 tabular-nums text-muted-foreground">
										×{item.qty}
									</span>
								</li>
							))}
						</ol>
					</div>

					{/* The label. */}
					<div className="lg:col-span-5">
						<div className="premium-panel-rise bg-card p-6 text-card-foreground shadow-warm-lg md:p-8 lg:sticky lg:top-6">
							<h1 className="font-display text-3xl leading-[1.05] tracking-tight md:text-4xl">
								{combo.title}
							</h1>
							<p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-card-foreground/70">
								{setLot}
								{unitCount > 0 &&
									` — ${unitCount} ${t("premium.setPieces", "pieces")}`}
							</p>

							{combo.description && (
								<p className="mt-4 text-sm leading-relaxed text-card-foreground/80">
									{combo.description}
								</p>
							)}

							<div className="mt-5 flex items-baseline gap-3">
								<span
									className={cn(
										"text-2xl tabular-nums",
										soldOut && "text-card-foreground/50"
									)}
								>
									<Price amount={selectedTier.price} />
								</span>
								{selectedTier.compare_at_price > selectedTier.price && (
									<span className="text-sm text-card-foreground/60 line-through tabular-nums">
										<Price amount={selectedTier.compare_at_price} />
									</span>
								)}
								{selectedTier.savings > 0 && (
									<span className="text-sm tabular-nums text-accent">
										{t("bundle.youSave")}{" "}
										<Price amount={selectedTier.savings} />
									</span>
								)}
							</div>

							{combo.highlights?.length ? (
								<ul className="mt-4 space-y-1.5 text-sm text-card-foreground/80">
									{combo.highlights.map((highlight, i) => (
										<li key={i} className="flex gap-2">
											<span
												aria-hidden="true"
												className="text-card-foreground/40"
											>
												—
											</span>
											{highlight}
										</li>
									))}
								</ul>
							) : null}

							{/* Packages as pressed keys. */}
							{combo.tiers.length > 1 && (
								<div className="mt-6">
									<p className="text-[11px] uppercase tracking-[0.16em] text-card-foreground/70">
										{t("bundle.selectCombo")}
									</p>
									<div
										role="radiogroup"
										aria-label={t("bundle.selectCombo")}
										className="mt-2 space-y-2"
									>
										{combo.tiers.map((tier) => {
											const selected = tier.id === selectedTierId;
											const unavailable =
												tier.is_available === false;
											return (
												<button
													key={tier.id}
													type="button"
													role="radio"
													aria-checked={selected}
													data-selected={selected}
													disabled={unavailable}
													onClick={() => selectTier(tier.id)}
													className="premium-key ring-warm-focus flex min-h-12 w-full items-center gap-3 px-3 py-2 text-left"
												>
													<span className="min-w-0 flex-1 text-sm">
														{tier.name}
														{unavailable && (
															<span className="mt-0.5 block text-[11px] uppercase tracking-[0.16em] text-accent">
																{tier.unavailable_reason ||
																	t(
																		"premium.soldOut",
																		"Sold out"
																	)}
															</span>
														)}
													</span>
													<span className="shrink-0 text-sm tabular-nums">
														<Price amount={tier.price} />
													</span>
												</button>
											);
										})}
									</div>
								</div>
							)}

							{tierUnits.hasPicker && (
								<div className="mt-6">
									<p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-card-foreground/70">
										{t("premium.chooseEach", "Choose each piece")}
									</p>
									<BundleUnitPicker
										slots={tierUnits.slots}
										selections={tierUnits.selections}
										issues={tierUnits.issues}
										axesFor={axesFor}
										onAxisChange={(
											slotKey,
											item,
											optionName,
											value
										) =>
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

							{/* Terms printed on the label before the action. */}
							<div className="mt-6 space-y-1.5 border-t border-card-foreground/15 pt-4 text-sm text-card-foreground/80">
								<p className="tabular-nums">
									{t("premium.flatShipping", "Shipping")}{" "}
									<Price amount={INTL_SHIPPING.flat} /> —{" "}
									{t("premium.freeOver", "free over")}{" "}
									<Price amount={INTL_SHIPPING.freeOver} />
								</p>
								<p suppressHydrationWarning>
									{t("premium.estimated", "Estimated")}: {estimated}
								</p>
								{closesOn && (
									<p suppressHydrationWarning>
										{t("premium.availableUntil", "Available until")}:{" "}
										{closesOn}
									</p>
								)}
							</div>

							<button
								type="button"
								onClick={() => addToCart(selectedTier)}
								disabled={soldOut}
								className="premium-seal-press ring-warm-focus mt-5 h-12 w-full bg-primary text-sm font-medium uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{soldOut
									? t("premium.soldOut", "Sold out")
									: t("bundle.addComboToCart")}
							</button>
							{!soldOut && (
								<button
									type="button"
									onClick={() => buyNow(selectedTier)}
									className="ring-warm-focus mt-3 w-full text-center text-sm text-card-foreground/80 underline decoration-card-foreground/40 underline-offset-4 transition-colors hover:text-card-foreground"
								>
									{t("premium.buyNow", "Buy now — express checkout")}
								</button>
							)}

							{trust.length > 0 && (
								<ul className="mt-6 space-y-1.5 border-t border-card-foreground/15 pt-4 text-[11px] uppercase tracking-[0.16em] text-card-foreground/70">
									{trust.map(({ Icon, label }, i) => (
										<li
											key={`${label}-${i}`}
											className="flex items-center gap-2"
										>
											<Icon
												className="h-3.5 w-3.5 shrink-0"
												aria-hidden="true"
											/>
											{label}
										</li>
									))}
								</ul>
							)}
						</div>
					</div>
				</div>

				{(combo.body || combo.terms) && (
					<div className="mx-auto mt-16 max-w-3xl lg:mt-24">
						<Accordion type="single" collapsible className="w-full">
							{combo.body && (
								<AccordionItem
									value="about"
									className="border-border/40"
								>
									<AccordionTrigger className="ring-warm-focus font-display text-lg tracking-tight hover:no-underline">
										{t("bundle.aboutOffer")}
									</AccordionTrigger>
									<AccordionContent>
										<div
											className="max-w-[70ch] text-sm leading-relaxed text-muted-foreground [&_a]:underline"
											dangerouslySetInnerHTML={{
												__html: DOMPurify.sanitize(combo.body),
											}}
										/>
									</AccordionContent>
								</AccordionItem>
							)}
							{combo.terms && (
								<AccordionItem
									value="terms"
									className="border-border/40"
								>
									<AccordionTrigger className="ring-warm-focus font-display text-lg tracking-tight hover:no-underline">
										{t("bundle.terms")}
									</AccordionTrigger>
									<AccordionContent>
										<p className="max-w-[70ch] whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
											{combo.terms}
										</p>
									</AccordionContent>
								</AccordionItem>
							)}
						</Accordion>
					</div>
				)}
			</div>
		</main>
	);
}
