"use client";

import { useState } from "react";
import { useAtomValue } from "jotai";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { businessSettingsAtom } from "@/store/ui-atoms";
import "../premium.css";

/**
 * Premium footer — the engraved colophon. Deep lacquer field, a large didone
 * wordmark set like a press mark, foil hairlines, and a short index of links.
 * No newsletter forms, no app badges, no service-icon strip.
 */
export function PremiumFooter() {
	const { t } = useTranslation();
	const settings = useAtomValue(businessSettingsAtom);
	// A 404ing logo URL degrades to the didone text wordmark, in-world.
	const [logoBroken, setLogoBroken] = useState(false);

	const indexLinks = [
		{ href: "/", label: t("premium.nav.home", "Home") },
		{
			href: ABSOLUTE_ROUTES.PRODUCTS,
			label: t("premium.nav.allProducts", "The Collection"),
		},
		{ href: ABSOLUTE_ROUTES.CART, label: t("premium.cart", "Cart") },
		{
			href: ABSOLUTE_ROUTES.ORDERS,
			label: t("premium.trackOrder", "Track an order"),
		},
	];

	return (
		<footer className="bg-secondary text-secondary-foreground">
			<div className="premium-hairline" aria-hidden="true" />
			<div className="container mx-auto py-16 md:py-24">
				{/* Press mark: the wordmark engraved at real scale. */}
				<div className="flex flex-col items-center gap-6 text-center">
					{(settings?.footer_logo || settings?.header_logo) && !logoBroken ? (
						<Image
							src={settings.footer_logo || settings.header_logo}
							alt={settings.site_name || "Logo"}
							width={220}
							height={64}
							className="h-12 w-auto object-contain md:h-14"
							onError={() => setLogoBroken(true)}
						/>
					) : (
						<p className="font-display text-4xl tracking-tight md:text-6xl">
							{settings?.site_name ?? ""}
						</p>
					)}
					{settings?.contact_email && (
						<a
							href={`mailto:${settings.contact_email}`}
							className="ring-warm-focus text-sm text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-secondary-foreground"
						>
							{settings.contact_email}
						</a>
					)}
				</div>

				<div className="premium-hairline my-10" aria-hidden="true" />

				<nav
					className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
					aria-label={t("premium.footer.index", "Site index")}
				>
					{indexLinks.map((link) => (
						<Link
							key={link.label}
							href={link.href}
							className="ring-warm-focus text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-secondary-foreground"
						>
							{link.label}
						</Link>
					))}
				</nav>

				{settings?.copyright_text && (
					<p className="mt-10 text-center text-xs tracking-wide text-muted-foreground">
						{settings.copyright_text}
					</p>
				)}
			</div>
		</footer>
	);
}
