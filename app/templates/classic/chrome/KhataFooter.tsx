"use client";

import "../classic.css";

import { useAtomValue } from "jotai";
import { BadgeCheck, Mail, MapPin, Phone, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { KhataLogo } from "../shared/KhataLogo";

/**
 * Khata chrome: the printed ledger close. A double rule ends the day's page,
 * the kraft board carries the shop's particulars, and the last line is the
 * copyright — the khata shut for the night.
 */
export function KhataFooter() {
	const { t } = useTranslation();
	const settings = useAtomValue(businessSettingsAtom);

	// All internal routes so the demo has no dead links.
	const ledgerLinks = [
		{ href: "/", label: t("classic2.home", "হোম") },
		{
			href: ABSOLUTE_ROUTES.PRODUCTS,
			label: t("classic2.allProducts", "সব পণ্য"),
		},
		{ href: ABSOLUTE_ROUTES.CART, label: t("classic2.cart", "ব্যাগ") },
		{
			href: ABSOLUTE_ROUTES.ORDERS,
			label: t("classic2.trackOrder", "অর্ডার খোঁজ"),
		},
	];

	return (
		<footer className="pb-20 md:pb-0">
			<div className="khata-rule-double" aria-hidden />
			<div className="bg-secondary text-secondary-foreground">
				<div className="container mx-auto grid gap-10 py-10 md:grid-cols-3 md:gap-8">
					{/* Shop particulars */}
					<div className="space-y-4">
						<div className="inline-flex items-center">
							<KhataLogo
								src={
									settings?.footer_logo ||
									settings?.header_logo
								}
								siteName={settings?.site_name ?? ""}
							/>
						</div>
						{settings?.address && (
							<p className="flex items-start gap-2 text-sm text-secondary-foreground/85">
								<MapPin
									className="mt-0.5 h-4 w-4 shrink-0"
									aria-hidden
								/>
								{settings.address}
							</p>
						)}
						{settings?.contact_phone && (
							<a
								href={`tel:${settings.contact_phone}`}
								className="flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
							>
								<Phone className="h-4 w-4 shrink-0" aria-hidden />
								<span className="tabular-nums">
									{settings.contact_phone}
								</span>
							</a>
						)}
						{settings?.contact_email && (
							<a
								href={`mailto:${settings.contact_email}`}
								className="flex items-center gap-2 text-sm text-secondary-foreground/85 underline-offset-4 hover:underline"
							>
								<Mail className="h-4 w-4 shrink-0" aria-hidden />
								{settings.contact_email}
							</a>
						)}
					</div>

					{/* Ledger index */}
					<div>
						<h3 className="mb-4 font-display text-lg font-bold">
							{t("classic2.usefulLinks", "দরকারি পাতা")}
						</h3>
						<ul className="space-y-2.5 border-l-[1px] border-secondary-foreground/30 pl-4">
							{ledgerLinks.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="ring-warm-focus text-sm text-secondary-foreground/85 underline-offset-4 hover:text-secondary-foreground hover:underline"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* The shop's terms, printed once more before close. */}
					<div>
						<h3 className="mb-4 font-display text-lg font-bold">
							{t("classic2.shopTerms", "দোকানের নিয়ম")}
						</h3>
						<ul className="space-y-3 text-sm text-secondary-foreground/85">
							<li className="flex items-start gap-2">
								<BadgeCheck
									className="mt-0.5 h-4 w-4 shrink-0"
									aria-hidden
								/>
								{t(
									"classic2.codLong",
									"পণ্য হাতে পেয়ে টাকা দিন — ক্যাশ অন ডেলিভারি"
								)}
							</li>
							<li className="flex items-start gap-2">
								<Truck
									className="mt-0.5 h-4 w-4 shrink-0"
									aria-hidden
								/>
								{t(
									"classic2.deliveryPromise",
									"ঢাকায় ২৪–৪৮ ঘণ্টা, ঢাকার বাইরে ২–৩ দিন"
								)}
							</li>
							<li className="flex items-start gap-2">
								<Phone
									className="mt-0.5 h-4 w-4 shrink-0"
									aria-hidden
								/>
								{t(
									"classic2.confirmCall",
									"অর্ডার কনফার্ম করতে আমরা ফোনে কল করব"
								)}
							</li>
						</ul>
					</div>
				</div>
				{settings?.copyright_text && (
					<div className="border-t border-secondary-foreground/20 py-4 text-center text-xs text-secondary-foreground/70">
						{settings.copyright_text}
					</div>
				)}
			</div>
		</footer>
	);
}
