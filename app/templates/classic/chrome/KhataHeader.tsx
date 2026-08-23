"use client";

import "../classic.css";

import { Suspense, useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { BadgeCheck, Heart, Phone, ShoppingBag, Truck, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { VariantSwitcher } from "@/components/shared/VariantSwitcher";
import HeaderSearch from "@/components/layout/HeaderSearch";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { wishlistAtom } from "@/store/wishlist.atom";
import { useCart } from "@/contexts/CartContext";
import { KhataLogo } from "../shared/KhataLogo";

/**
 * Khata chrome: the kraft-board masthead — the shop sign. A printed trust
 * line runs above it (COD · delivery-zone promise · tap-to-call), because an
 * honest shop prints its terms before anything else.
 */
export function KhataHeader() {
	const { t } = useTranslation();
	const { itemCount } = useCart();
	const wishlistIds = useAtomValue(wishlistAtom);
	const profile = useAtomValue(miniProfileAtom);
	const settings = useAtomValue(businessSettingsAtom);
	// Cart/wishlist are localStorage-backed (empty on the server). Show the
	// server value until mount to avoid a hydration mismatch.
	const [isHydrated, setIsHydrated] = useState(false);
	useEffect(() => {
		setIsHydrated(true);
	}, []);

	const cartCount = isHydrated ? itemCount : 0;
	const wishlistCount = isHydrated ? wishlistIds.length : 0;

	return (
		<header className="bg-secondary text-secondary-foreground">
			{/* Printed trust line — the shop's terms, stated before its name. */}
			<div className="border-b border-secondary-foreground/20 bg-secondary-foreground/[0.06] text-xs">
				<div className="container mx-auto flex h-9 items-center justify-between gap-3">
					<div className="flex min-w-0 items-center gap-4">
						<span className="flex shrink-0 items-center gap-1.5 font-semibold">
							<BadgeCheck className="h-3.5 w-3.5" aria-hidden />
							{t("classic2.codBadge", "ক্যাশ অন ডেলিভারি")}
						</span>
						<span className="hidden items-center gap-1.5 truncate text-secondary-foreground/80 sm:flex">
							<Truck className="h-3.5 w-3.5 shrink-0" aria-hidden />
							{t(
								"classic2.deliveryPromise",
								"ঢাকায় ২৪–৪৮ ঘণ্টা, ঢাকার বাইরে ২–৩ দিন"
							)}
						</span>
					</div>
					<div className="flex shrink-0 items-center gap-4">
						{settings?.contact_phone && (
							<a
								href={`tel:${settings.contact_phone}`}
								className="flex items-center gap-1.5 font-semibold underline-offset-4 hover:underline"
							>
								<Phone className="h-3.5 w-3.5" aria-hidden />
								<span className="tabular-nums">
									{settings.contact_phone}
								</span>
							</a>
						)}
						<VariantSwitcher />
					</div>
				</div>
			</div>

			{/* Masthead: shop sign on kraft board. */}
			<div className="border-b-4 border-secondary-foreground/25">
				<div className="container mx-auto flex h-16 items-center gap-3 md:h-20 md:gap-6">
					<Link
						href="/"
						className="ring-warm-focus flex min-h-11 shrink-0 items-center rounded-md"
					>
						<KhataLogo
							src={settings?.header_logo}
							siteName={settings?.site_name ?? ""}
						/>
					</Link>

					<Suspense fallback={<div className="hidden flex-1 md:block" />}>
						<div className="hidden flex-1 md:block">
							<HeaderSearch placement="desktop" />
						</div>
					</Suspense>

					<div className="ml-auto flex items-center gap-1.5 md:gap-2">
						<Suspense fallback={<span className="h-11 w-11 md:hidden" />}>
							<span className="md:hidden">
								<HeaderSearch placement="mobile" />
							</span>
						</Suspense>
						<Link
							href={ABSOLUTE_ROUTES.WISHLIST}
							aria-label={t("classic2.wishlist", "পছন্দের তালিকা")}
							className="ring-warm-focus relative flex h-11 w-11 items-center justify-center rounded-md border border-secondary-foreground/25 bg-secondary-foreground/[0.06] transition-colors hover:bg-secondary-foreground/[0.14]"
						>
							<Heart className="h-5 w-5" aria-hidden />
							{wishlistCount > 0 && (
								<span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold tabular-nums text-accent-foreground">
									{wishlistCount}
								</span>
							)}
						</Link>
						<Link
							href={ABSOLUTE_ROUTES.CART}
							aria-label={t("classic2.cart", "ব্যাগ")}
							className="ring-warm-focus relative flex h-11 w-11 items-center justify-center rounded-md border border-secondary-foreground/25 bg-secondary-foreground/[0.06] transition-colors hover:bg-secondary-foreground/[0.14]"
						>
							<ShoppingBag className="h-5 w-5" aria-hidden />
							{cartCount > 0 && (
								<span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold tabular-nums text-accent-foreground">
									{cartCount}
								</span>
							)}
						</Link>
						<Link
							href={
								profile
									? ABSOLUTE_ROUTES.PROFILE
									: ABSOLUTE_ROUTES.LOGIN
							}
							aria-label={
								profile
									? t("classic2.profile", "প্রোফাইল")
									: t("classic2.login", "লগইন")
							}
							className="ring-warm-focus hidden h-11 items-center gap-2 rounded-md border border-secondary-foreground/25 bg-secondary-foreground/[0.06] px-3 text-sm font-semibold transition-colors hover:bg-secondary-foreground/[0.14] md:flex"
						>
							<User className="h-4 w-4" aria-hidden />
							{profile
								? t("classic2.profile", "প্রোফাইল")
								: t("classic2.login", "লগইন")}
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
}
