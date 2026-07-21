"use client";

import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { Heart, Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { useCart } from "@/contexts/CartContext";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { miniProfileAtom } from "@/store/mini-profile.atom";

/**
 * Fixed bottom navigation (mobile only): Home · Categories · Cart · Wishlist ·
 * Account. The footer reserves bottom padding so content is never hidden.
 */
export function GlobalMobileNav() {
	const { t } = useTranslation();
	const { itemCount } = useCart();
	const profile = useAtomValue(miniProfileAtom);
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		setIsHydrated(true);
	}, []);

	const itemClass =
		"flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium";

	return (
		<nav
			className="fixed inset-x-0 bottom-0 z-50 border-t bg-background md:hidden"
			aria-label={t("global.mobileNav")}
		>
			<div className="grid h-16 grid-cols-5 items-center">
				<Link href="/" className={itemClass}>
					<Home className="h-5 w-5" />
					{t("global.nav.home")}
				</Link>
				<Link href={ABSOLUTE_ROUTES.PRODUCTS} className={itemClass}>
					<LayoutGrid className="h-5 w-5" />
					{t("global.nav.categories")}
				</Link>
				<Link href={ABSOLUTE_ROUTES.CART} className={itemClass}>
					<span className="relative">
						<ShoppingCart className="h-5 w-5" />
						{isHydrated && itemCount > 0 && (
							<span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
								{itemCount}
							</span>
						)}
					</span>
					{t("global.cart")}
				</Link>
				<Link href={ABSOLUTE_ROUTES.WISHLIST} className={itemClass}>
					<Heart className="h-5 w-5" />
					{t("global.wishlist")}
				</Link>
				<Link
					href={profile ? ABSOLUTE_ROUTES.PROFILE : ABSOLUTE_ROUTES.LOGIN}
					className={itemClass}
				>
					<User className="h-5 w-5" />
					{profile ? t("global.profile") : t("global.login")}
				</Link>
			</div>
		</nav>
	);
}
