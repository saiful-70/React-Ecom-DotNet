import { Button } from "@/components/shared/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/shared/ui/card";
import { MailIcon, PhoneIcon, UserIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { Label } from "@/components/shared/ui/label";
import { Input } from "@/components/shared/ui/input";
import { UserMiniProfileModel } from "@/(app-routes)/(auth)/model";
import { updateUserProfile } from "../actions";
import { toast } from "@/components/shared/ui/sonner";
import { useTranslation } from "react-i18next";

type Props = {
	model: UserMiniProfileModel;
	isEditing?: boolean;
	onEditComplete?: () => void;
};

export default function PersonalInfo({ model, isEditing = false, onEditComplete }: Props) {
	const [loading, startTransition] = useTransition();
	const { t } = useTranslation();
	const [formData, setFormData] = useState({
		name: model.name || "",
		email: model.email || "",
		phone: model.phone || "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};
	const handleSaveProfile = async () => {
		startTransition(async () => {
			const response = await updateUserProfile(formData);
			if (!response.success) {
				toast.error(
					response.error?.message ||
					response.message ||
					t("profile.profileUpdateFailed") || "Failed to update profile"
				);
			} else {
				toast.success(t("profile.profileUpdatedSuccess") || "Profile updated successfully");
				onEditComplete?.();
			}
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<UserIcon className="w-5 h-5" />
					{t("profile.personalInfo") || "Personal Information"}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{isEditing ? (
					<>
						<div className="space-y-2">
							<Label htmlFor="name">{t("profile.fullName") || "Full Name"}</Label>
							<Input
								id="name"
								name="name"
								value={formData.name}
								onChange={handleChange}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">{t("profile.email") || "Email"}</Label>
							<Input
								id="email"
								name="email"
								type="email"
								value={formData.email}
								onChange={handleChange}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="phone">{t("profile.phone") || "Phone"}</Label>
							<Input
								id="phone"
								name="phone"
								value={formData.phone}
								onChange={handleChange}
							/>
						</div>
						<Button
							onClick={handleSaveProfile}
							className="w-full"
							disabled={loading}
						>
							{loading ? t("profile.saving") || "Saving..." : t("profile.saveChanges") || "Save Changes"}
						</Button>
					</>
				) : (
					<>
						<div className="flex items-center gap-3">
							<MailIcon className="w-4 h-4 text-muted-foreground" />
							<span>{model?.email || t("profile.notAvailable") || "N/A"}</span>
						</div>
						<div className="flex items-center gap-3">
							<PhoneIcon className="w-4 h-4 text-muted-foreground" />
							<span>{model?.phone || t("profile.notAvailable") || "N/A"}</span>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
