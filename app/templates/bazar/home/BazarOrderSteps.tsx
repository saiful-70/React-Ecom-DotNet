"use client";

import { useTranslation } from "react-i18next";
import "../bazar.css";

/**
 * "কীভাবে অর্ডার করবেন" — the three-step instructional strip in plain friendly
 * grammar. One laminated strip, not three cards: Bengali keypad digits carry
 * the sequence (the sequence IS the instruction), joined by the chart's
 * dashed rule.
 */
export function BazarOrderSteps() {
	const { t } = useTranslation();

	const steps = [
		{
			digit: "১",
			title: t("bazar.step1Title", "পণ্য বাছাই করুন"),
			body: t("bazar.step1Body", "চার্ট থেকে দাম মিলিয়ে পছন্দের পণ্যটি খুঁজে নিন"),
		},
		{
			digit: "২",
			title: t("bazar.step2Title", "কার্টে যোগ করুন"),
			body: t("bazar.step2Body", "কার্টে যোগ করুন বা “এখনই কিনুন” চাপুন"),
		},
		{
			digit: "৩",
			title: t("bazar.step3Title", "ফোনে কনফার্ম করুন"),
			body: t(
				"bazar.step3Body",
				"অর্ডার কনফার্ম করতে আমরা ফোনে কল করব — টাকা দেবেন ডেলিভারিতে"
			),
		},
	];

	return (
		<section
			aria-label={t("bazar.howToOrder", "কীভাবে অর্ডার করবেন")}
			className="rounded-lg border border-border bg-card shadow-warm-sm"
		>
			<h2 className="rounded-t-lg bg-secondary px-4 py-2.5 font-display text-base font-bold text-secondary-foreground md:px-5">
				{t("bazar.howToOrder", "কীভাবে অর্ডার করবেন")}
			</h2>
			<ol className="flex flex-col divide-y divide-dashed divide-border md:flex-row md:divide-x md:divide-y-0">
				{steps.map((step) => (
					<li
						key={step.digit}
						className="flex flex-1 items-start gap-3 px-4 py-3.5 md:px-5"
					>
						<span
							className="bz-num flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary font-display text-lg font-bold text-primary-foreground shadow-warm-sm"
							aria-hidden="true"
						>
							{step.digit}
						</span>
						<span className="min-w-0">
							<span className="block text-sm font-bold leading-snug">
								{step.title}
							</span>
							<span className="mt-0.5 block text-sm leading-snug text-muted-foreground">
								{step.body}
							</span>
						</span>
					</li>
				))}
			</ol>
		</section>
	);
}
