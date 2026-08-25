"use client";

import { useEffect, useMemo, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useForm } from "react-hook-form";
import type { FieldErrors, Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
	CheckCircle2,
	Loader2,
	Minus,
	PackageCheck,
	Phone,
	Plus,
	Truck,
	Wallet,
} from "lucide-react";
import { z } from "zod";
import Price from "@/components/shared/Price";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { useCities } from "@/hooks/use-cities";
import { deliveryCityAtom } from "@/store/delivery-city.atom";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { cn } from "@/lib/utils/utils";
import type { Product } from "@/(app-routes)/products/model";
import { placePantryOrder } from "@/templates/pantry/order/action";
import type { PantryOrderResult } from "@/templates/pantry/order/schema";
import type { PackOption } from "../lib";
import "../pantry.css";

/**
 * The conversion spine of the pantry world.
 *
 * A Bengali single-brand food shop is not bought through a cart. The shopper
 * decides on the jar in front of them and wants to be done in one screen, so
 * this form places a cash-on-delivery order for THIS product — no cart, no
 * /checkout, no account. Everything the shopper must know before committing is
 * printed ABOVE the button, delivery charge included: an order button that
 * hides the fee is the reason parcels get refused at the door.
 *
 * Audit note: this is a second order-creating path. It sends exactly the
 * payload `placePantryOrder` defines and keeps no local order record of its
 * own, so the backend's order table and its audit trail stay the single source
 * of truth for what was ordered.
 */

/** 11 digits starting 01, optionally +88-prefixed. Mirrors the action. */
const BD_PHONE = /^(?:\+?88)?01[3-9]\d{8}$/;

interface OrderFormValues {
	name: string;
	phone: string;
	cityId: string;
	address: string;
	notes: string;
}

interface PantryOrderFormProps {
	product: Product;
	/** Pack rail options; an empty array renders no rail at all. */
	packs: PackOption[];
	selectedPackId: number | null;
	onSelectPack: (variantId: number) => void;
	/** Price charged for one unit of the current selection. */
	unitPrice: number;
	/** Stock ceiling for the current selection (already clamped to 99). */
	maxQuantity: number;
	soldOut: boolean;
	/** DOM id, so the sticky bar can observe and focus this block. */
	id?: string;
	className?: string;
}

/** `/cities` returns shipping_cost as a number, a string, or not at all. */
function toRate(value: number | string | null | undefined): number | null {
	if (value === null || value === undefined || value === "") return null;
	const parsed = typeof value === "string" ? Number(value) : value;
	return Number.isFinite(parsed) ? parsed : null;
}

