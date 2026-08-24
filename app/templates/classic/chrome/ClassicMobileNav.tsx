"use client";

import "../classic.css";

import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { Home, LayoutGrid, Phone, ShoppingBag, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { useCart } from "@/contexts/CartContext";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { trackMenuClick } from "@/lib/analytics/tracking";

/**
 * The fixed bottom bar on mobile: five ≥48px thumb targets on the white
 * field — home, products, tap-to-call (the one vermilion plate), cart,
 * account. The footer and the PDP order band reserve room for it.
 */
export function ClassicMobileNav() {
	const { t } = useTranslation();
	const { itemCount } = useCart();
	const settings = useAtomValue(businessSettingsAtom);
	const profile = useAtomValue(miniProfileAtom);
	// Cart count is localStorage-backed (0 on the server); gate the badge on
	// hydration so the first client render matches the server.
	const [isHydrated, setIsHydrated] = useState(false);
	useEffect(() => {
		setIsHydrated(true);
	}, []);

	const itemClass =
		"ring-warm-focus flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-muted-foreground transition-colors active:bg-accent";

	return (
		<nav
			aria-label={t("classic2.mobileNav", "মোবাইল নেভিগেশন")}
			className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background md:hidden"
		>
			<div className="grid h-16 grid-cols-5 items-stretch">
				<Link
					href="/"
					onClick={() =>
						trackMenuClick({ menuId: "mobile-home", menuName: "Home" })
					}
					className={itemClass}
				>
					<Home className="h-5 w-5" aria-hidden />
					{t("classic2.home", "হোম")}
				</Link>
				<Link
					href={ABSOLUTE_ROUTES.PRODUCTS}
					onClick={() =>
						trackMenuClick({
							menuId: "mobile-products",
							menuName: "Products",
						})
					}
					className={itemClass}
				>
					<LayoutGrid className="h-5 w-5" aria-hidden />
					{t("classic2.products", "পণ্য")}
				</Link>
				{settings?.contact_phone ? (
					<a
						href={`tel:${settings.contact_phone}`}
						onClick={() =>
							trackMenuClick({
								menuId: "mobile-call",
								menuName: "Call",
							})
						}
						className={itemClass}
					>
						<span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
							<Phone className="h-5 w-5" aria-hidden />
						</span>
						{t("classic2.call", "কল করুন")}
					</a>
				) : (
					<span aria-hidden="true" />
				)}
				<Link
					href={ABSOLUTE_ROUTES.CART}
					onClick={() =>
						trackMenuClick({ menuId: "mobile-cart", menuName: "Cart" })
					}
					className={itemClass}
				>
					<span className="relative">
						<ShoppingBag className="h-5 w-5" aria-hidden />
						{isHydrated && itemCount > 0 && (
							<span className="classic-price absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
								{itemCount}
							</span>
						)}
					</span>
					{t("classic2.cart", "ব্যাগ")}
				</Link>
				<Link
					href={profile ? ABSOLUTE_ROUTES.PROFILE : ABSOLUTE_ROUTES.LOGIN}
					onClick={() =>
						trackMenuClick({
							menuId: profile ? "mobile-profile" : "mobile-login",
							menuName: profile ? "Profile" : "Login",
						})
					}
					className={itemClass}
				>
					<User className="h-5 w-5" aria-hidden />
					{profile
						? t("classic2.profile", "প্রোফাইল")
						: t("classic2.login", "লগইন")}
				</Link>
			</div>
		</nav>
	);
}
