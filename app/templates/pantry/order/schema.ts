import { z } from "zod";

/**
 * Order contract for the pantry world's inline cash-on-delivery form.
 *
 * This lives in a PLAIN module, not in the `"use server"` action file: Next.js
 * rejects any non-async export from a `"use server"` module at build time, so a
 * zod schema declared there would fail the production build (and `tsc` would
 * not catch it).
 */

/**
 * BD mobile numbers as customers type them: 11 digits starting 01, optionally
 * prefixed +88/88. Normalised to the local 01XXXXXXXXX form before sending.
 */
const BD_PHONE = /^(?:\+?88)?01[3-9]\d{8}$/;

export const PantryOrderSchema = z.object({
	productId: z.number().int().positive(),
	variantId: z.number().int().positive().optional(),
	quantity: z.number().int().min(1).max(99),
	/** Client-side price, used only as a fallback if re-pricing is unavailable. */
	fallbackPrice: z.number().nonnegative(),
	name: z.string().trim().min(2, "পুরো নাম লিখুন").max(200),
	phone: z
		.string()
		.trim()
		.regex(BD_PHONE, "১১ ডিজিটের সঠিক মোবাইল নম্বর দিন (যেমন ০১৭XXXXXXXX)"),
	address: z
		.string()
		.trim()
		.min(10, "বাসা/রোড/এলাকা সহ সম্পূর্ণ ঠিকানা লিখুন")
		.max(500),
	cityId: z.number().int().positive({ message: "ডেলিভারি এলাকা বাছুন" }),
	/** The city NAME, which is what the backend stores (not the id). */
	cityName: z.string().trim().min(1).max(500),
	notes: z.string().trim().max(1000).optional(),
});

export type PantryOrderInput = z.infer<typeof PantryOrderSchema>;

export interface PantryOrderResult {
	success: boolean;
	/** Order tracking number / number / id, whichever the backend returned. */
	orderRef?: string;
	/** Charged delivery fee, so the confirmation can restate it. */
	shippingCost?: number;
	/** Unit price actually ordered at. */
	unitPrice?: number;
	error?: string;
	/** Per-field messages, keyed by the schema field name. */
	fieldErrors?: Partial<Record<keyof PantryOrderInput, string>>;
}
