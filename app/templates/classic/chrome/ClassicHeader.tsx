"use client";

import "../classic.css";

import { Suspense, useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { BadgeCheck, Heart, Phone, ShoppingBag, Truck, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { VariantSwitcher } from "@/components/shared/VariantSwitcher";
import { useVariant } from "@/components/shared/providers/variant-provider";
import HeaderSearch from "@/components/layout/HeaderSearch";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { SHOWCASE_MODE } from "@/lib/config/variant.config";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { wishlistAtom } from "@/store/wishlist.atom";
import { useCart } from "@/contexts/CartContext";
import { ClassicLogo } from "../shared/ClassicLogo";

/**
 * The shopfront chrome: a thin utility strip carrying cash-on-delivery, the
 * delivery window and the tap-to-call number, and beneath it the white
 * masthead that sticks to the top of the scroll. The masthead separates on a
 * hairline until the page moves, then on a soft shadow.
 */
export function ClassicHeader() {
	const { t } = useTranslation();
	const { itemCount } = useCart();
	const wishlistIds = useAtomValue(wishlistAtom);
	const profile = useAtomValue(miniProfileAtom);
	const settings = useAtomValue(businessSettingsAtom);
	const variant = useVariant();
	// Cart/wishlist are localStorage-backed (empty on the server). Show the
	// server value until mount to avoid a hydration mismatch.
	const [isHydrated, setIsHydrated] = useState(false);
	useEffect(() => {
		setIsHydrated(true);
	}, []);

	// Drives the sticky chrome's hairline → shadow handover.
	const [isScrolled, setIsScrolled] = useState(false);
	useEffect(() => {
		const onScroll = () => setIsScrolled(window.scrollY > 8);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const cartCount = isHydrated ? itemCount : 0;
	const wishlistCount = isHydrated ? wishlistIds.length : 0;

	const iconButton =
		"ring-warm-focus relative flex h-11 w-11 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent active:bg-accent";
	const badge =
		"classic-price absolute right-0 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground";

	return (
		<header>
			{/* Utility strip: the shop's terms and its phone, stated first. */}
			<div className="border-b border-border bg-muted text-xs">
				<div className="container mx-auto flex h-9 items-center justify-between gap-3">
					<div className="flex min-w-0 items-center gap-4">
						<span className="flex shrink-0 items-center gap-1.5 font-bold text-success">
							<BadgeCheck className="h-3.5 w-3.5" aria-hidden />
							{t("classic2.codBadge", "ক্যাশ অন ডেলিভারি")}
						</span>
						<span className="hidden items-center gap-1.5 truncate text-muted-foreground sm:flex">
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
								className="ring-warm-focus flex items-center gap-1.5 rounded-md font-bold text-primary underline-offset-4 hover:underline"
							>
								<Phone className="h-3.5 w-3.5" aria-hidden />
								<span className="classic-price">
									{settings.contact_phone}
								</span>
							</a>
						)}
						{/* Demo-only affordance. The switcher self-gates on
						    showcase mode; this frames it as scaffolding rather
						    than shop chrome — a dashed pill carrying the flask
						    and the variant id, with the switcher's own long
						    label suppressed so nothing truncates mid-word. */}
						{SHOWCASE_MODE && (
							<span
								title={`Demo variant: ${variant.name}`}
								className="flex items-center gap-0.5 rounded-md border border-dashed border-muted-foreground/40 pr-1.5 text-muted-foreground [&_button]:h-7 [&_button]:gap-0 [&_button]:px-1.5 [&_button_span]:hidden"
							>
								<VariantSwitcher />
								<span className="classic-price text-[11px] font-bold uppercase tracking-wide">
									{variant.id}
								</span>
							</span>
						)}
					</div>
				</div>
			</div>

			{/* Masthead: white, sticky, photography-first. */}
			<div className="classic-chrome" data-scrolled={isScrolled}>
				<div className="container mx-auto flex h-16 items-center gap-3 md:h-20 md:gap-6">
					<Link
						href="/"
						className="ring-warm-focus flex min-h-11 shrink-0 items-center rounded-lg"
					>
						<ClassicLogo
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
						<Link
							href={ABSOLUTE_ROUTES.WISHLIST}
							aria-label={t("classic2.wishlist", "পছন্দের তালিকা")}
							className={iconButton}
						>
							<Heart className="h-5 w-5" aria-hidden />
							{wishlistCount > 0 && (
								<span className={badge}>{wishlistCount}</span>
							)}
						</Link>
						<Link
							href={ABSOLUTE_ROUTES.CART}
							aria-label={t("classic2.cart", "ব্যাগ")}
							className={iconButton}
						>
							<ShoppingBag className="h-5 w-5" aria-hidden />
							{cartCount > 0 && <span className={badge}>{cartCount}</span>}
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
							className="ring-warm-focus hidden h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors hover:bg-accent active:bg-accent md:flex"
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
