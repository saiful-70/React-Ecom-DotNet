"use client";

import { useState, useTransition } from "react";
import { useAtomValue } from "jotai";
import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { toast } from "@/components/shared/ui/sonner";
import { subscribeNewsletter } from "@/lib/actions/newsletter";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { businessSettingsAtom } from "@/store/ui-atoms";

/** Bazar chrome: brand/contact block · useful links · newsletter form. */
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
		<footer className="border-t bg-muted/40 pb-20 md:pb-0">
			<div className="container mx-auto grid gap-10 px-4 py-10 md:grid-cols-3">
				{/* Brand + contact */}
				<div className="space-y-4">
					<div className="inline-flex items-center rounded-md bg-secondary px-4 py-2">
						{settings?.footer_logo || settings?.header_logo ? (
							<Image
								src={
									settings.footer_logo ||
									settings.header_logo
								}
								alt={settings.site_name || "Logo"}
								width={140}
								height={40}
								className="h-8 w-auto object-contain"
							/>
						) : (
							<span className="text-lg font-bold text-secondary-foreground">
								{settings?.site_name ?? ""}
							</span>
						)}
					</div>
					{settings?.address && (
						<p className="flex items-start gap-2 text-sm text-muted-foreground">
							<MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
							{settings.address}
						</p>
					)}
					{settings?.contact_phone && (
						<a
							href={`tel:${settings.contact_phone}`}
							className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
						>
							<Phone className="h-4 w-4 shrink-0 text-primary" />
							{settings.contact_phone}
						</a>
					)}
					{settings?.contact_email && (
						<a
							href={`mailto:${settings.contact_email}`}
							className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
						>
							<Mail className="h-4 w-4 shrink-0 text-primary" />
							{settings.contact_email}
						</a>
					)}
				</div>

				{/* Useful links */}
				<div>
					<h3 className="mb-4 font-semibold">
						{t("bazar.usefulLinks")}
					</h3>
					<ul className="space-y-2.5">
						{usefulLinks.map((link) => (
							<li key={link.href}>
								<Link
									href={link.href}
									className="text-sm text-muted-foreground hover:text-primary"
								>
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</div>

				{/* Newsletter */}
				<div>
					<h3 className="mb-4 font-semibold">
						{t("bazar.joinNewsletter")}
					</h3>
					<form onSubmit={onSubscribe} className="flex gap-2">
						<Input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder={t("bazar.enterEmail")}
							className="rounded-full"
						/>
						<Button
							type="submit"
							disabled={isPending}
							className="shrink-0 rounded-full px-6"
						>
							{t("bazar.subscribe")}
						</Button>
					</form>
				</div>
			</div>
			{settings?.copyright_text && (
				<div className="border-t py-4 text-center text-xs text-muted-foreground">
					{settings.copyright_text}
				</div>
			)}
		</footer>
	);
}
