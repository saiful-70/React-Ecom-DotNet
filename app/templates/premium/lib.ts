import type { Product } from "@/(app-routes)/products/model";

/**
 * Provenance helpers for the premium template ("The Batch Label" world).
 * Batch-number grammar: "LOT <derived-from-id> — <category>", always derived
 * from real product data, never invented.
 */

/** LOT number derived from the product id (zero-padded to 4). */
export function lotNumber(product: Pick<Product, "id">): string {
	return `LOT ${String(product.id).padStart(4, "0")}`;
}

/** Full provenance line: "LOT 0042 — Skincare". */
export function lotLine(
	product: Pick<Product, "id" | "category">
): string {
	const lot = lotNumber(product);
	return product.category?.name ? `${lot} — ${product.category.name}` : lot;
}

export interface SpecLine {
	label: string;
	value: string;
}

/**
 * Numbered spec lines for the exploded callouts, from real product fields
 * only. Order is stable so callout markers and the list agree.
 */
export function deriveSpecs(product: Product): SpecLine[] {
	const specs: SpecLine[] = [];
	if (product.brand) specs.push({ label: "House", value: product.brand });
	for (const attr of product.attributes ?? []) {
		if (attr.values?.length) {
			specs.push({ label: attr.name, value: attr.values.join(" · ") });
		}
	}
	if (product.sku) specs.push({ label: "SKU", value: product.sku });
	if (product.category?.name) {
		specs.push({ label: "Range", value: product.category.name });
	}
	return specs.slice(0, 4);
}

/**
 * Shipping window for the "Estimated: <weekday, date>" line, in days from the
 * order date. A template-level constant — the backend has no delivery-window
 * API; the line is explicitly labelled "Estimated".
 */
export const SHIPPING_WINDOW_DAYS = 5;

/** Estimated delivery date, `SHIPPING_WINDOW_DAYS` from now. */
export function estimatedDeliveryDate(locale: string): string {
	const date = new Date();
	date.setDate(date.getDate() + SHIPPING_WINDOW_DAYS);
	return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
		weekday: "long",
		day: "numeric",
		month: "long",
	}).format(date);
}

/** First usable image, or null when the product has none (plate fallback). */
export function primaryImage(product: Product): string | null {
	return (
		product.thumbnail_image ||
		(product.gallery_images && product.gallery_images[0]) ||
		null
	);
}
