"use client";

import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/shared/ui/card";
import { Input } from "@/components/shared/ui/input";
import { Textarea } from "@/components/shared/ui/textarea";
import { Label } from "@/components/shared/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/shared/ui/select";
import { Truck, Loader2 } from "lucide-react";
import type { FormData, FormErrors, City } from "@/(app-routes)/checkout/model";
import { getCountries, getCities } from "@/(app-routes)/checkout/action";

interface ShippingAddressFormProps {
	formData: FormData;
	onInputChange: (field: keyof FormData, value: string | number) => void;
	errors?: FormErrors;
}

export function ShippingAddressForm({
	formData,
	onInputChange,
	errors = {},
}: ShippingAddressFormProps) {
	const { t } = useTranslation();
	const [cities, setCities] = useState<City[]>([]);
	const [loadingCities, setLoadingCities] = useState(true);

	// Resolve Bangladesh's country_id once, then load BD cities.
	useEffect(() => {
		let cancelled = false;
		const load = async () => {
			try {
				const countriesRes = await getCountries();
				if (cancelled || !countriesRes.success) return;
				const bd = countriesRes.data.find(
					(c) => c.code === "BD" || c.name === "Bangladesh"
				);
				if (!bd) {
					console.error("Bangladesh not found in countries list");
					return;
				}
				const citiesRes = await getCities(bd.id);
				if (cancelled) return;
				if (citiesRes.success) setCities(citiesRes.data);
			} catch (error) {
				console.error("Failed to load BD location data:", error);
			} finally {
				if (!cancelled) setLoadingCities(false);
			}
		};
		load();
		return () => {
			cancelled = true;
		};
	}, []);

	const handleCityChange = (value: string) => {
		const selectedCity = cities.find((c) => c.id.toString() === value);
		if (selectedCity) {
			onInputChange("cityId", selectedCity.id);
			onInputChange("city", selectedCity.name);
		}
	};

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/\D/g, "").slice(0, 11);
		onInputChange("phone", value);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center">
					<Truck className="w-5 h-5 mr-2" />
					{t("checkout.shippingInfo")}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<Label htmlFor="name" className="flex items-center mb-1">
						{t("checkout.name")}
						<span className="text-red-500">*</span>
					</Label>
					<Input
						id="name"
						placeholder={t("checkout.placeholders.name")}
						value={formData.name}
						onChange={(e) => onInputChange("name", e.target.value)}
						className={errors.name ? "border-red-500" : ""}
					/>
					{errors.name && (
						<p className="text-red-500 text-xs mt-1">
							{t(errors.name)}
						</p>
					)}
				</div>

				<div>
					<Label htmlFor="phone" className="flex items-center mb-1">
						{t("checkout.phone")}
						<span className="text-red-500">*</span>
					</Label>
					<Input
						id="phone"
						inputMode="numeric"
						maxLength={11}
						placeholder={t("checkout.placeholders.phoneBD")}
						value={formData.phone}
						onChange={handlePhoneChange}
						className={errors.phone ? "border-red-500" : ""}
					/>
					{errors.phone && (
						<p className="text-red-500 text-xs mt-1">
							{t(errors.phone)}
						</p>
					)}
				</div>

				<div>
					<Label htmlFor="city" className="flex items-center mb-1">
						{t("checkout.city")}
						<span className="text-red-500">*</span>
					</Label>
					<Select
						disabled={loadingCities || cities.length === 0}
						value={formData.cityId?.toString() || ""}
						onValueChange={handleCityChange}
					>
						<SelectTrigger
							id="city"
							className={`w-full ${errors.city ? "border-red-500" : ""}`}
						>
							{loadingCities ? (
								<span className="flex items-center gap-2">
									<Loader2 className="w-4 h-4 animate-spin" />
									{t("checkout.loading")}
								</span>
							) : (
								<SelectValue
									placeholder={t("checkout.selectCity")}
								/>
							)}
						</SelectTrigger>
						<SelectContent>
							{cities.map((city) => (
								<SelectItem
									key={city.id}
									value={city.id.toString()}
								>
									{city.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{errors.city && (
						<p className="text-red-500 text-xs mt-1">
							{t(errors.city)}
						</p>
					)}
				</div>

				<div>
					<Label htmlFor="address" className="flex items-center mb-1">
						{t("checkout.address")}
						<span className="text-red-500">*</span>
					</Label>
					<Textarea
						id="address"
						rows={3}
						className={`min-h-[96px] ${errors.address ? "border-red-500" : ""}`}
						placeholder={t("checkout.placeholders.address")}
						value={formData.address}
						onChange={(e) => onInputChange("address", e.target.value)}
					/>
					{errors.address && (
						<p className="text-red-500 text-xs mt-1">
							{t(errors.address)}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
