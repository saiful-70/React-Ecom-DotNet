"use client";

import { startTransition } from "react";
import { useAtomValue } from "jotai";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { logoutUser } from "@/(app-routes)/profile/actions";
import { Button } from "@/components/shared/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/shared/ui/dropdown-menu";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/shared/ui/avatar";
import { User, Settings, LogOut, Package } from "lucide-react";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { useTranslation } from "react-i18next";
import { useSetAtom } from "jotai";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";

export function UserMenu() {
	const user = useAtomValue(miniProfileAtom);
	const setMiniProfile = useSetAtom(miniProfileAtom);
	const { t } = useTranslation();

	const handleLogout = () => {
		startTransition(async () => {
			const response = await logoutUser();
			if (response.success) {
				setMiniProfile(null);
				// Clear localStorage as well
				if (typeof window !== "undefined") {
					localStorage.removeItem("mini-profile");
				}
				// Use window.location for full page reload
				window.location.href = ABSOLUTE_ROUTES.LOGIN;
			}
		});
	};

	if (!user) {
		return (
			<Button variant="ghost" size="sm" asChild>
				<Link href={ABSOLUTE_ROUTES.LOGIN}>{t("header.login")}</Link>
			</Button>
		);
	}

	const initials = (user.name || "U")
		.split(" ")
		.map((n: string) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="relative h-9 w-9 rounded-full"
				>
					<Avatar className="h-9 w-9">
						<AvatarImage
							src={user.avatar || undefined}
							alt={user.name || "User"}
						/>
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end" forceMount>
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">
							{user.name}
						</p>
						<p className="text-xs leading-none text-muted-foreground">
							{user.email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/profile" className="cursor-pointer">
						<User className="mr-2 h-4 w-4" />
						<span>{t("profile.title")}</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/profile?tab=orders" className="cursor-pointer">
						<Package className="mr-2 h-4 w-4" />
						<span>{t("profile.orderHistory")}</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link
						href="/profile?tab=settings"
						className="cursor-pointer"
					>
						<Settings className="mr-2 h-4 w-4" />
						<span>{t("profile.settings")}</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleLogout}
					className="cursor-pointer text-destructive focus:text-destructive"
				>
					<LogOut className="mr-2 h-4 w-4" />
					<span>{t("profile.logout")}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
