"use client";

import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import type { Category } from "@/components/shared/models/category";
import { Badge } from "@/components/shared/ui/badge";
import { Button } from "@/components/shared/ui/button";
import { useCart } from "@/contexts/CartContext";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { useAtomValue } from "jotai";
import { HelpCircle, Leaf, Menu, Moon, Phone, ShoppingCart, Sun, User, X } from "lucide-react";
import { useTheme } from "next-themes";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { VariantSwitcher } from "@/components/shared/VariantSwitcher";
import { useFeature } from "@/components/shared/providers/variant-provider";
import { usePathname } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { MobileNavigationClient } from "./MobileNavigationClient";
import { businessSettingsAtom } from "@/store/ui-atoms";
import Image from "next/image";
import HeaderSearch from "./HeaderSearch";

interface HeaderProps {
	categories?: Category[];
}

export const Header = ({ categories = [] }: HeaderProps) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	// Cart state comes from localStorage, so the count is 0 on the server and
	// only known after mount. Gate the badge on hydration to avoid a mismatch.
	const [isHydrated, setIsHydrated] = useState(false);

	const { t } = useTranslation();
	// const setMiniProfile = useSetAtom(miniProfileAtom);
	const pathname = usePathname();
	const isHome = pathname === "/";
	const { theme, setTheme } = useTheme();
	const { itemCount } = useCart();
	const businessSettings = useAtomValue(businessSettingsAtom);
	const showLanguageSwitcher = useFeature("languageSwitcher");

	useEffect(() => {
		setIsHydrated(true);
	}, []);

	// const onLogout = () => {
	// 	startTransition(async () => {
	// 		const response = await logoutUser();
	// 		if (response.success) {
	// 			setMiniProfile(null);
	// 		}
	// 		router.push(ABSOLUTE_ROUTES.LOGIN);
	// 	});
	// };
	// const miniProfile = useAtomValue(miniProfileAtom);

	return (
		<>
			{/* Top utility bar — phone · tagline · customer help (home page only) */}
			{isHome && (
			<div className="hidden border-b border-secondary-foreground/10 bg-secondary text-secondary-foreground/90 sm:block">
				<div className="container mx-auto px-4">
					<div className="flex h-9 items-center justify-between text-xs">
						{businessSettings?.contact_phone ? (
							<a
								href={`tel:${businessSettings.contact_phone}`}
								className="flex items-center gap-1.5 hover:text-secondary-foreground"
							>
								<Phone className="h-3.5 w-3.5" />
								<span>{businessSettings.contact_phone}</span>
							</a>
						) : (
							<span />
						)}
						<span className="flex items-center gap-1.5 font-medium">
							<Leaf className="h-3.5 w-3.5 text-accent" />
							{t("topBar.tagline")}
						</span>
						<Link
							href="/profile"
							className="flex items-center gap-1.5 hover:text-secondary-foreground"
						>
							<HelpCircle className="h-3.5 w-3.5" />
							{t("topBar.customerHelp")}
						</Link>
					</div>
				</div>
			</div>
			)}

			<header className="sticky top-0 z-50 border-b border-secondary-foreground/10 bg-secondary text-secondary-foreground">
			<div className="container mx-auto px-3 md:px-4">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<Link
						href={ABSOLUTE_ROUTES.HOME}
						aria-label={businessSettings?.site_name || "Home"}
						className="flex items-center gap-2 cursor-pointer"
					>
						{businessSettings?.header_logo ? (
							<Image
								src={businessSettings.header_logo}
								alt={businessSettings?.site_name || "Logo"}
								width={120}
								height={40}
								className="object-contain max-h-10 w-auto"
								priority
							/>
						) : (
							<>
								<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
									<span className="text-primary-foreground font-bold text-lg">
										{businessSettings?.site_name.charAt(0).toUpperCase() || "D"}
									</span>
								</div>
								<span className="text-xl font-bold text-secondary-foreground">
									{businessSettings?.site_name || "DebuggerMind"}
								</span>
							</>
						)}
					</Link>

					{/* Desktop Search Bar */}
					<Suspense fallback={<div className="w-64" />}>
						<div className="hidden md:block">
							<HeaderSearch placement="desktop" />
						</div>
					</Suspense>

					{/* Right Actions */}
					<div className="flex items-center gap-0 sm:gap-1">

						{/* Demo variant switcher (showcase mode only) */}
						<VariantSwitcher />

						{/* Language Switcher */}
						{showLanguageSwitcher && <LanguageSwitcher />}

						{/* Theme Toggle */}
						<Button
							variant="ghost"
							size="icon"
							onClick={() =>
								setTheme(theme === "dark" ? "light" : "dark")
							}
							className="w-9 h-9"
							aria-label={t("a11y.toggleTheme")}
						>
							{theme === "dark" ? (
								<Sun className="w-4 h-4" />
							) : (
								<Moon className="w-4 h-4" />
							)}
						</Button>

						{/* Cart */}
						<Button
							variant="ghost"
							size="icon"
							className="relative"
							asChild
						>
							<Link href="/cart" aria-label={t("a11y.cart")}>
								<ShoppingCart className="w-5 h-5" />
								{isHydrated && itemCount > 0 && (
									<Badge
										variant="destructive"
										className="absolute -top-2 -right-2 w-5 h-5 text-xs flex items-center justify-center p-0"
									>
										{itemCount}
									</Badge>
								)}
							</Link>
						</Button>

						{/* User Account */}
						<Button
							variant="ghost"
							size="icon"
							className="hidden sm:flex"
							asChild
						>
							<Link href="/profile" aria-label={t("a11y.account")}>
								<User className="w-5 h-5" />
							</Link>
						</Button>
						{/* <Button
							variant="destructive"
							className={
								miniProfile?.email
									? "hidden sm:inline-flex"
									: "hidden"
							}
							onClick={onLogout}
						>
							<LogOutIcon className="size-5" />
						</Button> */}

						{/* Mobile Search Icon */}
						<Suspense fallback={<div className="w-9 h-9" />}>
							<HeaderSearch placement="mobile" />
						</Suspense>

						<Button
							variant="ghost"
							size="icon"
							className="md:hidden"
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							aria-label={t("a11y.toggleMenu")}
							aria-expanded={isMenuOpen}
						>
							{isMenuOpen ? (
								<X className="w-5 h-5" />
							) : (
								<Menu className="w-5 h-5" />
							)}
						</Button>
					</div>
				</div>

				{/* Mobile Menu */}
				{isMenuOpen ? (
					<div className="md:hidden h-screen bg-background text-foreground -mx-3 px-3">
						{/* Mobile Category Navigation */}
						{categories.length > 0 && (
							<div className="lg:hidden border-t bg-background/95 backdrop-blur">
								<Suspense fallback={<div className="h-32" />}>
									<MobileNavigationClient
										categories={categories}
										onClose={() => setIsMenuOpen(false)}
									/>
								</Suspense>
							</div>
						)}{" "}
						{/* Mobile User Menu */}
						<div className="border-t py-2 px-2">
							<nav className="space-y-1">
								<Button
									variant="ghost"
									className="w-full justify-start"
									asChild
								>
									<Link
										href="/profile"
										onClick={() => setIsMenuOpen(false)}
									>
										<User className="w-4 h-4 mr-2" />
										{t("header.profile")}
									</Link>
								</Button>
								{/* {miniProfile?.email ? (
									<Button
										variant="ghost"
										className="w-full justify-start"
										onClick={() => {
											setIsMenuOpen(false);
											onLogout();
										}}
									>
										<LogOutIcon className="size-4 mr-2" />
										{t("header.logout")}
									</Button>
								) : null} */}
							</nav>
						</div>
					</div>
				) : null}
			</div>
		</header>
		</>
	);
};
