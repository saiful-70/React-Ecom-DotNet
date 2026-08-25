"use client";

import "../pantry.css";

import { Suspense, useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { BadgeCheck, Heart, Phone, ShoppingBag, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { VariantSwitcher } from "@/components/shared/VariantSwitcher";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useFeature } from "@/components/shared/providers/variant-provider";
import HeaderSearch from "@/components/layout/HeaderSearch";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { wishlistAtom } from "@/store/wishlist.atom";
import { useCart } from "@/contexts/CartContext";
import { PantryLogo } from "../shared/PantryLogo";

/**
 * The pantry's chrome. Two bands:
 *
 * 1. The terms bar — a filled forest field carrying the two things a
 *    Bangladeshi food buyer checks before anything else, and both of them
 *    true: that you pay cash on delivery, and the shop's real phone number. It
 *    is present at every width, because in this market the number IS the shop's
 *    identity, not a fallback. No delivery-time claim: no backend field carries
 *    one, and the real per-area charge and timing belong to checkout.
 * 2. The masthead — white, sticky, photography-first: name, search, bag,
 *    account. It closes on the world's shelf edge, meaning "goods below".
 *
 * No amber anywhere here: honey amber is reserved for real, backend-backed
 * discounts on the goods themselves.
 */
export function PantryHeader() {
	const { t } = useTranslation();
	const { itemCount } = useCart();
	const wishlistIds = useAtomValue(wishlistAtom);
	const profile = useAtomValue(miniProfileAtom);
	const settings = useAtomValue(businessSettingsAtom);
	const wishlistEnabled = useFeature("wishlist");

	// Cart/wishlist live in localStorage and are empty on the server. Hold the
	// server value until mount, or the counts hydrate-mismatch.
	const [isHydrated, setIsHydrated] = useState(false);
	useEffect(() => {
		setIsHydrated(true);
	}, []);

	const cartCount = isHydrated ? itemCount : 0;
	const wishlistCount = isHydrated ? wishlistIds.length : 0;

	const iconButton =
		"ring-warm-focus relative flex h-11 w-11 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted active:bg-muted";
	const badge =
		"absolute right-0.5 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold tabular-nums text-primary-foreground";

	return (
		<header>
			{/* The promise bar. Filled forest, never hidden. */}
			<div className="bg-secondary text-secondary-foreground">
				<div className="container mx-auto flex min-h-11 flex-wrap items-center justify-between gap-x-5 gap-y-1 py-1.5 text-xs">
					<div className="flex min-w-0 items-center gap-5">
						<span className="flex shrink-0 items-center gap-1.5">
							<BadgeCheck className="h-4 w-4" aria-hidden />
							{t("pantry.codBadge", "ক্যাশ অন ডেলিভারি")}
						</span>
					</div>

					<div className="flex shrink-0 items-center gap-3">
						{settings?.contact_phone && (
							<a
								href={`tel:${settings.contact_phone}`}
								aria-label={t("pantry.callToOrder", "অর্ডারে কল করুন")}
								className="ring-warm-focus flex min-h-11 items-center gap-1.5 rounded-md underline-offset-4 hover:underline"
							>
								<Phone className="h-4 w-4 shrink-0" aria-hidden />
								<span className="tabular-nums">{settings.contact_phone}</span>
							</a>
						)}
						{/* Both switchers self-gate: the language one on the
						    variant's flag and language list, the variant one on
						    showcase mode. */}
						<LanguageSwitcher
							showLabel
							className="h-9 text-secondary-foreground/80 hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
						/>
						<VariantSwitcher />
					</div>
				</div>
			</div>

			{/* Masthead: white, sticky, closed by the shelf edge. */}
			<div className="pn-shelf sticky top-0 z-40 bg-background">
				<div className="container mx-auto flex h-16 items-center gap-3 md:h-20 md:gap-6">
					<Link
						href={ABSOLUTE_ROUTES.HOME}
						className="ring-warm-focus flex min-h-11 shrink-0 items-center rounded-lg"
					>
						<PantryLogo
							src={settings?.header_logo}
							siteName={settings?.site_name ?? ""}
						/>
					</Link>

					<Suspense fallback={<div className="hidden flex-1 md:block" />}>
						<div className="hidden flex-1 md:block">
							<HeaderSearch placement="desktop" />
						</div>
					</Suspense>

					<div className="ml-auto flex items-center gap-0.5 md:gap-1">
						<Suspense fallback={<span className="h-11 w-11 md:hidden" />}>
							<span className="md:hidden">
								<HeaderSearch placement="mobile" />
							</span>
						</Suspense>

						{wishlistEnabled && (
							<Link
								href={ABSOLUTE_ROUTES.WISHLIST}
								aria-label={t("pantry.wishlist", "পছন্দের তালিকা")}
								className={iconButton}
							>
								<Heart className="h-5 w-5" aria-hidden />
								{wishlistCount > 0 && (
									<span className={badge}>{wishlistCount}</span>
								)}
							</Link>
						)}

						<Link
							href={ABSOLUTE_ROUTES.CART}
							aria-label={t("pantry.cart", "ব্যাগ")}
							className={iconButton}
						>
							<ShoppingBag className="h-5 w-5" aria-hidden />
							{cartCount > 0 && <span className={badge}>{cartCount}</span>}
						</Link>

						<Link
							href={profile ? ABSOLUTE_ROUTES.PROFILE : ABSOLUTE_ROUTES.LOGIN}
							aria-label={
								profile
									? t("pantry.profile", "প্রোফাইল")
									: t("pantry.login", "লগইন")
							}
							className="ring-warm-focus hidden h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors hover:bg-muted active:bg-muted md:flex"
						>
							<User className="h-4 w-4" aria-hidden />
							{profile
								? t("pantry.profile", "প্রোফাইল")
								: t("pantry.login", "লগইন")}
						</Link>

						<Link
							href={profile ? ABSOLUTE_ROUTES.PROFILE : ABSOLUTE_ROUTES.LOGIN}
							aria-label={
								profile
									? t("pantry.profile", "প্রোফাইল")
									: t("pantry.login", "লগইন")
							}
							className={`${iconButton} md:hidden`}
						>
							<User className="h-5 w-5" aria-hidden />
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
}
