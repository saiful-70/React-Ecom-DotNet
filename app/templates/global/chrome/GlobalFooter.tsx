"use client";

import { useState, useTransition } from "react";
import { useAtomValue } from "jotai";
import { Headset, Mail, PackageCheck, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { toast } from "@/components/shared/ui/sonner";
import { subscribeNewsletter } from "@/lib/actions/newsletter";
import Price from "@/components/shared/Price";
import { INTL_SHIPPING } from "@/lib/constants/delivery";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import {
	DEFAULT_CURRENCY,
	getCurrencySymbol,
} from "@/lib/utils/business-settings";
import { useVariant } from "@/components/shared/providers/variant-provider";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { currencyLine } from "../_data/catalogue";
import { BrandMark } from "./BrandMark";
import "../global.css";

/**
 * The catalogue colophon. Service promises set as one ruled line (not icon
 * cards), then the index columns (orders · account · newsletter), and the
 * colophon block itself: site name in Archivo 900, contact line, currency
 * note, copyright. Reserves bottom padding for the mobile bottom nav.
 */
export function GlobalFooter() {
	const { t } = useTranslation();
	const settings = useAtomValue(businessSettingsAtom);
	const variant = useVariant();
	const [email, setEmail] = useState("");
	const [isPending, startTransition] = useTransition();

	const currency =
		settings?.currency || variant.branding.currency || DEFAULT_CURRENCY;

	const onSubscribe = (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.trim()) {
			toast.error(t("footer.newsletter.emptyEmail"));
			return;
		}
		startTransition(async () => {
			const response = await subscribeNewsletter(email);
			if (response.success) {
				toast.success(t("footer.newsletter.subscribeSuccess"));
				setEmail("");
			} else {
				toast.error(response.message || t("footer.newsletter.subscribeError"));
			}
		});
	};

	// The printed terms line. Every entry is backed by a real source — the
	// checkout's INTL_SHIPPING constants or a business-settings field. Lines
	// with no backing collapse; nothing here is an unverifiable claim.
	const facts: { icon: typeof Truck; content: React.ReactNode }[] = [
		{
			icon: Truck,
			content: (
				<>
					{t("global.delivery.standard", "Standard international delivery")}{" "}
					<span className="font-black tabular-nums">
						<Price amount={INTL_SHIPPING.flat} />
					</span>
				</>
			),
		},
		{
			icon: PackageCheck,
			content: (
				<>
					{t("global.delivery.freeOver", "Free delivery on orders over")}{" "}
					<span className="font-black tabular-nums">
						<Price amount={INTL_SHIPPING.freeOver} />
					</span>
				</>
			),
		},
	];
	if (settings?.support_time?.trim()) {
		facts.push({
			icon: Headset,
			content: (
				<>
					{t("global.facts.support", "Support")}{" "}
					<span className="font-black tabular-nums">
						{settings.support_time}
					</span>
				</>
			),
		});
	}

	const quickLinks = [
		{ href: "/", label: t("global.nav.home") },
		{ href: ABSOLUTE_ROUTES.PRODUCTS, label: t("global.nav.allProducts") },
		{
			href: `${ABSOLUTE_ROUTES.PRODUCTS}?is_featured=1`,
			label: t("global.nav.featured"),
		},
		{
			href: `${ABSOLUTE_ROUTES.PRODUCTS}?today_deal=1`,
			label: t("global.nav.offers"),
		},
		{ href: ABSOLUTE_ROUTES.ORDERS, label: t("global.trackOrder") },
	];

	const accountLinks = [
		{ href: ABSOLUTE_ROUTES.PROFILE, label: t("global.profile") },
		{ href: ABSOLUTE_ROUTES.WISHLIST, label: t("global.wishlist") },
		{ href: ABSOLUTE_ROUTES.CART, label: t("global.cart") },
		{ href: ABSOLUTE_ROUTES.ORDERS, label: t("global.trackOrder") },
	];

	const linkClass =
		"ring-warm-focus rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline";

	return (
		<footer className="border-t border-border bg-background pb-20 md:pb-0">
			{/* The printed terms — one ruled line of settings-backed facts */}
			{facts.length > 0 && (
				<div className="border-b border-border">
					<div className="container mx-auto flex flex-col gap-y-3 py-5 md:flex-row md:items-center">
						{facts.map(({ icon: Icon, content }, i) => (
							<div
								key={i}
								className="flex items-center gap-2.5 text-sm font-medium md:flex-1 md:justify-center md:border-l md:border-border md:px-4 md:first:border-l-0"
							>
								<Icon className="h-4 w-4 shrink-0 text-primary" />
								<span>{content}</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Index columns */}
			<div className="container mx-auto grid gap-10 py-12 md:grid-cols-3">
				<div>
					<h3 className="mb-4 text-[11px] font-black uppercase tracking-[0.14em]">
						{t("global.quickLinks")}
					</h3>
					<ul className="space-y-2.5">
						{quickLinks.map((link) => (
							<li key={link.label}>
								<Link href={link.href} className={linkClass}>
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</div>

				<div>
					<h3 className="mb-4 text-[11px] font-black uppercase tracking-[0.14em]">
						{t("global.myAccount")}
					</h3>
					<ul className="space-y-2.5">
						{accountLinks.map((link) => (
							<li key={link.label}>
								<Link href={link.href} className={linkClass}>
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</div>

				<div>
					<h3 className="mb-4 text-[11px] font-black uppercase tracking-[0.14em]">
						{t("global.newsletter")}
					</h3>
					<p className="mb-3 text-sm text-muted-foreground">
						{t("global.newsletterHint")}
					</p>
					<form onSubmit={onSubscribe} className="flex gap-2">
						<Input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder={t("global.enterEmail")}
							aria-label={t("global.enterEmail")}
							className="rounded-sm"
						/>
						<Button
							type="submit"
							disabled={isPending}
							className="shrink-0 rounded-sm px-5"
						>
							{isPending
								? t("global.subscribing", "Subscribing…")
								: t("global.subscribe")}
						</Button>
					</form>
				</div>
			</div>

			{/* Colophon */}
			<div className="border-t border-border">
				<div className="container mx-auto flex flex-col items-start gap-3 py-6 md:flex-row md:items-baseline md:justify-between">
					<div className="space-y-1.5">
						<BrandMark
							src={settings?.footer_logo || settings?.header_logo}
							name={settings?.site_name ?? ""}
							imgClassName="h-8 w-auto object-contain"
							textClassName="text-lg"
						/>
						{settings?.contact_email && (
							<a
								href={`mailto:${settings.contact_email}`}
								className="ring-warm-focus flex items-center gap-2 rounded-sm text-sm text-muted-foreground hover:text-foreground"
							>
								<Mail className="h-4 w-4" />
								{settings.contact_email}
							</a>
						)}
					</div>
					<div className="space-y-1 text-xs text-muted-foreground md:text-right">
						<p className="uppercase tracking-[0.08em]">
							{t("global.colophon.pricesIn", "All prices in {{currency}}", {
								currency: currencyLine(currency, getCurrencySymbol(currency)),
							})}
						</p>
						{settings?.copyright_text && <p>{settings.copyright_text}</p>}
					</div>
				</div>
			</div>
		</footer>
	);
}
