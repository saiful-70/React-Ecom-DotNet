"use client";

import { Suspense, useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { Heart, ShoppingCart, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import HeaderSearch from "@/components/layout/HeaderSearch";
import Price from "@/components/shared/Price";
import { useCart } from "@/contexts/CartContext";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { wishlistAtom } from "@/store/wishlist.atom";
import { GlobalTopBar } from "./GlobalTopBar";
import { BrandMark } from "./BrandMark";
import "../global.css";

/**
 * The masthead: utility rule, then site name set in Archivo 900 like a
 * catalogue title, a dominant search field, and the account/wishlist/cart
 * column with printed tabular counts. Account prompts stay quiet — the icon
 * links to login only when signed out, with no sign-in copy pushed at guests.
 */
export function GlobalHeader() {
	const { t } = useTranslation();
	const { total, itemCount } = useCart();
	const wishlistIds = useAtomValue(wishlistAtom);
	const profile = useAtomValue(miniProfileAtom);
	const settings = useAtomValue(businessSettingsAtom);
	// Cart/wishlist are localStorage-backed (empty on the server); gate the
	// counts on hydration so the first client render matches the server.
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		setIsHydrated(true);
	}, []);

	const cartTotal = isHydrated ? total : 0;
	const cartCount = isHydrated ? itemCount : 0;
	const wishlistCount = isHydrated ? wishlistIds.length : 0;

	const iconLinkClass =
		"ring-warm-focus relative flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-background text-foreground transition-colors hover:border-foreground";

	const countBadge = (count: number, label: string) =>
		count > 0 ? (
			<span
				aria-label={`${label}: ${count}`}
				className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-sm bg-primary px-1 text-[10px] font-bold text-primary-foreground tabular-nums"
			>
				{count}
			</span>
		) : null;

	return (
		<header className="bg-background">
			<GlobalTopBar />

			<div className="border-b border-border">
				<div className="container mx-auto flex h-16 items-center gap-3 md:h-20 md:gap-8">
					<Link
						href="/"
						className="ring-warm-focus flex shrink-0 items-center rounded-sm"
						aria-label={settings?.site_name || "Home"}
					>
						<BrandMark
							src={settings?.header_logo}
							name={settings?.site_name ?? ""}
							imgClassName="h-9 w-auto object-contain md:h-11"
							textClassName="text-xl md:text-2xl"
							priority
						/>
					</Link>

					<Suspense fallback={<div className="hidden flex-1 md:block" />}>
						<div className="g-masthead-search hidden min-w-0 flex-1 md:block">
							<HeaderSearch placement="desktop" />
						</div>
					</Suspense>

					<div className="ml-auto flex items-center gap-1.5 md:gap-3">
						<Suspense fallback={<div className="h-9 w-9" />}>
							<span className="md:hidden">
								<HeaderSearch placement="mobile" />
							</span>
						</Suspense>

						<Link
							href={ABSOLUTE_ROUTES.WISHLIST}
							className={`${iconLinkClass} hidden sm:flex`}
							aria-label={t("global.wishlist")}
						>
							<Heart className="h-5 w-5" />
							{countBadge(wishlistCount, t("global.wishlist"))}
						</Link>

						<Link
							href={profile ? ABSOLUTE_ROUTES.PROFILE : ABSOLUTE_ROUTES.LOGIN}
							className={iconLinkClass}
							aria-label={profile ? t("global.profile") : t("global.login")}
						>
							<User className="h-5 w-5" />
						</Link>

						<Link
							href={ABSOLUTE_ROUTES.CART}
							className="ring-warm-focus flex items-center gap-2 rounded-sm"
							aria-label={t("global.cart")}
						>
							<span className={iconLinkClass}>
								<ShoppingCart className="h-5 w-5" />
								{countBadge(cartCount, t("global.cart"))}
							</span>
							<span className="hidden text-sm leading-tight lg:block">
								<span className="block text-xs text-muted-foreground">
									{t("global.myCart")}
								</span>
								<span className="font-black tabular-nums">
									<Price amount={cartTotal} />
								</span>
							</span>
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
}
