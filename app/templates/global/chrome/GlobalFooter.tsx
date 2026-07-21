"use client";

import { useState, useTransition } from "react";
import { useAtomValue } from "jotai";
import {
	BadgeCheck,
	HelpCircle,
	Info,
	Mail,
	MessageCircle,
	Newspaper,
	RotateCcw,
	ShieldCheck,
	Truck,
} from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { toast } from "@/components/shared/ui/sonner";
import { subscribeNewsletter } from "@/lib/actions/newsletter";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { businessSettingsAtom } from "@/store/ui-atoms";

/**
 * Global chrome footer: service-guarantee strip, About/Contact/FAQ/Blog cards,
 * brand + quick links + newsletter, copyright. Reserves bottom padding for the
 * mobile bottom nav.
 */
export function GlobalFooter() {
	const { t } = useTranslation();
	const settings = useAtomValue(businessSettingsAtom);
	const [email, setEmail] = useState("");
	const [isPending, startTransition] = useTransition();

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
				toast.error(
					response.message || t("footer.newsletter.subscribeError")
				);
			}
		});
	};

	const services = [
		{ icon: Truck, label: t("global.services.delivery") },
		{ icon: ShieldCheck, label: t("global.services.payment") },
		{ icon: RotateCcw, label: t("global.services.returns") },
		{ icon: BadgeCheck, label: t("global.services.authentic") },
	];

	const helpCards = [
		{ icon: Info, title: t("global.help.about"), href: ABSOLUTE_ROUTES.PRODUCTS },
		{
			icon: MessageCircle,
			title: t("global.help.contact"),
			href: ABSOLUTE_ROUTES.PRODUCTS,
		},
		{ icon: HelpCircle, title: t("global.help.faq"), href: ABSOLUTE_ROUTES.PRODUCTS },
		{ icon: Newspaper, title: t("global.help.blog"), href: ABSOLUTE_ROUTES.PRODUCTS },
	];

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

	return (
		<footer className="pb-20 md:pb-0">
			{/* Service-guarantee strip */}
			<div className="border-y bg-muted/40">
				<div className="container mx-auto grid grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4">
					{services.map(({ icon: Icon, label }) => (
						<div
							key={label}
							className="flex flex-col items-center gap-3 text-center"
						>
							<span className="flex h-14 w-14 items-center justify-center rounded-full bg-background shadow-sm">
								<Icon className="h-6 w-6 text-primary" />
							</span>
							<span className="text-sm font-medium">{label}</span>
						</div>
					))}
				</div>
			</div>

			{/* Help cards */}
			<div className="container mx-auto grid grid-cols-2 gap-4 px-4 py-8 md:grid-cols-4">
				{helpCards.map(({ icon: Icon, title, href }) => (
					<Link
						key={title}
						href={href}
						className="flex flex-col items-center gap-2 rounded-md border bg-card px-4 py-6 text-center shadow-sm transition-shadow hover:shadow-md"
					>
						<Icon className="h-7 w-7 text-primary" />
						<span className="font-semibold">{title}</span>
					</Link>
				))}
			</div>

			{/* Main footer */}
			<div className="bg-secondary text-secondary-foreground">
				<div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-4">
					<div className="space-y-4 md:col-span-1">
						{settings?.footer_logo || settings?.header_logo ? (
							<Image
								src={settings.footer_logo || settings.header_logo}
								alt={settings.site_name || "Logo"}
								width={150}
								height={44}
								className="h-10 w-auto object-contain"
							/>
						) : (
							<span className="text-xl font-extrabold text-primary">
								{settings?.site_name ?? ""}
							</span>
						)}
						{settings?.contact_email && (
							<a
								href={`mailto:${settings.contact_email}`}
								className="flex items-center gap-2 text-sm opacity-80 hover:opacity-100"
							>
								<Mail className="h-4 w-4" />
								{settings.contact_email}
							</a>
						)}
						{/* App badges are illustrative — no published app in this demo. */}
						<div className="pt-2">
							<p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-70">
								{t("global.downloadApp")}
							</p>
							<div className="flex gap-2">
								<span className="rounded-md border px-3 py-2 text-xs font-medium opacity-80">
									App Store
								</span>
								<span className="rounded-md border px-3 py-2 text-xs font-medium opacity-80">
									Google Play
								</span>
							</div>
						</div>
					</div>

					<div>
						<h3 className="mb-4 font-semibold">
							{t("global.quickLinks")}
						</h3>
						<ul className="space-y-2.5">
							{quickLinks.map((link) => (
								<li key={link.label}>
									<Link
										href={link.href}
										className="text-sm opacity-80 hover:text-primary hover:opacity-100"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h3 className="mb-4 font-semibold">{t("global.myAccount")}</h3>
						<ul className="space-y-2.5">
							<li>
								<Link
									href={ABSOLUTE_ROUTES.PROFILE}
									className="text-sm opacity-80 hover:text-primary hover:opacity-100"
								>
									{t("global.profile")}
								</Link>
							</li>
							<li>
								<Link
									href={ABSOLUTE_ROUTES.WISHLIST}
									className="text-sm opacity-80 hover:text-primary hover:opacity-100"
								>
									{t("global.wishlist")}
								</Link>
							</li>
							<li>
								<Link
									href={ABSOLUTE_ROUTES.CART}
									className="text-sm opacity-80 hover:text-primary hover:opacity-100"
								>
									{t("global.cart")}
								</Link>
							</li>
							<li>
								<Link
									href={ABSOLUTE_ROUTES.ORDERS}
									className="text-sm opacity-80 hover:text-primary hover:opacity-100"
								>
									{t("global.trackOrder")}
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h3 className="mb-4 font-semibold">
							{t("global.newsletter")}
						</h3>
						<p className="mb-3 text-sm opacity-80">
							{t("global.newsletterHint")}
						</p>
						<form onSubmit={onSubscribe} className="flex gap-2">
							<Input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder={t("global.enterEmail")}
								className="bg-background text-foreground"
							/>
							<Button
								type="submit"
								disabled={isPending}
								className="shrink-0 px-5"
							>
								{t("global.subscribe")}
							</Button>
						</form>
					</div>
				</div>

				{settings?.copyright_text && (
					<div className="border-t border-border/40 py-4 text-center text-xs opacity-70">
						{settings.copyright_text}
					</div>
				)}
			</div>
		</footer>
	);
}
