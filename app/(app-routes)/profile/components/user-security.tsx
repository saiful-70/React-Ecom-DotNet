"use client";

import { Button } from "@/components/shared/ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
} from "@/components/shared/ui/card";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { LogOut } from "lucide-react";
import { useState, useTransition } from "react";
import { logoutUser, changePassword } from "../actions";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { useSetAtom } from "jotai";
import { toast } from "sonner";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { useTranslation } from "react-i18next";

export default function UserSecurity() {
	const [loading, startTransition] = useTransition();
	const [passwordLoading, startPasswordTransition] = useTransition();
	const setMiniProfile = useSetAtom(miniProfileAtom);
	const router = useRouter();
	const { t } = useTranslation();

	const [passwords, setPasswords] = useState({
		current_password: "",
		new_password: "",
		confirm_new_password: "",
	});

	const [errors, setErrors] = useState({
		current_password: "",
		new_password: "",
		confirm_new_password: "",
	});

	const handleLogout = () => {
		startTransition(async () => {
			const response = await logoutUser();
			if (response.success) {
				setMiniProfile(null);
				toast.success(t("profile.loggedOutSuccess") || "Logged out successfully");
				router.push(ABSOLUTE_ROUTES.HOME);
			} else {
				toast.error(response.message || t("profile.logoutFailed") || "Failed to logout");
			}
		});
	};

	const validateForm = () => {
		const newErrors = {
			current_password: "",
			new_password: "",
			confirm_new_password: "",
		};

		if (!passwords.current_password) {
			newErrors.current_password = t("profile.currentPasswordRequired") || "Current password is required";
		}

		if (!passwords.new_password) {
			newErrors.new_password = t("profile.newPasswordRequired") || "New password is required";
		} else if (passwords.new_password.length < 6) {
			newErrors.new_password = t("profile.passwordMinLength") || "Password must be at least 6 characters";
		}

		if (!passwords.confirm_new_password) {
			newErrors.confirm_new_password = t("profile.confirmPasswordRequired") || "Please confirm your password";
		} else if (passwords.new_password !== passwords.confirm_new_password) {
			newErrors.confirm_new_password = t("profile.passwordsDoNotMatch") || "Passwords do not match";
		}

		setErrors(newErrors);
		return !Object.values(newErrors).some((error) => error !== "");
	};

	const handlePasswordChange = () => {
		if (!validateForm()) {
			return;
		}

		startPasswordTransition(async () => {
			const response = await changePassword(passwords);

			if (response.success) {
				toast.success(
					response.message || t("profile.passwordUpdatedSuccess") || "Password updated successfully"
				);
				// Clear form
				setPasswords({
					current_password: "",
					new_password: "",
					confirm_new_password: "",
				});
				setErrors({
					current_password: "",
					new_password: "",
					confirm_new_password: "",
				});
			} else {
				toast.error(response.message || t("profile.passwordUpdateFailed") || "Failed to update password");
			}
		});
	};

	const handleInputChange = (
		field: keyof typeof passwords,
		value: string
	) => {
		setPasswords((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("profile.securitySettings") || "Security Settings"}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div>
					<h3 className="font-medium mb-3">{t("profile.changePassword") || "Change Password"}</h3>
					<div className="space-y-3">
						<div>
							<Label htmlFor="current_password">
								{t("profile.currentPassword") || "Current Password"}
							</Label>
							<Input
								id="current_password"
								type="password"
								placeholder={t("profile.currentPasswordPlaceholder") || "Current Password"}
								value={passwords.current_password}
								onChange={(e) =>
									handleInputChange(
										"current_password",
										e.target.value
									)
								}
								className={
									errors.current_password
										? "border-destructive"
										: ""
								}
							/>
							{errors.current_password && (
								<p className="text-sm text-destructive mt-1">
									{errors.current_password}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="new_password">{t("profile.newPassword") || "New Password"}</Label>
							<Input
								id="new_password"
								type="password"
								placeholder={t("profile.newPasswordPlaceholder") || "New Password"}
								value={passwords.new_password}
								onChange={(e) =>
									handleInputChange(
										"new_password",
										e.target.value
									)
								}
								className={
									errors.new_password
										? "border-destructive"
										: ""
								}
							/>
							{errors.new_password && (
								<p className="text-sm text-destructive mt-1">
									{errors.new_password}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="confirm_new_password">
								{t("profile.confirmNewPassword") || "Confirm New Password"}
							</Label>
							<Input
								id="confirm_new_password"
								type="password"
								placeholder={t("profile.confirmNewPasswordPlaceholder") || "Confirm New Password"}
								value={passwords.confirm_new_password}
								onChange={(e) =>
									handleInputChange(
										"confirm_new_password",
										e.target.value
									)
								}
								className={
									errors.confirm_new_password
										? "border-destructive"
										: ""
								}
							/>
							{errors.confirm_new_password && (
								<p className="text-sm text-destructive mt-1">
									{errors.confirm_new_password}
								</p>
							)}
						</div>

						<Button
							onClick={handlePasswordChange}
							disabled={passwordLoading}
						>
							{passwordLoading
								? t("profile.updating") || "Updating..."
								: t("profile.updatePassword") || "Update Password"}
						</Button>
					</div>
				</div>

				<Separator />

				<div>
					<h3 className="font-medium mb-3 text-destructive">
						{t("profile.dangerZone") || "Danger Zone"}
					</h3>
					<div className="space-y-3">
						<Button
							variant="outline"
							className="w-full flex items-center gap-2"
							onClick={handleLogout}
							disabled={loading}
						>
							<LogOut className="w-4 h-4" />
							{loading ? t("profile.signingOut") || "Signing out..." : t("profile.signOut") || "Sign Out"}
						</Button>
						<Button variant="destructive" className="w-full">
							{t("profile.deleteAccount") || "Delete Account"}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
