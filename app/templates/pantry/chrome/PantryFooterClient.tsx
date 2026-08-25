"use client";

import "../pantry.css";

import { useAtomValue } from "jotai";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { businessSettingsAtom } from "@/store/ui-atoms";
import type { Category } from "@/components/shared/models/category";
import { PantryLogo } from "../shared/PantryLogo";

/**
 * The pantry's closing band: a filled forest field with the shop's name, where
 * its goods are shelved, and how to reach a human.
 *
 * Every line is printed only when the backend actually reports it — there is no
 * placeholder address, no invented support hours, no description of the
 * catalogue (business settings have no such field), no certification claim and
 * no payment-method logo the API never sent. In a food shop the footer is where
 * trust is checked; an invented line there is worse than a missing one.
 */
export function PantryFooterClient({ categories }: { categories: Category[] }) {
	const { t } = useTranslation();
	const settings = useAtomValue(businessSettingsAtom);

	const customerLinks = [
		{ href: ABSOLUTE_ROUTES.HOME, label: t("pantry.footer.home", "হোম") },
		{
			href: ABSOLUTE_ROUTES.PRODUCTS,
			label: t("pantry.footer.allProducts", "সব পণ্য"),
		},
		{ href: ABSOLUTE_ROUTES.CART, label: t("pantry.footer.cart", "ব্যাগ") },
		{
			href: ABSOLUTE_ROUTES.ORDERS,
			label: t("pantry.footer.trackOrder", "অর্ডার ট্র্যাক করুন"),
		},
	];

	const headingClass = "font-display text-lg leading-tight md:text-xl";
	const linkClass =
		"ring-warm-focus rounded-md text-sm text-secondary-foreground/75 underline-offset-4 transition-colors hover:text-secondary-foreground hover:underline";

	return (
		<footer className="bg-secondary pb-20 text-secondary-foreground md:pb-0">
			<div className="container mx-auto grid gap-10 py-12 md:grid-cols-4 md:gap-8">
				{/* Who the shop is — the wordmark, and nothing more. Business
				    settings carry no description field, and this template serves
				    every client, so any sentence here would describe a catalogue
				    the shop may not sell. */}
				<div className="space-y-4 md:col-span-2 lg:col-span-1">
					<PantryLogo
						src={settings?.footer_logo || settings?.header_logo}
						siteName={settings?.site_name ?? ""}
						textClassName="text-secondary-foreground"
					/>
				</div>

				{/* What is on the shelves. Omitted entirely when the backend has
				    no categories, rather than showing an empty column. */}
				{categories.length > 0 && (
					<div>
						<h2 className={headingClass}>
							{t("pantry.footer.shelves", "আমাদের পণ্য")}
						</h2>
						<ul className="mt-4 space-y-3">
							{categories.map((category) => (
								<li key={category.id}>
									<Link
										href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(category.id)}
										className={linkClass}
									>
										{category.name}
									</Link>
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Customer routes — all internal, so the demo has no dead links. */}
				<div>
					<h2 className={headingClass}>
						{t("pantry.footer.customerCare", "ক্রেতা সেবা")}
					</h2>
					<ul className="mt-4 space-y-3">
						{customerLinks.map((link) => (
							<li key={link.label}>
								<Link href={link.href} className={linkClass}>
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</div>

				{/* Reach a human. Honest data only. */}
				<div>
					<h2 className={headingClass}>
						{t("pantry.footer.contact", "যোগাযোগ")}
					</h2>
					<div className="mt-4 space-y-3">
						{settings?.contact_phone && (
							<a
								href={`tel:${settings.contact_phone}`}
								className="ring-warm-focus flex min-h-11 items-center gap-2.5 rounded-md font-display text-xl underline-offset-4 hover:underline"
							>
								<Phone className="h-5 w-5 shrink-0" aria-hidden />
								<span className="tabular-nums">{settings.contact_phone}</span>
							</a>
						)}
						{settings?.support_time && (
							<p className="flex items-start gap-2.5 text-sm text-secondary-foreground/75">
								<Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
								{settings.support_time}
							</p>
						)}
						{settings?.contact_email && (
							<a
								href={`mailto:${settings.contact_email}`}
								className="ring-warm-focus flex min-h-11 items-center gap-2.5 rounded-md text-sm text-secondary-foreground/75 underline-offset-4 hover:text-secondary-foreground hover:underline"
							>
								<Mail className="h-4 w-4 shrink-0" aria-hidden />
								{settings.contact_email}
							</a>
						)}
						{settings?.address && (
							<p className="flex items-start gap-2.5 text-sm text-secondary-foreground/75">
								<MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
								{settings.address}
							</p>
						)}
					</div>
				</div>
			</div>

			{settings?.copyright_text && (
				<div className="border-t border-secondary-foreground/15">
					<div className="container mx-auto py-4 text-center text-xs text-secondary-foreground/65">
						{settings.copyright_text}
					</div>
				</div>
			)}
		</footer>
	);
}
