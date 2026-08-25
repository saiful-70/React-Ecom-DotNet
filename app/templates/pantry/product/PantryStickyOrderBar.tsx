"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDown } from "lucide-react";
import Price from "@/components/shared/Price";
import { cn } from "@/lib/utils/utils";
import "../pantry.css";

interface PantryStickyOrderBarProps {
	/** Price charged for one unit of the current selection. */
	price: number;
	/** Struck original, only when a real backend discount exists. */
	originalPrice?: number | null;
	soldOut?: boolean;
	/** DOM id of the order form this bar shadows. */
	targetId: string;
}

/** Fixed bar height, mirrored by the in-flow spacer so nothing shifts. */
const BAR_HEIGHT_CLASS = "h-[4.75rem]";

/**
 * The thumb-zone order action, phones only.
 *
 * The order form is the page, so this bar exists purely for the stretch of
 * scroll where the form is off screen: it carries the price and one green
 * action that walks the shopper back to the form and puts the cursor in it.
 * It is driven by an IntersectionObserver on the form itself rather than a
 * scroll offset, so it is never wrong about whether the form is reachable.
 *
 * It reserves its own height with an in-flow spacer (no layout shift, and the
 * footer never hides under it) and publishes that height on <html> as
 * `--pn-order-bar` while mounted, so the floating call button lifts clear of
 * it instead of landing on top.
 */
export function PantryStickyOrderBar({
	price,
	originalPrice,
	soldOut = false,
	targetId,
}: PantryStickyOrderBarProps) {
	const { t } = useTranslation();
	const spacerRef = useRef<HTMLDivElement>(null);
	const [formVisible, setFormVisible] = useState(true);

	// Watch the form, not the scroll position.
	useEffect(() => {
		const node = document.getElementById(targetId);
		if (!node) return;
		const observer = new IntersectionObserver(
			(entries) => setFormVisible(entries[0]?.isIntersecting ?? true),
			{ threshold: 0 },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, [targetId]);

	// Publish the reserved height from the spacer itself, so the floating call
	// button's `calc(1rem + var(--pn-order-bar, 0px))` offset and the page's
	// own bottom reservation always agree — one measurement, one source.
	useEffect(() => {
		const node = spacerRef.current;
		if (!node) return;
		const root = document.documentElement;
		const publish = () => {
			root.style.setProperty("--pn-order-bar", `${node.offsetHeight}px`);
		};
		publish();
		const observer = new ResizeObserver(publish);
		observer.observe(node);
		window.addEventListener("resize", publish);
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", publish);
			root.style.removeProperty("--pn-order-bar");
		};
	}, []);

	const goToForm = () => {
		const node = document.getElementById(targetId);
		if (!node) return;
		node.scrollIntoView({ behavior: "smooth", block: "center" });
		// Land in the first field rather than merely near it.
		const field = node.querySelector<HTMLElement>(
			"input, select, textarea, button",
		);
		field?.focus({ preventScroll: true });
	};

	const hidden = formVisible;

	return (
		<>
			{/* Reserved space: the bar is fixed, so the page pays for it here. */}
			<div ref={spacerRef} aria-hidden="true" className={BAR_HEIGHT_CLASS} />
			{/* Shown at every width, not just on phones: the order form is tall
			    enough that its button can sit below a 900px-high desktop fold
			    too, and a buy action the visitor has to hunt for is the one
			    thing this world cannot afford. */}
			<div
				aria-hidden={hidden}
				className={cn(
					"fixed inset-x-0 bottom-0 z-40 border-t-2 border-primary bg-background transition-transform duration-200 motion-reduce:transition-none",
					BAR_HEIGHT_CLASS,
					hidden && "pointer-events-none translate-y-full",
				)}
			>
				<div className="flex h-full items-center gap-3 px-4">
					<div className="min-w-0">
						{/* Money keeps one voice across this world: bold tabular
						    sans in the buy colour, never the display serif. */}
						<span className="block text-xl font-bold leading-tight tabular-nums text-primary">
							<Price amount={price} />
						</span>
						{typeof originalPrice === "number" && originalPrice > price && (
							<span className="block text-sm tabular-nums text-muted-foreground line-through">
								<Price amount={originalPrice} />
							</span>
						)}
					</div>
					<button
						type="button"
						onClick={goToForm}
						disabled={soldOut}
						tabIndex={hidden ? -1 : 0}
						className="ring-warm-focus ml-auto flex min-h-[3rem] flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-display text-lg text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{soldOut ? (
							t("pantry.soldOut", "এখন স্টকে নেই")
						) : (
							<>
								<ArrowDown className="h-5 w-5" aria-hidden />
								{t("pantry.orderNow", "অর্ডার করুন")}
							</>
						)}
					</button>
				</div>
			</div>
		</>
	);
}
