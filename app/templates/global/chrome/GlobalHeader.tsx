"use client";

import { Suspense, useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { Heart, ShoppingCart, User } from "lucide-react";
import Image from "next/image";
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

/**
 * Global chrome header: utility top bar + main header (logo · full-width search
 * · wishlist / account / cart with counts and running total). The category
 * mega-menu lives in the separate Navigation slot (GlobalNavbar).
 */
export function GlobalHeader() {
	const { t } = useTranslation();
	const { total, itemCount } = useCart();
	const wishlistIds = useAtomValue(wishlistAtom);
	const profile = useAtomValue(miniProfileAtom);
	const settings = useAtomValue(businessSettingsAtom);
	// Cart/wishlist are localStorage-backed (empty on the server); gate the
	// badges on hydration so the first client render matches the server.
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		setIsHydrated(true);
	}, []);

	const cartTotal = isHydrated ? total : 0;
	const cartCount = isHydrated ? itemCount : 0;
	const wishlistCount = isHydrated ? wishlistIds.length : 0;

	return (
		<header className="bg-background">
			<GlobalTopBar />

			<div className="border-b shadow-sm">
				<div className="container mx-auto flex h-16 items-center gap-3 px-4 md:h-20 md:gap-6">
					<Link
						href="/"
						className="flex shrink-0 items-center"
						aria-label={settings?.site_name || "Home"}
					>
						{settings?.header_logo ? (
							<Image
								src={settings.header_logo}
								alt={settings.site_name || "Logo"}
								width={150}
								height={44}
								className="h-9 w-auto object-contain md:h-11"
								priority
							/>
						) : (
							<span className="text-xl font-extrabold tracking-tight text-primary md:text-2xl">
								{settings?.site_name ?? ""}
							</span>
						)}
					</Link>

					<Suspense fallback={<div className="hidden flex-1 md:block" />}>
						<div className="hidden flex-1 md:block">
							<HeaderSearch placement="desktop" />
						</div>
					</Suspense>

					<div className="ml-auto flex items-center gap-1.5 md:gap-4">
						<Suspense fallback={<div className="h-9 w-9" />}>
							<span className="md:hidden">
								<HeaderSearch placement="mobile" />
							</span>
						</Suspense>

						<Link
							href={ABSOLUTE_ROUTES.WISHLIST}
							className="relative hidden rounded-full border bg-card p-2.5 text-foreground transition-colors hover:border-primary hover:text-primary sm:inline-flex"
							aria-label={t("global.wishlist")}
						>
							<Heart className="h-5 w-5" />
							{wishlistCount > 0 && (
								<span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
									{wishlistCount}
								</span>
							)}
						</Link>

						<Link
							href={profile ? ABSOLUTE_ROUTES.PROFILE : ABSOLUTE_ROUTES.LOGIN}
							className="rounded-full border bg-card p-2.5 text-foreground transition-colors hover:border-primary hover:text-primary"
							aria-label={profile ? t("global.profile") : t("global.login")}
						>
							<User className="h-5 w-5" />
						</Link>

						<Link
							href={ABSOLUTE_ROUTES.CART}
							className="flex items-center gap-2"
							aria-label={t("global.cart")}
						>
							<span className="relative rounded-full border bg-card p-2.5 text-foreground transition-colors hover:border-primary hover:text-primary">
								<ShoppingCart className="h-5 w-5" />
								{cartCount > 0 && (
									<span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
										{cartCount}
									</span>
								)}
							</span>
							<span className="hidden text-sm leading-tight lg:block">
								<span className="block text-muted-foreground">
									{t("global.myCart")}
								</span>
								<span className="font-semibold tabular-nums">
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
