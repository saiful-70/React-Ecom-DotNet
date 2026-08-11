/**
 * Delivery constants. City names and per-city delivery charges are NOT kept
 * here — they come from the backend (`GET /cities?country_id=` and
 * `GET /shipping-cost?country_id=&city_id=`, see FRONTEND_API_DOCUMENTATION.md
 * §7). Only the country anchor and the global template's demo flat rate live
 * client-side.
 */

/** Bangladesh's `country_id` in the backend's country/city tables. */
export const BANGLADESH_COUNTRY_ID = 2;

/**
 * International (global template) shipping: a flat standard rate, free over a
 * threshold. Demo defaults in the store's display currency — replace with a
 * real per-country shipping API (see the storefront API contract) when ready.
 */
export const INTL_SHIPPING = {
	flat: 10,
	freeOver: 100,
} as const;

export const getGlobalDeliveryCharge = (subtotal: number): number =>
	subtotal >= INTL_SHIPPING.freeOver ? 0 : INTL_SHIPPING.flat;
