"use client";

import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import Price from "@/components/shared/Price";
import { BundleUnitPicker } from "@/components/product/bundle/BundleUnitPicker";
import {
	pad2,
	useComboLanding,
	useOfferCountdown,
} from "@/components/product/bundle/use-combo-landing";
import { cn } from "@/lib/utils/utils";
import type { ComboLayoutProps } from "@/templates/types";
import { itemNo } from "../_data/catalogue";
import { GlobalSectionTitle } from "../home/GlobalSectionTitle";
import { CatalogueImage } from "./CatalogueImage";
import { GlobalImageGallery } from "./GlobalImageGallery";
import { GlobalDeliveryInfo } from "./GlobalDeliveryInfo";
import "../global.css";

/**
 * A set entry in the catalogue.
 *
 * The page reads as a printed spread: the set carries its own number, the
 * packages are index rows on hairlines, the contents are a numbered list of
 * plates, and the delivery course is printed above the order actions. Sale
 * red stays where the catalogue allows it — on the discount figures and
 * nowhere else, so the closing date prints in ink like every other fact.
 */
export function GlobalCombo({ combo }: ComboLayoutProps) {
	const { t } = useTranslation();
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

	return (
		<main className="container mx-auto pb-16 pt-6">
			<nav
				className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground"
				aria-label="Breadcrumb"
			>
				<Link
					href="/"
					className="ring-warm-focus rounded-sm hover:text-foreground hover:underline"
				>
					{t("global.nav.home")}
				</Link>
				<ChevronRight className="h-4 w-4" aria-hidden="true" />
				<span className="line-clamp-1 font-medium text-foreground">
					{combo.title}
				</span>
			</nav>

			<div className="grid gap-8 border-y border-border py-6 md:py-8 lg:grid-cols-2 lg:gap-12">
				<GlobalImageGallery
					productId={combo.id}
					productName={combo.title}
					thumbnailImage={gallery[0] ?? combo.banner}
					galleryImages={gallery.slice(1)}
				/>

				<div className="space-y-5">
					{/* The set's printed identity. */}
					<div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs uppercase tracking-[0.08em] text-muted-foreground">
						<span className="tabular-nums">
							{t("global.combo.setNo", "Set No.")} {itemNo(combo.id)}
						</span>
						{combo.badge && <span>{combo.badge}</span>}
					</div>

					<h1 className="font-display text-3xl font-black leading-tight tracking-tight text-balance md:text-4xl">
						{combo.title}
					</h1>

					{combo.description && (
						<p className="max-w-[65ch] text-sm leading-relaxed text-muted-foreground">
							{combo.description}
						</p>
					)}

					<div className="space-y-1.5 border-b border-border pb-4">
						<div className="flex flex-wrap items-baseline gap-3">
							<span
								className={cn(
									"text-3xl font-black tabular-nums",
									soldOut && "text-muted-foreground"
								)}
							>
								<Price amount={selectedTier.price} />
							</span>
							{selectedTier.compare_at_price > selectedTier.price && (
								<span className="text-muted-foreground line-through tabular-nums">
									<Price amount={selectedTier.compare_at_price} />
								</span>
							)}
							{selectedTier.savings > 0 && (
								<span className="text-sm font-black tabular-nums text-accent">
									{t("bundle.youSave")}{" "}
									<Price amount={selectedTier.savings} />
								</span>
							)}
						</div>
						{combo.highlights?.length ? (
							<ul className="list-inside list-disc text-sm text-muted-foreground">
								{combo.highlights.map((highlight, i) => (
									<li key={i}>{highlight}</li>
								))}
							</ul>
						) : null}
					</div>

					{/* The closing date, printed as a course line — ink, never
					    the sale red, and only when `ends_at` is real. */}
					{countdown && (
						<p className="border-b border-border pb-3 text-sm">
							<span className="uppercase tracking-[0.08em] text-muted-foreground">
								{t("bundle.offerEndsIn")}
							</span>{" "}
							<span className="font-semibold tabular-nums">
								{countdown.days > 0 &&
									`${countdown.days} ${t("bundle.unitLabel_days")} · `}
								{pad2(countdown.hours)}:{pad2(countdown.minutes)}:
								{pad2(countdown.seconds)}
							</span>
						</p>
					)}

					{/* Packages as index rows. */}
					{combo.tiers.length > 1 && (
						<div>
							<h2 className="mb-2 text-xs font-black uppercase tracking-[0.08em]">
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
												className="ring-warm-focus flex min-h-14 w-full items-center gap-3 py-3 text-left transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:hover:bg-transparent"
											>
												<span
													aria-hidden="true"
													className={cn(
														"grid h-4 w-4 shrink-0 place-items-center rounded-full border",
														selected
															? "border-primary"
															: "border-border"
													)}
												>
													{selected && (
														<span className="h-2 w-2 rounded-full bg-primary" />
													)}
												</span>
												<span className="min-w-0 flex-1">
													<span
														className={cn(
															"block text-sm font-semibold",
															unavailable &&
																"text-muted-foreground"
														)}
													>
														{tier.name}
													</span>
													{unavailable && (
														<span className="mt-0.5 block text-xs text-muted-foreground">
															{tier.unavailable_reason ||
																t("global.stockOut")}
														</span>
													)}
												</span>
												<span className="flex shrink-0 items-baseline gap-2">
													{tier.savings > 0 && (
														<span className="text-xs font-black tabular-nums text-accent">
															−<Price
																amount={tier.savings}
															/>
														</span>
													)}
													<span
														className={cn(
															"text-base font-black tabular-nums",
															unavailable &&
																"text-muted-foreground"
														)}
													>
														<Price amount={tier.price} />
													</span>
												</span>
											</button>
										</li>
									);
								})}
							</ul>
						</div>
					)}

					{tierUnits.hasPicker && (
						<div>
							<h2 className="mb-2 text-xs font-black uppercase tracking-[0.08em]">
								{t("global.combo.chooseUnits", "Choose each item")}
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

					{/* The delivery course, printed before the order actions. */}
					<GlobalDeliveryInfo />

					<div className="flex flex-wrap items-center gap-3">
						<button
							type="button"
							onClick={() => buyNow(selectedTier)}
							disabled={soldOut}
							className="ring-warm-focus rounded-sm bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
						>
							{soldOut
								? t("global.stockOut")
								: t("global.buyNow")}
						</button>
						<button
							type="button"
							onClick={() => addToCart(selectedTier)}
							disabled={soldOut}
							className="ring-warm-focus rounded-sm border border-primary px-8 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent"
						>
							{t("bundle.addComboToCart")}
						</button>
					</div>

					{trust.length > 0 && (
						<ul className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-3 text-xs uppercase tracking-[0.08em] text-muted-foreground">
							{trust.map(({ Icon, label }, i) => (
								<li
									key={`${label}-${i}`}
									className="flex items-center gap-1.5"
								>
									<Icon className="h-3.5 w-3.5" aria-hidden="true" />
									{label}
								</li>
							))}
						</ul>
					)}
				</div>
			</div>

			{/* The contents, as a numbered plate list — the numeral is the
			    catalogue's own ordering, so it carries information. */}
			<section className="mt-10">
				<GlobalSectionTitle title={t("bundle.whatsIncluded")} />
				<ul className="divide-y divide-border border-y border-border">
					{includedItems.map((item, i) => (
						<li
							key={`${item.product_id}-${i}`}
							className="flex items-center gap-4 py-3"
						>
							<span
								className="w-6 shrink-0 text-right text-[11px] font-black tabular-nums text-muted-foreground"
								aria-hidden="true"
							>
								{pad2(i + 1)}
							</span>
							<CatalogueImage
								src={item.thumbnail_image}
								alt={item.name}
								itemId={item.product_id}
								width={64}
								height={64}
								sizes="64px"
								className="h-16 w-16 shrink-0 border border-border object-cover"
								fallbackClassName="h-16 w-16 shrink-0"
							/>
							<span className="min-w-0 flex-1">
								<span className="block text-sm font-semibold">
									{item.name}
								</span>
								<span className="mt-0.5 block text-[11px] uppercase tracking-[0.08em] tabular-nums text-muted-foreground">
									{t("global.catalogue.no", "No.")}{" "}
									{itemNo(item.product_id)}
								</span>
							</span>
							<span className="shrink-0 text-sm font-black tabular-nums">
								×{item.qty}
							</span>
						</li>
					))}
				</ul>
			</section>

			{combo.body && (
				<section className="mt-10">
					<GlobalSectionTitle title={t("bundle.aboutOffer")} />
					<div
						className="prose prose-sm max-w-[70ch] text-sm leading-relaxed text-muted-foreground [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm [&>ol]:mb-2 [&>p]:mb-2 [&>ul]:mb-2"
						dangerouslySetInnerHTML={{
							__html: DOMPurify.sanitize(combo.body),
						}}
					/>
				</section>
			)}

			{combo.terms && (
				<section className="mt-10 border-t border-border pt-4">
					<h2 className="mb-2 text-[11px] font-black uppercase tracking-[0.08em] text-muted-foreground">
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
