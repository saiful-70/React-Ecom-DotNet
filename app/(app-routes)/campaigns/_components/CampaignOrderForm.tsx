"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, ShieldCheck, ShoppingBag } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/shared/ui/radio-group";
import { Textarea } from "@/components/shared/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import Price from "@/components/shared/Price";
import { toast } from "@/components/shared/ui/sonner";
import type { CampaignConfig } from "../_data/types";

interface Props {
	campaign: CampaignConfig;
}

type DeliveryArea = "dhaka" | "outside";

const SHIPPING_COSTS: Record<DeliveryArea, number> = {
	dhaka: 60,
	outside: 120,
};

export function CampaignOrderForm({ campaign }: Props) {
	const router = useRouter();
	const { addToCart, clearCart } = useCart();
	const [submitting, setSubmitting] = useState(false);

	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [address, setAddress] = useState("");
	const [area, setArea] = useState<DeliveryArea>("dhaka");

	const { product } = campaign;
	const subtotal = product.offerPrice;
	const shipping = SHIPPING_COSTS[area];
	const total = subtotal + shipping;

	const isValid = useMemo(() => {
		return (
			name.trim().length >= 2 &&
			/^[0-9+\-\s]{10,15}$/.test(phone.trim()) &&
			address.trim().length >= 5
		);
	}, [name, phone, address]);

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!isValid) {
			toast.error("সব তথ্য সঠিকভাবে পূরণ করুন");
			return;
		}
		setSubmitting(true);
		try {
			clearCart();
			addToCart({
				id: product.id,
				name: product.name,
				price: product.offerPrice,
				image: product.image,
				stock: product.stock,
				tax: product.tax ?? 0,
				// Cart tax math only understands include/exclude; the campaign
				// API may send other values (e.g. "amount"), so coerce safely.
				tax_type: product.taxType === "include" ? "include" : "exclude",
				quantity: 1,
			});

			const params = new URLSearchParams({
				campaign: campaign.slug,
				name,
				phone,
				address,
				area,
			});
			router.push(`/checkout?${params.toString()}`);
		} catch (err) {
			console.error("Campaign order error:", err);
			toast.error("কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন");
			setSubmitting(false);
		}
	};

	return (
		<section id="campaign-order" className="py-12 sm:py-16 lg:py-20 scroll-mt-16">
			<div className="container mx-auto px-4 sm:px-6 max-w-3xl">
				<div className="text-center mb-6 sm:mb-8">
					<div className="inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 text-success px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-3">
						<ShieldCheck className="h-3.5 w-3.5" />
						ক্যাশ অন ডেলিভারি
					</div>
					<h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-balance leading-tight">
						অর্ডার নিশ্চিত করুন
					</h2>
					<p className="mt-2 text-sm sm:text-base text-muted-foreground">
						নিচের ফর্মটি পূরণ করুন — কোনো অগ্রিম পেমেন্ট প্রয়োজন নেই
					</p>
				</div>

				<form
					onSubmit={onSubmit}
					className="rounded-2xl sm:rounded-3xl border border-primary/15 shadow-warm-lg bg-card p-5 sm:p-7 lg:p-9 space-y-5"
				>
					<div className="space-y-2">
						<Label htmlFor="name" className="text-sm font-medium">
							আপনার নাম <span className="text-destructive">*</span>
						</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="পূর্ণ নাম লিখুন"
							autoComplete="name"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="phone" className="text-sm font-medium">
							মোবাইল নম্বর <span className="text-destructive">*</span>
						</Label>
						<Input
							id="phone"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							placeholder="01XXXXXXXXX"
							inputMode="tel"
							autoComplete="tel"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="address" className="text-sm font-medium">
							সম্পূর্ণ ঠিকানা <span className="text-destructive">*</span>
						</Label>
						<Textarea
							id="address"
							value={address}
							onChange={(e) => setAddress(e.target.value)}
							placeholder="বাড়ি, রোড, এলাকা, থানা, জেলা"
							rows={3}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label className="text-sm font-medium flex items-center gap-1.5">
							<MapPin className="h-4 w-4 text-primary" />
							ডেলিভারি এলাকা
						</Label>
						<RadioGroup
							value={area}
							onValueChange={(v) => setArea(v as DeliveryArea)}
							className="grid grid-cols-1 sm:grid-cols-2 gap-2"
						>
							{(
								[
									{
										value: "dhaka",
										label: "ঢাকা সিটির ভেতরে",
										cost: SHIPPING_COSTS.dhaka,
									},
									{
										value: "outside",
										label: "ঢাকার বাইরে",
										cost: SHIPPING_COSTS.outside,
									},
								] as const
							).map((opt) => (
								<Label
									key={opt.value}
									htmlFor={`area-${opt.value}`}
									className={`flex items-center justify-between gap-2 rounded-xl border p-3 sm:p-4 cursor-pointer transition-colors ${
										area === opt.value
											? "border-primary bg-primary/5"
											: "border-border hover:border-primary/40"
									}`}
								>
									<div className="flex items-center gap-2">
										<RadioGroupItem
											id={`area-${opt.value}`}
											value={opt.value}
										/>
										<span className="text-sm font-medium">
											{opt.label}
										</span>
									</div>
									<span className="text-sm text-muted-foreground">
										<Price amount={opt.cost} />
									</span>
								</Label>
							))}
						</RadioGroup>
					</div>

					{/* Live total */}
					<div className="rounded-xl bg-muted/60 border border-border/60 p-4 space-y-1.5">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">পণ্যের মূল্য</span>
							<span>
								<Price amount={subtotal} />
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">ডেলিভারি চার্জ</span>
							<span>
								<Price amount={shipping} />
							</span>
						</div>
						<div className="flex justify-between items-baseline pt-2 border-t border-border/60 mt-2">
							<span className="font-medium">সর্বমোট</span>
							<span className="font-display text-xl sm:text-2xl font-bold text-primary">
								<Price amount={total} />
							</span>
						</div>
					</div>

					<Button
						type="submit"
						size="lg"
						disabled={!isValid || submitting}
						className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold shadow-warm-md hover:shadow-warm-lg"
					>
						{submitting ? (
							<>
								<Loader2 className="h-5 w-5 animate-spin mr-2" />
								প্রক্রিয়া চলছে...
							</>
						) : (
							<>
								<ShoppingBag className="h-5 w-5 mr-2" />
								অর্ডার নিশ্চিত করুন
							</>
						)}
					</Button>

					<p className="text-center text-xs text-muted-foreground">
						আপনার তথ্য সুরক্ষিত। আমরা কখনই তৃতীয় পক্ষের সাথে শেয়ার করি না।
					</p>
				</form>
			</div>
		</section>
	);
}
