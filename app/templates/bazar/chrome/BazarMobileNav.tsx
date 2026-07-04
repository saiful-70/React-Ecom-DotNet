"use client";

import { useAtomValue } from "jotai";
import {
	Home,
	LayoutGrid,
	Phone,
	ShoppingCart,
	User,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { useCart } from "@/contexts/CartContext";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { miniProfileAtom } from "@/store/mini-profile.atom";

/**
 * Fixed bottom navigation (mobile only): CATEGORY · CALL · HOME (raised) ·
 * CART · LOGIN/PROFILE. The footer reserves bottom padding for it.
 */
export function BazarMobileNav() {
	const { t } = useTranslation();
	const { itemCount } = useCart();
	const settings = useAtomValue(businessSettingsAtom);
	const profile = useAtomValue(miniProfileAtom);

	const itemClass =
		"flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium uppercase";

	return (
		<nav
			className="fixed inset-x-0 bottom-0 z-50 border-t bg-background md:hidden"
			aria-label={t("bazar.category")}
		>
			<div className="grid h-16 grid-cols-5 items-center">
				<Link href={ABSOLUTE_ROUTES.PRODUCTS} className={itemClass}>
					<LayoutGrid className="h-5 w-5" />
					{t("bazar.category")}
				</Link>
				{settings?.contact_phone ? (
					<a
						href={`tel:${settings.contact_phone}`}
						className={itemClass}
					>
						<Phone className="h-5 w-5" />
						{t("bazar.call")}
					</a>
				) : (
					<span aria-hidden="true" />
				)}
				<Link
					href="/"
					className="flex flex-col items-center justify-end gap-0.5 text-[11px] font-medium uppercase"
				>
					<span className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-lg">
						<Home className="h-6 w-6" />
					</span>
					{t("bazar.home")}
				</Link>
				<Link href={ABSOLUTE_ROUTES.CART} className={itemClass}>
					<span className="relative">
						<ShoppingCart className="h-5 w-5" />
						{itemCount > 0 && (
							<span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
								{itemCount}
							</span>
						)}
					</span>
					{t("bazar.cart")}
				</Link>
				<Link
					href={
						profile
							? ABSOLUTE_ROUTES.PROFILE
							: ABSOLUTE_ROUTES.LOGIN
					}
					className={itemClass}
				>
					<User className="h-5 w-5" />
					{profile ? t("bazar.profile") : t("bazar.login")}
				</Link>
			</div>
		</nav>
	);
}
