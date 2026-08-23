"use client";

import { useState, useTransition } from "react";
import { useAtomValue } from "jotai";
import { Banknote, Loader2, Mail, MapPin, Phone, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { toast } from "@/components/shared/ui/sonner";
import { subscribeNewsletter } from "@/lib/actions/newsletter";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { BazarBrandMark } from "./BazarBrandMark";
import "../bazar.css";

/**
 * The counter board itself closes the page: board-black field, the shop's
 * identity chip, contact laid out as chart lines, useful links, the COD +
 * delivery promise restated, and a keypad newsletter form. Bottom padding
 * clears the mobile keypad nav.
 */
export function BazarFooter() {
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

	// All internal routes so the demo has no dead links.
	const usefulLinks = [
		{ href: "/", label: t("bazar.home") },
		{ href: ABSOLUTE_ROUTES.PRODUCTS, label: t("bazar.products") },
		{ href: ABSOLUTE_ROUTES.CART, label: t("bazar.cart") },
		{ href: ABSOLUTE_ROUTES.ORDERS, label: t("bazar.trackOrder") },
	];

	return (
		<footer className="border-t-[3px] border-primary bg-secondary pb-24 text-secondary-foreground md:pb-0">
			<div className="container mx-auto grid gap-10 py-12 md:grid-cols-3">
				{/* Identity + contact chart lines */}
				<div className="space-y-4">
					<div className="inline-flex items-center rounded-lg border border-secondary-foreground/20 bg-background px-4 py-2">
						<BazarBrandMark
							src={settings?.footer_logo || settings?.header_logo}
							name={settings?.site_name ?? ""}
							className="h-8 w-auto object-contain"
							textClassName="text-lg text-foreground"
						/>
					</div>
					{settings?.contact_phone && (
						<a
							href={`tel:${settings.contact_phone}`}
							className="ring-warm-focus flex items-center gap-2.5 rounded-md font-display text-xl font-bold hover:text-primary"
						>
							<Phone
								className="h-5 w-5 shrink-0 text-primary"
								aria-hidden="true"
							/>
							<span className="bz-num">{settings.contact_phone}</span>
						</a>
					)}
					{settings?.address && (
						<p className="flex items-start gap-2.5 text-sm text-secondary-foreground/75">
							<MapPin
								className="mt-0.5 h-4 w-4 shrink-0 text-primary"
								aria-hidden="true"
							/>
							{settings.address}
						</p>
					)}
					{settings?.contact_email && (
						<a
							href={`mailto:${settings.contact_email}`}
							className="ring-warm-focus flex items-center gap-2.5 rounded-md text-sm text-secondary-foreground/75 hover:text-secondary-foreground"
						>
							<Mail
								className="h-4 w-4 shrink-0 text-primary"
								aria-hidden="true"
							/>
							{settings.contact_email}
						</a>
					)}
					<div className="space-y-2 border-t border-dashed border-secondary-foreground/25 pt-4 text-sm">
						<p className="flex items-center gap-2.5 font-semibold">
							<Banknote
								className="h-4 w-4 shrink-0 text-primary"
								aria-hidden="true"
							/>
							{t("bazar.codBadge", "ক্যাশ অন ডেলিভারি")}
						</p>
						<p className="flex items-center gap-2.5 text-secondary-foreground/75">
							<Truck
								className="h-4 w-4 shrink-0 text-primary"
								aria-hidden="true"
							/>
							{t(
								"bazar.deliveryPromise",
								"ঢাকায় ২৪–৪৮ ঘণ্টা, ঢাকার বাইরে ২–৩ দিন"
							)}
						</p>
					</div>
				</div>

				{/* Useful links */}
				<div>
					<h3 className="mb-4 font-display text-lg font-bold">
						{t("bazar.usefulLinks")}
					</h3>
					<ul className="space-y-3">
						{usefulLinks.map((link) => (
							<li key={link.href}>
								<Link
									href={link.href}
									className="ring-warm-focus rounded-md text-sm text-secondary-foreground/75 underline-offset-4 hover:text-secondary-foreground hover:underline"
								>
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</div>

				{/* Newsletter — keypad form */}
				<div>
					<h3 className="mb-4 font-display text-lg font-bold">
						{t("bazar.joinNewsletter")}
					</h3>
					<form onSubmit={onSubscribe} className="flex gap-2">
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder={t("bazar.enterEmail")}
							aria-label={t("bazar.enterEmail")}
							className="ring-warm-focus h-12 w-full min-w-0 rounded-lg border border-secondary-foreground/25 bg-background px-4 text-base text-foreground placeholder:text-muted-foreground"
						/>
						<button
							type="submit"
							disabled={isPending}
							className="bz-key ring-warm-focus inline-flex h-12 shrink-0 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground shadow-warm-sm disabled:opacity-60"
						>
							{isPending && (
								<Loader2
									className="h-4 w-4 animate-spin"
									aria-hidden="true"
								/>
							)}
							{t("bazar.subscribe")}
						</button>
					</form>
				</div>
			</div>
			{settings?.copyright_text && (
				<div className="border-t border-secondary-foreground/15 py-4 text-center text-xs text-secondary-foreground/65">
					{settings.copyright_text}
				</div>
			)}
		</footer>
	);
}
