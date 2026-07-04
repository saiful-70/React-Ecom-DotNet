"use client";

import { useAtomValue } from "jotai";
import {
	Heart,
	Mail,
	Phone,
	ShoppingBag,
	Truck,
	User,
} from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { VariantSwitcher } from "@/components/shared/VariantSwitcher";
import HeaderSearch from "@/components/layout/HeaderSearch";
import Price from "@/components/shared/Price";
import { useCart } from "@/contexts/CartContext";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { wishlistAtom } from "@/store/wishlist.atom";

/**
 * Bazar chrome: utility top bar (contact · welcome · track order · login) and
 * main header (logo · search · wishlist/cart · cart total). Department nav
 * lives in the home sidebar, so this template has no secondary nav bar.
 */
export function BazarHeader() {
	const { t } = useTranslation();
	const { total } = useCart();
	const wishlistIds = useAtomValue(wishlistAtom);
	const profile = useAtomValue(miniProfileAtom);
	const settings = useAtomValue(businessSettingsAtom);

	return (
		<header className="bg-background">
			{/* Utility top bar (desktop only) */}
			<div className="hidden border-b bg-muted/40 text-xs md:block">
				<div className="container mx-auto flex h-9 items-center justify-between px-4">
					<div className="flex items-center gap-5 text-muted-foreground">
						{settings?.contact_email && (
							<a
								href={`mailto:${settings.contact_email}`}
								className="flex items-center gap-1.5 hover:text-foreground"
							>
								<Mail className="h-3.5 w-3.5" />
								{settings.contact_email}
							</a>
						)}
						{settings?.contact_phone && (
							<a
								href={`tel:${settings.contact_phone}`}
								className="flex items-center gap-1.5 hover:text-foreground"
							>
								<Phone className="h-3.5 w-3.5" />
								{settings.contact_phone}
							</a>
						)}
					</div>
					<div className="flex items-center gap-5">
						<span className="text-muted-foreground">
							{t("bazar.welcome", {
								siteName: settings?.site_name ?? "",
							})}
						</span>
						<Link
							href={ABSOLUTE_ROUTES.ORDERS}
							className="flex items-center gap-1.5 font-medium hover:text-primary"
						>
							<Truck className="h-4 w-4" />
							{t("bazar.trackOrder")}
						</Link>
						{profile ? (
							<Link
								href={ABSOLUTE_ROUTES.PROFILE}
								className="flex items-center gap-1.5 font-medium hover:text-primary"
							>
								<User className="h-4 w-4" />
								{t("bazar.profile")}
							</Link>
						) : (
							<Link
								href={ABSOLUTE_ROUTES.LOGIN}
								className="flex items-center gap-1.5 font-medium hover:text-primary"
							>
								<User className="h-4 w-4" />
								{t("bazar.login")}
							</Link>
						)}
						<VariantSwitcher />
					</div>
				</div>
			</div>

			{/* Main header */}
			<div className="border-b shadow-sm">
				<div className="container mx-auto flex h-16 items-center gap-4 px-4 md:h-20">
					<Link
						href="/"
						className="flex shrink-0 items-center rounded-md bg-secondary px-4 py-2"
					>
						{settings?.header_logo ? (
							<Image
								src={settings.header_logo}
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
					</Link>
					<div className="hidden flex-1 md:block">
						<HeaderSearch placement="desktop" />
					</div>
					<div className="ml-auto flex items-center gap-2 md:gap-3">
						<span className="md:hidden">
							<HeaderSearch placement="mobile" />
						</span>
						<Link
							href={ABSOLUTE_ROUTES.WISHLIST}
							className="relative rounded-full border bg-card p-2.5 hover:border-primary"
							aria-label={t("bazar.wishlist")}
						>
							<Heart className="h-5 w-5" />
							<span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
								{wishlistIds.length}
							</span>
						</Link>
						<Link
							href={ABSOLUTE_ROUTES.CART}
							className="rounded-full border bg-card p-2.5 hover:border-primary"
							aria-label={t("bazar.cart")}
						>
							<ShoppingBag className="h-5 w-5" />
						</Link>
						<span className="hidden font-semibold tabular-nums md:inline">
							<Price amount={total} />
						</span>
					</div>
				</div>
			</div>
		</header>
	);
}
