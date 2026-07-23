"use client";

import { useTranslation } from "react-i18next";
import { Calendar, Camera, Package } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/shared/ui/avatar";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/shared/ui/tabs";
import { UserMiniProfileModel } from "@/(app-routes)/(auth)/model";
import ProfileOverView from "@/(app-routes)/profile/components/profile-overview";
import OrderInfo from "@/(app-routes)/profile/components/order-info";
import WishlistInfo from "@/(app-routes)/profile/components/whishlist-info";
import UserSecurity from "@/(app-routes)/profile/components/user-security";
import { UserProfileTabModel } from "@/(app-routes)/profile/model";
import { useEffect } from "react";
import { OrderHistoryModel } from "@/(app-routes)/profile/orders/model";
import { useTabNavigation } from "@/hooks/use-tab-navigation";
import { useFileInput } from "@/hooks/use-file-input";
import { useFileUpload } from "@/hooks/use-file-upload";
import {
	handleAvatarUpload,
	getAvatarInitials,
} from "@/lib/utils/avatar.utils";

type Props = {
	model: UserMiniProfileModel;
	orderHistory: OrderHistoryModel[];
};

export function ProfilePage({ model, orderHistory }: Props) {
	const { t } = useTranslation();
	const { tab, handleTabClick } = useTabNavigation();
	const { fileInputRef, triggerFileInput } = useFileInput();

	// Handle avatar upload with validation
	const { loading: uploading, handleFileChange } = useFileUpload(
		async (file) => {
			await handleAvatarUpload(file, t);
		},
		{
			maxSizeMB: 5,
			acceptedTypes: ["image/"],
		}
	);

	// Initialize tab from URL on component mount
	useEffect(() => {
		if (!tab) {
			// Tab is already set in defaultValue of Tabs component
			return;
		}
	}, [tab]);

	// Define profile tabs configuration
	const profileTabs: UserProfileTabModel[] = [
		{
			tabTriggerId: "overview",
			tabTitle: t("profile.overview") || "Overview",
			tabContent: (
				<ProfileOverView model={model} orderHistory={orderHistory} />
			),
			onClick: () => handleTabClick(),
		},
		{
			tabTriggerId: "orders",
			tabTitle: t("profile.orders") || "Orders",
			tabContent: <OrderInfo model={orderHistory} />,
			onClick: () => handleTabClick("orders"),
		},
		{
			tabTriggerId: "wishlist",
			tabTitle: t("profile.wishlist") || "Wishlist",
			tabContent: <WishlistInfo />,
			onClick: () => handleTabClick("wishlist"),
		},
		{
			tabTriggerId: "security",
			tabTitle: t("profile.security") || "Security",
			tabContent: <UserSecurity />,
			onClick: () => handleTabClick("security"),
		},
	];

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="max-w-4xl mx-auto">
				<Card className="mb-8">
					<CardContent className="pt-6">
						<div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
							<div className="relative">
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									className="hidden"
									onChange={handleFileChange}
								/>
								<Avatar
									className="w-24 h-24 cursor-pointer"
									onClick={triggerFileInput}
								>
									<AvatarImage
										src={model.avatar}
										alt={model.name || "Profile"}
									/>
									<AvatarFallback className="text-2xl">
										{getAvatarInitials(model.name)}
									</AvatarFallback>
								</Avatar>
								<Button
									size="sm"
									variant="secondary"
									className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
									onClick={triggerFileInput}
									disabled={uploading}
								>
									<Camera className="w-4 h-4" />
								</Button>
							</div>

							<div className="flex-1 text-center md:text-left">
								<h1 className="text-2xl font-bold mb-2">
									{model.name ||
										t("profile.loading") ||
										"Loading..."}
								</h1>
								<p className="text-muted-foreground mb-4">
									{model.email || ""}
								</p>
								<div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
									<div className="flex items-center gap-1">
										<Calendar className="w-4 h-4" />
										{t("profile.member") || "Member"}
									</div>
									<div className="flex items-center gap-1">
										<Package className="w-4 h-4" />
										{t("profile.ordersCount", {
											count: orderHistory.length,
										}) || `${orderHistory.length} orders`}
									</div>
								</div>
							</div>
							<div id="update-profile-button"></div>
						</div>
					</CardContent>
				</Card>

				<Tabs defaultValue={tab || "overview"} className="space-y-6">
					<TabsList className="grid w-full grid-cols-4">
						{profileTabs.map((tabItem) => (
							<TabsTrigger
								value={tabItem.tabTriggerId}
								key={tabItem.tabTriggerId}
								onClick={(e) => {
									e.preventDefault();
									if (tabItem && tabItem.onClick)
										tabItem.onClick();
								}}
							>
								{tabItem.tabTitle}
							</TabsTrigger>
						))}
					</TabsList>
					{profileTabs.map((tabItem) => (
						<TabsContent
							value={tabItem.tabTriggerId}
							key={tabItem.tabTriggerId}
						>
							{tabItem.tabContent}
						</TabsContent>
					))}
				</Tabs>
			</div>
		</main>
	);
}