export function PantryOrderForm({
	product,
	packs,
	selectedPackId,
	onSelectPack,
	unitPrice,
	maxQuantity,
	soldOut,
	id = "pantry-order-form",
	className,
}: PantryOrderFormProps) {
	const { t } = useTranslation();
	const cities = useCities();
	const settings = useAtomValue(businessSettingsAtom);
	const [deliveryCity, setDeliveryCity] = useAtom(deliveryCityAtom);

	const [quantity, setQuantity] = useState(1);
	const [serverError, setServerError] = useState<string | null>(null);
	const [placed, setPlaced] = useState<PantryOrderResult | null>(null);

	// Every message is authored in Bengali through t(), so a locale switch
	// re-derives the schema rather than shipping English validation to a
	// Bengali shopper.
	const schema = useMemo(
		() =>
			z.object({
				name: z.string().trim().min(2, t("pantry.errName", "পুরো নাম লিখুন")),
				phone: z
					.string()
					.trim()
					.regex(
						BD_PHONE,
						t(
							"pantry.errPhone",
							"১১ ডিজিটের সঠিক মোবাইল নম্বর দিন (যেমন ০১৭XXXXXXXX)",
						),
					),
				cityId: z
					.string()
					.refine(
						(value) => Number(value) > 0,
						t("pantry.errCity", "ডেলিভারি এলাকা বাছুন"),
					),
				address: z
					.string()
					.trim()
					.min(
						10,
						t("pantry.errAddress", "বাসা/রোড/এলাকা সহ সম্পূর্ণ ঠিকানা লিখুন"),
					),
				notes: z
					.string()
					.trim()
					.max(1000, t("pantry.errNotes", "নোট একটু ছোট করুন")),
			}),
		[t],
	);

	// The project has no @hookform/resolvers dependency, so the zod schema is
	// bridged to react-hook-form by hand rather than by adding a package.
	const resolver = useMemo<Resolver<OrderFormValues>>(
		() => (values) => {
			const parsed = schema.safeParse(values);
			if (parsed.success) return { values, errors: {} };
			const errors: Record<string, { type: string; message: string }> = {};
			for (const issue of parsed.error.issues) {
				const key = issue.path[0];
				if (typeof key === "string" && !errors[key]) {
					errors[key] = { type: issue.code, message: issue.message };
				}
			}
			return {
				values: {},
				errors: errors as FieldErrors<OrderFormValues>,
			};
		},
		[schema],
	);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		setError,
		getValues,
		formState: { errors, isSubmitting },
	} = useForm<OrderFormValues>({
		resolver,
		mode: "onSubmit",
		defaultValues: { name: "", phone: "", cityId: "", address: "", notes: "" },
	});

	const cityIdValue = watch("cityId");

	// A zone chosen on another page (or by the shared PDP selector) carries
	// over, so nobody picks their own district twice in one session.
	useEffect(() => {
		if (!deliveryCity || getValues("cityId")) return;
		if (!cities.some((city) => city.id === deliveryCity.cityId)) return;
		setValue("cityId", String(deliveryCity.cityId));
	}, [cities, deliveryCity, getValues, setValue]);

	// Stock (or a pack switch) can shrink the ceiling under the current count.
	useEffect(() => {
		setQuantity((current) => Math.min(Math.max(current, 1), maxQuantity || 1));
	}, [maxQuantity]);

	const selectedCity = cities.find((city) => String(city.id) === cityIdValue);
	const deliveryRate = selectedCity ? toRate(selectedCity.shipping_cost) : null;
	const subtotal = unitPrice * quantity;
	const phoneField = register("phone");

	const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const value = event.target.value;
		setValue("cityId", value, { shouldValidate: Boolean(errors.cityId) });
		const city = cities.find((row) => String(row.id) === value);
		if (!city) return;
		setDeliveryCity({
			value: city.name,
			cityId: city.id,
			rate: toRate(city.shipping_cost) ?? 0,
		});
	};

	const onSubmit = async (values: OrderFormValues) => {
		setServerError(null);
		const city = cities.find((row) => String(row.id) === values.cityId);
		if (!city) {
			setError("cityId", {
				message: t("pantry.errCity", "ডেলিভারি এলাকা বাছুন"),
			});
			return;
		}

		const result = await placePantryOrder({
			productId: product.id,
			...(selectedPackId ? { variantId: selectedPackId } : {}),
			quantity,
			fallbackPrice: unitPrice,
			name: values.name.trim(),
			phone: values.phone.trim(),
			address: values.address.trim(),
			cityId: city.id,
			// The backend stores the city NAME, not the id — both travel.
			cityName: city.name,
			...(values.notes.trim() ? { notes: values.notes.trim() } : {}),
		});

		if (result.success) {
			setPlaced(result);
			return;
		}

		// Server-side field messages land on the inputs that caused them; the
		// fields with no visible control fall back to the error beside the button.
		const fieldErrors = result.fieldErrors ?? {};
		let mapped = false;
		if (fieldErrors.name) {
			setError("name", { message: fieldErrors.name });
			mapped = true;
		}
		if (fieldErrors.phone) {
			setError("phone", { message: fieldErrors.phone });
			mapped = true;
		}
		if (fieldErrors.address) {
			setError("address", { message: fieldErrors.address });
			mapped = true;
		}
		if (fieldErrors.notes) {
			setError("notes", { message: fieldErrors.notes });
			mapped = true;
		}
		if (fieldErrors.cityId || fieldErrors.cityName) {
			setError("cityId", {
				message:
					fieldErrors.cityId ??
					fieldErrors.cityName ??
					t("pantry.errCity", "ডেলিভারি এলাকা বাছুন"),
			});
			mapped = true;
		}
		if (!mapped || result.error) {
			setServerError(
				result.error ??
					t(
						"pantry.orderFailed",
						"অর্ডার নেওয়া যায়নি। আবার চেষ্টা করুন বা ফোনে অর্ডার করুন।",
					),
			);
		}
	};

	/* ------------------------------------------------------------------ */
	/* Confirmation — the form is replaced, never silently navigated away  */
	/* ------------------------------------------------------------------ */
	if (placed?.success) {
		return (
			<div
				id={id}
				className={cn(
					"rounded-lg border border-primary/30 bg-muted p-5 md:p-6",
					className,
				)}
				role="status"
				aria-live="polite"
			>
				<div className="flex items-start gap-3">
					<CheckCircle2
						className="mt-0.5 h-6 w-6 shrink-0 text-success"
						aria-hidden
					/>
					<div className="min-w-0">
						<h3 className="font-display text-2xl leading-snug text-foreground">
							{t("pantry.orderPlaced", "অর্ডার নেওয়া হয়েছে")}
						</h3>
						<p className="mt-2 text-base text-success">
							{t("pantry.willConfirmByPhone", "আমরা ফোনে কনফার্ম করব")}
						</p>
					</div>
				</div>

				<dl className="mt-5 space-y-2 border-t border-border pt-4 text-base">
					{placed.orderRef ? (
						<div className="flex items-baseline justify-between gap-4">
							<dt className="text-muted-foreground">
								{t("pantry.orderRef", "অর্ডার নম্বর")}
							</dt>
							<dd className="font-display text-lg tabular-nums text-foreground">
								{placed.orderRef}
							</dd>
						</div>
					) : (
						// No reference came back: say so. A made-up number is worse
						// than none when the shopper phones about it.
						<p className="text-muted-foreground">
							{t(
								"pantry.noOrderRef",
								"অর্ডার নম্বর এখনই দেখানো যাচ্ছে না। কনফার্মেশন কলে আমরা নম্বরটি জানিয়ে দেব।",
							)}
						</p>
					)}
					{typeof placed.shippingCost === "number" && (
						<div className="flex items-baseline justify-between gap-4">
							<dt className="text-muted-foreground">
								{t("pantry.deliveryCharge", "ডেলিভারি চার্জ")}
							</dt>
							<dd className="tabular-nums text-foreground">
								{placed.shippingCost > 0 ? (
									<Price amount={placed.shippingCost} />
								) : (
									t("pantry.freeDelivery", "ফ্রি ডেলিভারি")
								)}
							</dd>
						</div>
					)}
				</dl>

				<div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
					<Link
						href={ABSOLUTE_ROUTES.ORDERS}
						className="ring-warm-focus inline-flex min-h-[3rem] items-center rounded-lg bg-primary px-5 font-display text-base text-primary-foreground transition-colors hover:bg-primary/90"
					>
						{t("pantry.viewOrderStatus", "অর্ডারের অবস্থা দেখুন")}
					</Link>
					{settings?.contact_phone && (
						<a
							href={`tel:${settings.contact_phone}`}
							className="ring-warm-focus inline-flex items-center gap-1.5 text-base font-semibold text-primary"
						>
							<Phone className="h-4 w-4" aria-hidden />
							{t("pantry.callUs", "আমাদের ফোন করুন")}
						</a>
					)}
				</div>
			</div>
		);
	}

	/* ------------------------------------------------------------------ */
	/* The form                                                            */
	/* ------------------------------------------------------------------ */
	return (
		<form
			id={id}
			noValidate
			onSubmit={handleSubmit(onSubmit)}
			className={cn(
				"rounded-lg border border-border bg-muted p-5 md:p-6",
				className,
			)}
			aria-labelledby={`${id}-title`}
		>
			<h2
				id={`${id}-title`}
				className="font-display text-2xl leading-snug text-foreground md:text-3xl"
			>
				{t("pantry.orderFormTitle", "ঘরে বসে অর্ডার করুন")}
			</h2>
			<p className="mt-1.5 text-base text-muted-foreground">
				{t(
					"pantry.orderFormHint",
					"নিচের তথ্য দিন — পণ্য হাতে পেয়ে টাকা দেবেন।",
				)}
			</p>

			{/* Pack rail: a pantry sells one good in several weights, read across
			    tiles rather than hidden in a dropdown. */}
			{packs.length > 0 && (
				<fieldset className="mt-6">
					<legend className="text-base font-semibold text-foreground">
						{t("pantry.packSize", "পরিমাণ বাছুন")}
					</legend>
					<div className="mt-2.5 flex flex-wrap gap-2">
						{packs.map((pack) => {
							const isSelected = pack.variantId === selectedPackId;
							return (
								<button
									key={pack.variantId}
									type="button"
									disabled={!pack.inStock}
									aria-pressed={isSelected}
									onClick={() => onSelectPack(pack.variantId)}
									className={cn(
										"pn-pack ring-warm-focus flex min-h-[3.25rem] min-w-[7.5rem] flex-col items-start justify-center gap-0.5 rounded-lg border px-4 py-2 text-left",
										isSelected
											? "border-primary bg-primary text-primary-foreground"
											: "border-border bg-background text-foreground hover:border-primary",
										!pack.inStock &&
											"cursor-not-allowed opacity-50 hover:border-border",
									)}
								>
									<span className="font-display text-base leading-tight">
										{pack.label}
									</span>
									<span className="text-sm font-semibold tabular-nums">
										<Price amount={pack.price} />
									</span>
									{!pack.inStock && (
										<span className="text-xs">
											{t("pantry.packSoldOut", "স্টকে নেই")}
										</span>
									)}
								</button>
							);
						})}
					</div>
				</fieldset>
			)}

			{/* Quantity */}
			<div className="mt-6">
				<span
					id={`${id}-qty-label`}
					className="text-base font-semibold text-foreground"
				>
					{t("pantry.quantity", "সংখ্যা")}
				</span>
				<div className="mt-2.5 flex items-center gap-1">
					<button
						type="button"
						onClick={() => setQuantity((q) => Math.max(1, q - 1))}
						disabled={quantity <= 1}
						aria-label={t("pantry.decrease", "সংখ্যা কমান")}
						className="ring-warm-focus flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:border-primary disabled:opacity-45"
					>
						<Minus className="h-4 w-4" aria-hidden />
					</button>
					<output
						aria-labelledby={`${id}-qty-label`}
						className="flex h-11 w-14 items-center justify-center text-base font-semibold tabular-nums text-foreground"
					>
						{quantity}
					</output>
					<button
						type="button"
						onClick={() =>
							setQuantity((q) => Math.min(Math.min(maxQuantity, 99), q + 1))
						}
						disabled={quantity >= Math.min(maxQuantity, 99)}
						aria-label={t("pantry.increase", "সংখ্যা বাড়ান")}
						className="ring-warm-focus flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:border-primary disabled:opacity-45"
					>
						<Plus className="h-4 w-4" aria-hidden />
					</button>
				</div>
			</div>

			{/* Who and where. Phone is the identity key for a BD COD order. */}
			<div className="mt-6 space-y-4">
				{/* Name and phone pair up from `sm` so the order button lands
				    inside the first desktop viewport rather than below it. */}
				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<label
							htmlFor={`${id}-name`}
							className="block text-base font-semibold text-foreground"
						>
							{t("pantry.name", "আপনার নাম")}
						</label>
						<input
							id={`${id}-name`}
							type="text"
							autoComplete="name"
							aria-invalid={Boolean(errors.name)}
							aria-describedby={errors.name ? `${id}-name-error` : undefined}
							placeholder={t("pantry.namePlaceholder", "যেমন: রহিম উদ্দিন")}
							className="ring-warm-focus mt-1.5 block h-12 w-full rounded-lg border border-input bg-background px-3.5 text-base text-foreground placeholder:text-muted-foreground/70"
							{...register("name")}
						/>
						{errors.name && (
							<p
								id={`${id}-name-error`}
								className="mt-1.5 text-sm font-semibold text-destructive"
							>
								{errors.name.message}
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor={`${id}-phone`}
							className="block text-base font-semibold text-foreground"
						>
							{t("pantry.phone", "মোবাইল নম্বর")}
						</label>
						<input
							id={`${id}-phone`}
							type="tel"
							inputMode="tel"
							autoComplete="tel"
							maxLength={14}
							aria-invalid={Boolean(errors.phone)}
							aria-describedby={errors.phone ? `${id}-phone-error` : undefined}
							placeholder={t("pantry.phonePlaceholder", "01XXXXXXXXX")}
							className="ring-warm-focus mt-1.5 block h-12 w-full rounded-lg border border-input bg-background px-3.5 text-base tabular-nums text-foreground placeholder:text-muted-foreground/70"
							{...phoneField}
							onChange={(event) => {
								// Keep only what a BD number can contain, so a pasted
								// "+88 017-..." validates instead of failing on punctuation.
								event.target.value = event.target.value
									.replace(/[^\d+]/g, "")
									.slice(0, 14);
								void phoneField.onChange(event);
							}}
						/>
						{errors.phone && (
							<p
								id={`${id}-phone-error`}
								className="mt-1.5 text-sm font-semibold text-destructive"
							>
								{errors.phone.message}
							</p>
						)}
					</div>
				</div>

				<div>
					<label
						htmlFor={`${id}-city`}
						className="block text-base font-semibold text-foreground"
					>
						{t("pantry.deliveryArea", "ডেলিভারি এলাকা")}
					</label>
					<select
						id={`${id}-city`}
						aria-invalid={Boolean(errors.cityId)}
						aria-describedby={errors.cityId ? `${id}-city-error` : undefined}
						className="ring-warm-focus mt-1.5 block h-12 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground"
						value={cityIdValue}
						onChange={handleCityChange}
					>
						<option value="">{t("pantry.selectArea", "এলাকা বাছুন")}</option>
						{cities.map((city) => (
							<option key={city.id} value={String(city.id)}>
								{city.name}
							</option>
						))}
					</select>
					{errors.cityId && (
						<p
							id={`${id}-city-error`}
							className="mt-1.5 text-sm font-semibold text-destructive"
						>
							{errors.cityId.message}
						</p>
					)}
				</div>

				<div>
					<label
						htmlFor={`${id}-address`}
						className="block text-base font-semibold text-foreground"
					>
						{t("pantry.address", "সম্পূর্ণ ঠিকানা")}
					</label>
					<textarea
						id={`${id}-address`}
						rows={3}
						autoComplete="street-address"
						aria-invalid={Boolean(errors.address)}
						aria-describedby={
							errors.address ? `${id}-address-error` : undefined
						}
						placeholder={t("pantry.addressPlaceholder", "বাসা/রোড/এলাকা, থানা")}
						className="ring-warm-focus mt-1.5 block w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-base leading-relaxed text-foreground placeholder:text-muted-foreground/70"
						{...register("address")}
					/>
					{errors.address && (
						<p
							id={`${id}-address-error`}
							className="mt-1.5 text-sm font-semibold text-destructive"
						>
							{errors.address.message}
						</p>
					)}
				</div>

				{/* The note is genuinely optional, so it starts closed: folded
				    away it keeps the order button inside the first desktop
				    viewport, and a native <details> stays keyboard-operable
				    and needs no state. */}
				<details className="group">
					<summary
						className="ring-warm-focus inline-flex min-h-11 cursor-pointer list-none items-center text-base font-semibold text-primary underline-offset-4 hover:underline"
						aria-controls={`${id}-notes`}
					>
						{t("pantry.notes", "কিছু বলার থাকলে (না দিলেও চলবে)")}
					</summary>
					<label htmlFor={`${id}-notes`} className="sr-only">
						{t("pantry.notes", "কিছু বলার থাকলে (না দিলেও চলবে)")}
					</label>
					<textarea
						id={`${id}-notes`}
						rows={2}
						aria-invalid={Boolean(errors.notes)}
						aria-describedby={errors.notes ? `${id}-notes-error` : undefined}
						placeholder={t("pantry.notesPlaceholder", "যেমন: বিকেলে ফোন করুন")}
						className="ring-warm-focus mt-1.5 block w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-base leading-relaxed text-foreground placeholder:text-muted-foreground/70"
						{...register("notes")}
					/>
					{errors.notes && (
						<p
							id={`${id}-notes-error`}
							className="mt-1.5 text-sm font-semibold text-destructive"
						>
							{errors.notes.message}
						</p>
					)}
				</details>
			</div>

			{/* The bill, BEFORE the button. Nothing is guessed: with no area
			    chosen yet the delivery row simply does not exist. */}
			<dl className="mt-6 space-y-2 border-t border-border pt-4 text-base">
				<div className="flex items-baseline justify-between gap-4">
					<dt className="text-muted-foreground">
						{t("pantry.itemTotal", "পণ্যের দাম")}
					</dt>
					<dd className="tabular-nums text-foreground">
						<Price amount={subtotal} />
					</dd>
				</div>
				{deliveryRate !== null ? (
					<>
						<div className="flex items-baseline justify-between gap-4">
							<dt className="text-muted-foreground">
								{t("pantry.deliveryCharge", "ডেলিভারি চার্জ")}
							</dt>
							<dd className="tabular-nums text-foreground">
								{deliveryRate > 0 ? (
									<Price amount={deliveryRate} />
								) : (
									t("pantry.freeDelivery", "ফ্রি ডেলিভারি")
								)}
							</dd>
						</div>
						<div className="flex items-baseline justify-between gap-4 border-t border-border pt-2">
							<dt className="font-display text-lg text-foreground">
								{t("pantry.payableTotal", "সর্বমোট")}
							</dt>
							<dd className="text-xl font-bold tabular-nums text-primary">
								<Price amount={subtotal + deliveryRate} />
							</dd>
						</div>
					</>
				) : (
					<p className="text-sm text-muted-foreground">
						{t("pantry.pickAreaForCharge", "ডেলিভারি চার্জ দেখতে এলাকা বাছুন")}
					</p>
				)}
			</dl>

			<button
				type="submit"
				disabled={isSubmitting || soldOut}
				className="ring-warm-focus mt-5 flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 font-display text-lg text-primary-foreground shadow-warm-md transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 md:text-xl"
			>
				{isSubmitting ? (
					<>
						<Loader2 className="h-5 w-5 animate-spin" aria-hidden />
						{t("pantry.placingOrder", "অর্ডার পাঠানো হচ্ছে…")}
					</>
				) : soldOut ? (
					t("pantry.soldOut", "এখন স্টকে নেই")
				) : (
					<>
						<PackageCheck className="h-5 w-5" aria-hidden />
						{t("pantry.confirmOrder", "অর্ডার কনফার্ম করুন")}
					</>
				)}
			</button>

			{serverError && (
				<div
					role="alert"
					className="mt-3 rounded-lg border border-destructive/40 bg-background p-3"
				>
					<p className="text-base font-semibold text-destructive">
						{serverError}
					</p>
					{settings?.contact_phone && (
						<a
							href={`tel:${settings.contact_phone}`}
							className="ring-warm-focus mt-2 inline-flex items-center gap-1.5 text-base font-semibold text-primary"
						>
							<Phone className="h-4 w-4" aria-hidden />
							{t("pantry.orderByPhone", "অথবা ফোনে অর্ডার করুন")}
							<span className="tabular-nums">{settings.contact_phone}</span>
						</a>
					)}
				</div>
			)}

			{/* The two promises that carry a COD order, in the trust green. */}
			<ul className="mt-4 space-y-1.5 text-base font-semibold text-success">
				<li className="flex items-start gap-2">
					<Wallet className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
					{t("pantry.codOnDelivery", "পণ্য হাতে পেয়ে টাকা দিন")}
				</li>
				<li className="flex items-start gap-2">
					<Truck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
					{t("pantry.willConfirmByPhone", "আমরা ফোনে কনফার্ম করব")}
				</li>
			</ul>
		</form>
	);
}
