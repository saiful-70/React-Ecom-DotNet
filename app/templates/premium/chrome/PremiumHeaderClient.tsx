"use client";

import { Suspense, useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { Heart, ShoppingBag, User } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import HeaderSearch from "@/components/layout/HeaderSearch";
import { useFeature } from "@/components/shared/providers/variant-provider";
import { useCart } from "@/contexts/CartContext";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { wishlistAtom } from "@/store/wishlist.atom";
import type { Category } from "@/components/shared/models/category";
import "../premium.css";

/**
 * Premium header shell: small didone wordmark over the lacquer field, a
 * compact Jost-caps collection nav, and quiet account/cart actions. One foil
 * hairline closes the header; the world stays viridian.
 */
export function PremiumHeaderClient({ categories }: { categories: Category[] }) {
	const { t } = useTranslation();
	const { itemCount } = useCart();
	const wishlistEnabled = useFeature("wishlist");
	const wishlistIds = useAtomValue(wishlistAtom);
	const profile = useAtomValue(miniProfileAtom);
	const settings = useAtomValue(businessSettingsAtom);
	// Cart/wishlist are localStorage-backed (empty on the server); gate the
	// counts on hydration so the first client render matches the server.
	const [isHydrated, setIsHydrated] = useState(false);
	// A 404ing logo URL degrades to the didone text wordmark, in-world.
	const [logoBroken, setLogoBroken] = useState(false);

	useEffect(() => {
		setIsHydrated(true);
	}, []);

	const cartCount = isHydrated ? itemCount : 0;
	const wishlistCount = isHydrated ? wishlistIds.length : 0;

	const navLabel = (name: string) => name;

	return (
		<header className="bg-background text-foreground">
			<div className="container mx-auto flex h-16 items-center gap-4 md:h-20">
				{/* Wordmark — small, top; the specimen below carries the scale. */}
				<Link
					href="/"
					className="ring-warm-focus flex shrink-0 items-center"
					aria-label={settings?.site_name || "Home"}
				>
					{settings?.header_logo && !logoBroken ? (
						<Image
							src={settings.header_logo}
							alt={settings.site_name || "Logo"}
							width={140}
							height={40}
							className="h-8 w-auto object-contain md:h-9"
							priority
							onError={() => setLogoBroken(true)}
						/>
					) : (
						<span className="font-display text-xl tracking-tight md:text-2xl">
							{settings?.site_name ?? ""}
						</span>
					)}
				</Link>

				{/* Compact collection nav — Jost caps, tracked, no bar of its own. */}
				<nav
					className="ml-8 hidden items-center gap-6 lg:flex"
					aria-label={t("premium.nav.collections", "Collections")}
				>
					<Link
						href={ABSOLUTE_ROUTES.PRODUCTS}
						className="ring-warm-focus text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
					>
						{t("premium.nav.allProducts", "The Collection")}
					</Link>
					{categories.map((category) => (
						<Link
							key={category.id}
							href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(category.id)}
							className="ring-warm-focus text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
						>
							{navLabel(category.name)}
						</Link>
					))}
				</nav>

				<div className="ml-auto flex items-center gap-1 md:gap-2">
					<Suspense fallback={<span className="h-9 w-9" />}>
						<HeaderSearch placement="mobile" />
					</Suspense>

					{wishlistEnabled && (
						<Link
							href={ABSOLUTE_ROUTES.WISHLIST}
							className="ring-warm-focus relative hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
							aria-label={t("premium.wishlist", "Wishlist")}
						>
							<Heart className="h-5 w-5" />
							{wishlistCount > 0 && (
								<span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold tabular-nums text-accent-foreground">
									{wishlistCount}
								</span>
							)}
						</Link>
					)}

					<Link
						href={profile ? ABSOLUTE_ROUTES.PROFILE : ABSOLUTE_ROUTES.LOGIN}
						className="ring-warm-focus p-2 text-muted-foreground transition-colors hover:text-foreground"
						aria-label={
							profile
								? t("premium.account", "Account")
								: t("premium.signIn", "Sign in")
						}
					>
						<User className="h-5 w-5" />
					</Link>

					<Link
						href={ABSOLUTE_ROUTES.CART}
						className="ring-warm-focus relative p-2 text-muted-foreground transition-colors hover:text-foreground"
						aria-label={t("premium.cart", "Cart")}
					>
						<ShoppingBag className="h-5 w-5" />
						{cartCount > 0 && (
							<span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold tabular-nums text-accent-foreground">
								{cartCount}
							</span>
						)}
					</Link>
				</div>
			</div>
			<div className="premium-hairline" aria-hidden="true" />
		</header>
	);
}
