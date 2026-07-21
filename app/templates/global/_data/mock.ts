import type { Product } from "@/(app-routes)/products/model";

/**
 * Synthetic/heuristic data for homepage sections that have no backend endpoint
 * yet. Everything here is documented in the API contract
 * (docs/superpowers/specs/2026-07-20-global-storefront-api-contract.md) so the
 * backend can replace each helper with a real response. No real customer data.
 */

/**
 * MOCK — Flash-deal countdown target. There is no `flash_deal.ends_at` from the
 * backend today, so we count down to the end of the current day (local time).
 * Replace with the real campaign end timestamp when `GET /flash-deal` lands.
 */
export function getFlashDealEnd(now: Date): Date {
	const end = new Date(now);
	end.setHours(23, 59, 59, 999);
	// If today's window already elapsed, roll to the end of tomorrow.
	if (end.getTime() <= now.getTime()) {
		end.setDate(end.getDate() + 1);
	}
	return end;
}

/**
 * HEURISTIC — "Deal of the Day" single product. No dedicated endpoint exists,
 * so we surface the largest-absolute-discount product from a provided list
 * (typically today's deals or featured). Replace with `GET /deal-of-the-day`.
 */
export function pickDealOfDay(products: Product[]): Product | null {
	if (products.length === 0) return null;
	return products.reduce((best, current) => {
		const bestSave = best.price - best.discounted_price;
		const currentSave = current.price - current.discounted_price;
		return currentSave > bestSave ? current : best;
	}, products[0]);
}
