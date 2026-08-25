"use client";

import { useTranslation } from "react-i18next";
import { Leaf, Truck, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Product } from "@/(app-routes)/products/model";
import { proofLines } from "../lib";
import "../pantry.css";

/**
 * The terms rail, and the section that must not lie.
 *
 * A food shop is bought on trust, so this rail carries only facts the shop can
 * stand behind: how you pay, that delivery is nationwide with a charge that
 * depends on the area (the real per-city figure lives at checkout and on the
 * product page, which is the only place it exists), and — when and only when
 * the backend actually returned a provenance attribute for THIS product — where
 * the good came from. No delivery-day count and no return window: this template
 * serves every client and business settings carry neither field, so both would
 * be invented.
 *
 * Hairlines, never cards: `.pn-proof` stacks the facts on horizontal rules on a
 * phone and turns them vertical from `sm`. The column count follows the number
 * of cells that survived, so a dropped cell leaves no gap and stretches nothing.
 */
export function PantryProofRail({ product }: { product: Product }) {
	const { t } = useTranslation();

	const provenance = proofLines(product)[0] ?? null;

	const facts: { icon: LucideIcon; label: string; value: string }[] = [
		{
			icon: Wallet,
			label: t("pantry.proofPayLabel", "পেমেন্ট"),
			value: t("pantry.proofPayValue", "ক্যাশ অন ডেলিভারি"),
		},
		{
			icon: Truck,
			label: t("pantry.proofDeliveryLabel", "ডেলিভারি"),
			value: t(
				"pantry.proofDeliveryValue",
				"সারা দেশে ডেলিভারি, চার্জ এলাকা অনুযায়ী",
			),
		},
	];

	if (provenance) {
		facts.push({
			icon: Leaf,
			label: provenance.label,
			value: provenance.value,
		});
	}

	return (
		<section
			className="bg-background pb-10 pt-14 md:pb-14 md:pt-20 lg:pt-24"
			aria-label={t("pantry.proofRailLabel", "আমাদের কথা")}
		>
			<div className="container mx-auto">
				<dl
					className={`pn-proof grid grid-cols-1 ${
						facts.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
					}`}
				>
					{facts.map((fact) => (
						<div
							key={`${fact.label}-${fact.value}`}
							className="flex items-start gap-3 py-5 sm:px-6 sm:py-2 sm:first:pl-0 lg:px-7"
						>
							<fact.icon
								className="mt-0.5 h-5 w-5 shrink-0 text-primary"
								aria-hidden
							/>
							<div className="min-w-0">
								<dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									{fact.label}
								</dt>
								<dd className="mt-1 font-display text-lg leading-snug text-foreground">
									{fact.value}
								</dd>
							</div>
						</div>
					))}
				</dl>
			</div>
		</section>
	);
}
