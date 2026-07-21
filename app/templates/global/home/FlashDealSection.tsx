"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { Product } from "@/(app-routes)/products/model";
import { getFlashDealEnd } from "../_data/mock";
import { GlobalSectionTitle } from "./GlobalSectionTitle";
import { GlobalProductScroller } from "../product/GlobalProductScroller";

interface TimeLeft {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

function diff(target: number, now: number): TimeLeft {
	const total = Math.max(0, target - now);
	const seconds = Math.floor(total / 1000);
	return {
		days: Math.floor(seconds / 86400),
		hours: Math.floor((seconds % 86400) / 3600),
		minutes: Math.floor((seconds % 3600) / 60),
		seconds: seconds % 60,
	};
}

/**
 * Flash-deal band: countdown card (MOCK end time — see _data/mock.ts) beside a
 * horizontal scroller of today's-deal products. Renders nothing without deals.
 */
export function FlashDealSection({ products }: { products: Product[] }) {
	const { t } = useTranslation();
	// Compute the (mock) end time after mount so SSR/CSR markup matches.
	const [endTime, setEndTime] = useState<number | null>(null);
	const [left, setLeft] = useState<TimeLeft | null>(null);

	useEffect(() => {
		const end = getFlashDealEnd(new Date()).getTime();
		setEndTime(end);
		setLeft(diff(end, Date.now()));
		const id = window.setInterval(() => {
			setLeft(diff(end, Date.now()));
		}, 1000);
		return () => window.clearInterval(id);
	}, []);

	if (products.length === 0) return null;

	const units: { key: keyof TimeLeft; label: string }[] = [
		{ key: "days", label: t("global.flash.days") },
		{ key: "hours", label: t("global.flash.hours") },
		{ key: "minutes", label: t("global.flash.minutes") },
		{ key: "seconds", label: t("global.flash.seconds") },
	];

	return (
		<section id="today-deals">
			<GlobalSectionTitle
				title={t("global.flash.title")}
				viewAllHref={`${ABSOLUTE_ROUTES.PRODUCTS}?today_deal=1`}
			/>
			<div className="grid gap-4 lg:grid-cols-[280px_1fr] lg:items-stretch">
				<div className="flex flex-col justify-center gap-4 rounded-md bg-primary p-5 text-primary-foreground">
					<div className="flex items-center gap-2 text-sm font-semibold">
						<Zap className="h-5 w-5 fill-current" />
						{t("global.flash.hurry")}
					</div>
					<div
						className="grid grid-cols-4 gap-2"
						aria-live="off"
						suppressHydrationWarning
					>
						{units.map(({ key, label }) => (
							<div
								key={key}
								className="rounded bg-primary-foreground/15 py-2 text-center"
							>
								<div className="text-2xl font-bold tabular-nums">
									{left ? String(left[key]).padStart(2, "0") : "--"}
								</div>
								<div className="text-[10px] uppercase opacity-80">
									{label}
								</div>
							</div>
						))}
					</div>
					{endTime !== null && left && left.days + left.hours + left.minutes + left.seconds === 0 && (
						<p className="text-center text-xs opacity-80">
							{t("global.flash.ended")}
						</p>
					)}
				</div>

				<div className="min-w-0 rounded-md border bg-card p-3">
					<GlobalProductScroller products={products} />
				</div>
			</div>
		</section>
	);
}
