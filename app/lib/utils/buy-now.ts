/**
 * "Buy Now" express-checkout scoping.
 *
 * Buy Now adds the chosen line to the cart (as normal) but sends the shopper to
 * a checkout scoped to just that line via `?only=<id>&ov=<variant_id>`. Checkout
 * shows/charges only the scoped line and, on success, removes only that line —
 * the rest of the cart is left untouched.
 *
 * A line's identity mirrors the cart reducer: `id` plus optional `variant_id`
 * (bundle/combo lines use `variant_id = bundle_tier_id`).
 *
 * If the shopper already had this exact line in their cart, `addToCart` MERGES
 * the Buy Now quantity into the existing quantity (same as a normal Add to
 * Cart) — that's cart identity working as designed, not a bug to route around.
 * The `bnq` param instead lets checkout know how much of that merged line is
 * the *Buy Now* portion, so it can display/charge just that amount and, on
 * success, restore the pre-existing quantity instead of deleting the whole
 * line. See `CheckoutPage`'s `onlyId` handling for the display + cleanup side.
 */

export const BUY_NOW_ID_PARAM = "only";
export const BUY_NOW_VARIANT_PARAM = "ov";
export const BUY_NOW_QTY_PARAM = "bnq";

/** Build a checkout href scoped to a single just-added cart line. */
export function buyNowCheckoutHref(
	id: number,
	variantId?: number | null,
	quantity?: number | null
): string {
	const params = new URLSearchParams();
	params.set(BUY_NOW_ID_PARAM, String(id));
	if (variantId != null) params.set(BUY_NOW_VARIANT_PARAM, String(variantId));
	if (quantity != null && Number.isFinite(quantity) && quantity > 0) {
		params.set(BUY_NOW_QTY_PARAM, String(Math.floor(quantity)));
	}
	return `/checkout?${params.toString()}`;
}

/** Parse the `bnq` param into a positive integer, or `null` when absent/invalid. */
export function parseBuyNowQuantity(raw: string | null): number | null {
	if (!raw) return null;
	const n = parseInt(raw, 10);
	return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Whether a cart line falls within the current `?only=&ov=` scope. Returns true
 * when no scope is set (normal full-cart checkout).
 */
export function matchesBuyNowScope(
	line: { id: number; variant_id?: number | null },
	onlyId: string | null,
	onlyVariant: string | null
): boolean {
	if (!onlyId) return true;
	if (String(line.id) !== onlyId) return false;
	const lineVariant = line.variant_id == null ? "" : String(line.variant_id);
	return lineVariant === (onlyVariant ?? "");
}
