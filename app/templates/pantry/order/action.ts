"use server";

import {
	createPurchaseOrder,
	getCheckoutData,
	getShippingCost,
} from "@/(app-routes)/checkout/action";
import { toLocalBDPhone } from "@/(app-routes)/checkout/helpers/checkout-helpers";
import { BANGLADESH_COUNTRY_ID } from "@/lib/constants/delivery";
import type { PurchaseOrderRequest } from "@/(app-routes)/checkout/model";
import { PantryOrderSchema } from "./schema";
import type { PantryOrderInput, PantryOrderResult } from "./schema";

/**
 * The pantry world's conversion spine: one cash-on-delivery order placed from
 * the product page, without the cart or /checkout.
 *
 * This is a thin, honest wrapper over the SAME backend contract the cart
 * checkout uses (`POST purchase-order`, `payment_method: "cod"`,
 * `country_id` required, `shipping_address.city` as a NAME string) — it does
 * not invent fields or endpoints. What it adds is server-side resolution of
 * the two values a cart checkout would have computed on the client:
 *
 *  1. the item's current price, re-read through `checkout-data` so the order
 *     never carries a stale client price;
 *  2. the delivery charge for the chosen city, read through `shipping-cost`
 *     and waived when the backend's own `free_shipping_over` threshold is met.
 *
 * Audit note: this is a second code path that creates orders. It produces the
 * identical payload shape as the cart path and is validated by the same
 * server-side `PurchaseOrderSchema` inside `createPurchaseOrder`, so the
 * backend's order record and audit trail are unchanged.
 *
 * The schema and result types live in `./schema` because a `"use server"`
 * module may export nothing but async functions.
 */

/**
 * Re-read the unit price from the backend. Returns null when the call fails or
 * the product is missing from the response, in which case the caller falls
 * back to the price the page was rendered with (the backend re-prices server
 * side regardless — see checkout/model.ts).
 */
async function resolveUnitPrice(
	productId: number,
	variantId?: number,
): Promise<number | null> {
	const res = await getCheckoutData([
		{ product_id: productId, ...(variantId ? { variant_id: variantId } : {}) },
	]);
	if (!res.success || !res.data?.products?.length) return null;
	const row = res.data.products.find((p) => p.product_id === productId);
	const price = row?.discount_price;
	return typeof price === "number" && price >= 0 ? price : null;
}

/**
 * Resolve the delivery charge for a city, honouring the backend's own
 * free-shipping threshold against this order's subtotal. Returns null when the
 * shipping API is unreachable — the caller treats that as a hard failure
 * rather than guessing a fee, because an order that undercharges delivery is a
 * dispute at the door.
 */
async function resolveShipping(
	cityId: number,
	subtotal: number,
): Promise<number | null> {
	const res = await getShippingCost(BANGLADESH_COUNTRY_ID, cityId);
	if (!res.success || !res.data) return null;
	const { shipping_cost, free_shipping_over } = res.data;
	if (typeof shipping_cost !== "number") return null;
	const threshold =
		typeof free_shipping_over === "number" && free_shipping_over > 0
			? free_shipping_over
			: null;
	if (threshold !== null && subtotal >= threshold) return 0;
	return shipping_cost;
}

/**
 * Place a single-product cash-on-delivery order from the product page.
 * Never throws: every failure comes back as `{ success: false, error }` so the
 * form can print it beside the button.
 */
export async function placePantryOrder(
	input: PantryOrderInput,
): Promise<PantryOrderResult> {
	const parsed = PantryOrderSchema.safeParse(input);
	if (!parsed.success) {
		const fieldErrors: PantryOrderResult["fieldErrors"] = {};
		for (const issue of parsed.error.issues) {
			const key = issue.path[0] as keyof PantryOrderInput | undefined;
			if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
		}
		return {
			success: false,
			error: "অর্ডারের তথ্য ঠিক করুন",
			fieldErrors,
		};
	}

	const data = parsed.data;
	const unitPrice =
		(await resolveUnitPrice(data.productId, data.variantId)) ??
		data.fallbackPrice;
	const subtotal = unitPrice * data.quantity;

	const shippingCost = await resolveShipping(data.cityId, subtotal);
	if (shippingCost === null) {
		return {
			success: false,
			error:
				"ডেলিভারি চার্জ এখন জানা যাচ্ছে না। একটু পরে আবার চেষ্টা করুন, বা আমাদের ফোন করুন।",
		};
	}

	const payload: PurchaseOrderRequest = {
		items: [
			{
				product_id: data.productId,
				quantity: data.quantity,
				price: unitPrice,
				...(data.variantId ? { variant_id: data.variantId } : {}),
			},
		],
		shipping_address: {
			name: data.name,
			phone: toLocalBDPhone(data.phone),
			address: data.address,
			city: data.cityName,
			country_id: BANGLADESH_COUNTRY_ID,
		},
		payment_method: "cod",
		shipping_method: "standard",
		shipping_cost: shippingCost,
		...(data.notes ? { notes: data.notes } : {}),
	};

	const res = await createPurchaseOrder(payload);
	if (!res.success) {
		return {
			success: false,
			error:
				res.error ||
				res.message ||
				"অর্ডার নেওয়া যায়নি। আবার চেষ্টা করুন বা ফোনে অর্ডার করুন।",
		};
	}

	const ref =
		res.data?.order_tracking_number ||
		res.data?.order_number ||
		(res.data?.order_id != null ? String(res.data.order_id) : "");

	return {
		success: true,
		orderRef: ref || undefined,
		shippingCost,
		unitPrice,
	};
}
