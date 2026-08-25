"use client";

import { Suspense, useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import {
	Banknote,
	Heart,
	Phone,
	ShoppingBag,
	Truck,
	User,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { VariantSwitcher } from "@/components/shared/VariantSwitcher";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import HeaderSearch from "@/components/layout/HeaderSearch";
import Price from "@/components/shared/Price";
import { useCart } from "@/contexts/CartContext";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { wishlistAtom } from "@/store/wishlist.atom";
import { BazarBrandMark } from "./BazarBrandMark";
import "../bazar.css";

/**
 * Counter header — the board-black chrome over the laminated chart. Top strip
 * is the counter board itself: tap-to-call number as a keypad key (the
 * phone-first identity of the flexiload shop), COD badge, delivery promise,
 * track-order/account on the right. Main row on chart-white: logo chip,
 * search, wishlist/cart keys, running cart total in chart numerals.
 */
export function BazarHeader() {
	const { t } = useTranslation();
	const { total, itemCount } = useCart();
	const wishlistIds = useAtomValue(wishlistAtom);
	const profile = useAtomValue(miniProfileAtom);
	const settings = useAtomValue(businessSettingsAtom);
	// Cart total and wishlist count are localStorage-backed (0/empty on the
	// server). Show the server value until mount to avoid a hydration mismatch.
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		setIsHydrated(true);
	}, []);

	const cartTotal = isHydrated ? total : 0;
	const wishlistCount = isHydrated ? wishlistIds.length : 0;
	const cartCount = isHydrated ? itemCount : 0;

	return (
		<header className="bg-background">
			{/* Counter board strip — visible on every width: the phone number IS
			    the shop's identity, so tap-to-call never hides. */}
			<div className="bg-secondary text-secondary-foreground">
				<div className="container mx-auto flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1.5 text-xs">
					<div className="flex items-center gap-3">
						{settings?.contact_phone && (
							<a
								href={`tel:${settings.contact_phone}`}
								className="bz-key ring-warm-focus inline-flex min-h-8 items-center gap-2 rounded-lg bg-primary px-3 font-display text-sm font-bold text-primary-foreground shadow-warm-sm"
								aria-label={t("bazar.callNow", "এখনই কল করুন")}
							>
								<Phone className="h-3.5 w-3.5" aria-hidden="true" />
								<span className="bz-num">{settings.contact_phone}</span>
							</a>
						)}
						<span className="hidden items-center gap-1.5 font-semibold sm:inline-flex">
							<Banknote className="h-4 w-4 text-primary" aria-hidden="true" />
							{t("bazar.codBadge", "ক্যাশ অন ডেলিভারি")}
						</span>
						<span className="hidden items-center gap-1.5 text-secondary-foreground/80 lg:inline-flex">
							<Truck className="h-4 w-4 text-primary" aria-hidden="true" />
							{t(
								"bazar.deliveryPromise",
								"ঢাকায় ২৪–৪৮ ঘণ্টা, ঢাকার বাইরে ২–৩ দিন"
							)}
						</span>
					</div>
					<div className="flex items-center gap-4">
						<Link
							href={ABSOLUTE_ROUTES.ORDERS}
							className="ring-warm-focus hidden items-center gap-1.5 rounded-md font-medium hover:text-primary-foreground hover:underline hover:underline-offset-4 md:inline-flex"
						>
							<Truck className="h-4 w-4" aria-hidden="true" />
							{t("bazar.trackOrder")}
						</Link>
						{profile ? (
							<Link
								href={ABSOLUTE_ROUTES.PROFILE}
								className="ring-warm-focus inline-flex items-center gap-1.5 rounded-md font-medium hover:underline hover:underline-offset-4"
							>
								<User className="h-4 w-4" aria-hidden="true" />
								<span className="hidden sm:inline">{t("bazar.profile")}</span>
							</Link>
						) : (
							<Link
								href={ABSOLUTE_ROUTES.LOGIN}
								className="ring-warm-focus inline-flex items-center gap-1.5 rounded-md font-medium hover:underline hover:underline-offset-4"
							>
								<User className="h-4 w-4" aria-hidden="true" />
								<span className="hidden sm:inline">{t("bazar.login")}</span>
							</Link>
						)}
						{/* Language keys: self-gated on the variant's own flag and
						    language list, so a single-language deployment shows
						    nothing here. */}
						<LanguageSwitcher
							showLabel
							className="h-8 text-secondary-foreground/80 hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
						/>
						<VariantSwitcher />
					</div>
				</div>
			</div>

			{/* Main row — chart-white, closed below by the board rule. */}
			<div className="border-b-[3px] border-secondary bg-background">
				<div className="container mx-auto flex h-16 items-center gap-3 md:h-20 md:gap-4">
					<Link
						href="/"
						className="bz-key ring-warm-focus flex shrink-0 items-center rounded-lg bg-secondary px-3 py-2 shadow-warm-sm md:px-4"
					>
						<BazarBrandMark
							src={settings?.header_logo}
							name={settings?.site_name ?? ""}
							className="h-7 w-auto object-contain md:h-8"
							textClassName="text-lg text-secondary-foreground"
						/>
					</Link>
					<Suspense fallback={<div className="w-64" />}>
						<div className="hidden flex-1 md:block">
							<HeaderSearch placement="desktop" />
						</div>
					</Suspense>
					<div className="ml-auto flex items-center gap-2 md:gap-3">
						<Suspense fallback={<div className="h-9 w-9" />}>
							<span className="md:hidden">
								<HeaderSearch placement="mobile" />
							</span>
						</Suspense>
						<Link
							href={ABSOLUTE_ROUTES.WISHLIST}
							className="bz-key ring-warm-focus relative flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-card shadow-warm-sm hover:border-primary"
							aria-label={t("bazar.wishlist")}
						>
							<Heart className="h-5 w-5" aria-hidden="true" />
							{wishlistCount > 0 && (
								<span className="bz-num absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground">
									{wishlistCount}
								</span>
							)}
						</Link>
						<Link
							href={ABSOLUTE_ROUTES.CART}
							className="bz-key ring-warm-focus relative flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-card shadow-warm-sm hover:border-primary"
							aria-label={t("bazar.cart")}
						>
							<ShoppingBag className="h-5 w-5" aria-hidden="true" />
							{cartCount > 0 && (
								<span className="bz-num absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground">
									{cartCount}
								</span>
							)}
						</Link>
						<span className="bz-num hidden font-display text-lg font-bold text-foreground md:inline">
							<Price amount={cartTotal} />
						</span>
					</div>
				</div>
			</div>
		</header>
	);
}
