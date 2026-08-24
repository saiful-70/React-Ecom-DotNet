"use client";

import "../classic.css";

import { useAtomValue } from "jotai";
import { BadgeCheck, Mail, MapPin, Phone, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { ClassicLogo } from "../shared/ClassicLogo";

/**
 * The ink band that closes the page: the shop's particulars, the pages worth
 * keeping, and the terms restated — cash on delivery, the delivery window,
 * and the confirming call.
 */
export function ClassicFooter() {
	const { t } = useTranslation();
	const settings = useAtomValue(businessSettingsAtom);

	// All internal routes so the demo has no dead links.
	const pageLinks = [
		{ href: "/", label: t("classic2.home", "হোম") },
		{
			href: ABSOLUTE_ROUTES.PRODUCTS,
			label: t("classic2.allProducts", "সব পণ্য"),
		},
		{ href: ABSOLUTE_ROUTES.CART, label: t("classic2.cart", "ব্যাগ") },
		{
			href: ABSOLUTE_ROUTES.ORDERS,
			label: t("classic2.trackOrder", "অর্ডার ট্র্যাক"),
		},
	];

	return (
		<footer className="bg-secondary text-secondary-foreground pb-20 md:pb-0">
			<div className="container mx-auto grid gap-10 py-12 md:grid-cols-3 md:gap-8 md:py-14">
				{/* Shop particulars */}
				<div className="space-y-4">
					<div className="inline-flex items-center">
						<ClassicLogo
							src={settings?.footer_logo || settings?.header_logo}
							siteName={settings?.site_name ?? ""}
						/>
					</div>
					{settings?.address && (
						<p className="flex items-start gap-2 text-sm text-secondary-foreground/80">
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
							className="ring-warm-focus flex min-h-11 items-center gap-2 rounded-md text-base font-bold underline-offset-4 hover:underline"
						>
							<Phone className="h-4 w-4 shrink-0" aria-hidden />
							<span className="classic-price">
								{settings.contact_phone}
							</span>
						</a>
					)}
					{settings?.contact_email && (
						<a
							href={`mailto:${settings.contact_email}`}
							className="ring-warm-focus flex items-center gap-2 rounded-md text-sm text-secondary-foreground/80 underline-offset-4 hover:text-secondary-foreground hover:underline"
						>
							<Mail className="h-4 w-4 shrink-0" aria-hidden />
							{settings.contact_email}
						</a>
					)}
				</div>

				{/* Pages */}
				<div>
					<h3 className="mb-4 font-display text-lg font-extrabold">
						{t("classic2.usefulLinks", "দরকারি লিংক")}
					</h3>
					<ul className="space-y-2.5">
						{pageLinks.map((link) => (
							<li key={link.href}>
								<Link
									href={link.href}
									className="ring-warm-focus rounded-md text-sm text-secondary-foreground/80 underline-offset-4 hover:text-secondary-foreground hover:underline"
								>
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</div>

				{/* The terms, restated before the shopper leaves. */}
				<div>
					<h3 className="mb-4 font-display text-lg font-extrabold">
						{t("classic2.shopTerms", "কেনাকাটার শর্ত")}
					</h3>
					<ul className="space-y-3 text-sm text-secondary-foreground/80">
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
							<Truck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
							{t(
								"classic2.deliveryPromise",
								"ঢাকায় ২৪–৪৮ ঘণ্টা, ঢাকার বাইরে ২–৩ দিন"
							)}
						</li>
						<li className="flex items-start gap-2">
							<Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
							{t(
								"classic2.confirmCall",
								"অর্ডার কনফার্ম করতে আমরা ফোনে কল করব"
							)}
						</li>
					</ul>
				</div>
			</div>
			{settings?.copyright_text && (
				<div className="border-t border-secondary-foreground/15 py-4 text-center text-xs text-secondary-foreground/60">
					{settings.copyright_text}
				</div>
			)}
		</footer>
	);
}
