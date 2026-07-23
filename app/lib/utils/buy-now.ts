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
 */

export const BUY_NOW_ID_PARAM = "only";
export const BUY_NOW_VARIANT_PARAM = "ov";

/** Build a checkout href scoped to a single just-added cart line. */
export function buyNowCheckoutHref(
	id: number,
	variantId?: number | null
): string {
	const params = new URLSearchParams();
	params.set(BUY_NOW_ID_PARAM, String(id));
	if (variantId != null) params.set(BUY_NOW_VARIANT_PARAM, String(variantId));
	return `/checkout?${params.toString()}`;
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
