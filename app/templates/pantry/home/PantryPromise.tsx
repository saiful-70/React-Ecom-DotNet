"use client";

import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { Phone } from "lucide-react";
import { businessSettingsAtom } from "@/store/ui-atoms";
import "../pantry.css";

/**
 * The close of the scroll: how this shop serves you, said at the door.
 *
 * Deliberately not a row of three icon cards — that pattern gives the closing
 * statement the same weight as a shipping notice. It keeps the whole forest
 * field and the largest type on the page after the hero, and the only action is
 * the one a Bengali food buyer actually takes: they phone the shop.
 *
 * What it says is a SERVICE statement, not a sourcing one. This template ships
 * to every client, and there is no backend field for how goods are produced or
 * packed — so the band claims only the three things that are true of every
 * deployment: you can order by phone, you pay cash when the goods arrive, and
 * (when `support_time` is set) these are the hours somebody answers.
 *
 * The number is real or absent. `contact_phone` comes from business settings,
 * so when the client has not set one there is no dead `tel:` link and no
 * placeholder — the section simply speaks without offering a call.
 */
export function PantryPromise() {
	const { t } = useTranslation();
	const settings = useAtomValue(businessSettingsAtom);

	const phone = settings?.contact_phone?.trim();
	const supportTime = settings?.support_time?.trim();

	return (
		<section
			aria-labelledby="pantry-promise-heading"
			className="bg-secondary text-secondary-foreground"
		>
			<div className="container mx-auto py-20 md:py-28 lg:py-32">
				<div className="max-w-3xl">
					<h2
						id="pantry-promise-heading"
						className="font-display text-3xl leading-[1.12] md:text-5xl lg:text-6xl"
					>
						{t(
							"pantry.promiseHeading",
							"ফোনে অর্ডার করুন, পণ্য হাতে পেয়ে টাকা দিন",
						)}
					</h2>
					<p className="mt-6 max-w-2xl text-base leading-relaxed text-secondary-foreground/85 md:mt-8 md:text-lg">
						{t(
							"pantry.promiseBody",
							"ওয়েবসাইট থেকে অর্ডার করতে পারেন, আর চাইলে সরাসরি ফোন করেও অর্ডার দিতে পারেন। আগে কোনো টাকা দিতে হবে না — পণ্য হাতে পাওয়ার পর ডেলিভারিম্যানকে দাম বুঝিয়ে দেবেন।",
						)}
					</p>

					{phone ? (
						<div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 md:mt-12">
							<a
								href={`tel:${phone.replace(/\s+/g, "")}`}
								className="ring-warm-focus inline-flex h-14 items-center gap-2.5 rounded-lg bg-background px-7 font-display text-lg text-primary shadow-warm-md transition-colors hover:bg-background/90 md:h-16 md:px-9 md:text-2xl"
							>
								<Phone className="h-5 w-5 shrink-0" aria-hidden />
								<span className="tabular-nums">{phone}</span>
							</a>
							{supportTime && (
								<span className="text-sm text-secondary-foreground/75 md:text-base">
									{supportTime}
								</span>
							)}
						</div>
					) : (
						supportTime && (
							<p className="mt-9 text-sm text-secondary-foreground/75 md:mt-12 md:text-base">
								{supportTime}
							</p>
						)
					)}
				</div>
			</div>
		</section>
	);
}
