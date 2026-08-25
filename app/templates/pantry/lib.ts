import type { Product } from "@/(app-routes)/products/model";

/**
 * Helpers for the pantry template ("The Natural Pantry" world).
 *
 * Everything here reads real backend fields. Nothing derives a claim the API
 * cannot back — this world sells purity, so an invented proof line would be
 * the one lie that discredits the whole page.
 */

/** First usable photograph, or null (PantryImage then draws its plate). */
export function primaryImage(product: Product): string | null {
	return (
		product.thumbnail_image ||
		(product.gallery_images && product.gallery_images[0]) ||
		null
	);
}

/** The price actually charged today. */
export function sellingPrice(product: Product): number {
	return product.discounted_price > 0 &&
		product.discounted_price < product.price
		? product.discounted_price
		: product.price;
}

/** Whole-percent discount, or null when there is no real reduction. */
export function discountPercent(product: Product): number | null {
	if (!(product.price > 0)) return null;
	const now = sellingPrice(product);
	if (now >= product.price) return null;
	const pct = Math.round(((product.price - now) / product.price) * 100);
	return pct > 0 ? pct : null;
}

/**
 * Pack sizes for the tile rail. A pantry sells the same good in several
 * weights, which the backend models as variants; the rail prints the
 * variant's own combination text (e.g. "৫০০ গ্রাম") with its price.
 *
 * Returns an empty array for a single-pack product — the rail then does not
 * render at all rather than showing one lonely tile.
 */
export interface PackOption {
	variantId: number;
	label: string;
	price: number;
	inStock: boolean;
}

export function packOptions(product: Product): PackOption[] {
	const variants = product.variants ?? [];
	if (variants.length < 2) return [];
	return variants.map((v) => ({
		variantId: v.id,
		label: v.combination_text || v.combination?.join(" · ") || v.sku,
		price:
			v.discount_price > 0 && v.discount_price < v.price
				? v.discount_price
				: v.price,
		inStock: v.stock > 0,
	}));
}

/**
 * Proof lines for the purity rail, built only from fields the backend
 * actually returns. Each entry is a fact about THIS product, not a slogan:
 * brand, origin attribute, net weight attribute, SKU-backed traceability.
 * Callers render whatever survives; an empty result collapses the rail.
 */
export interface ProofLine {
	/** Attribute name as the backend labelled it. */
	label: string;
	value: string;
}

/** Attribute names (bn + en) that read as provenance rather than options. */
const PROVENANCE_KEYS = [
	"origin",
	"source",
	"district",
	"উৎস",
	"এলাকা",
	"জেলা",
	"weight",
	"net weight",
	"ওজন",
	"purity",
	"খাঁটি",
	"process",
	"প্রক্রিয়া",
];

export function proofLines(product: Product): ProofLine[] {
	const lines: ProofLine[] = [];
	for (const attr of product.attributes ?? []) {
		const name = attr.name?.toLowerCase().trim() ?? "";
		const isProvenance = PROVENANCE_KEYS.some((key) => name.includes(key));
		if (isProvenance && attr.values?.length) {
			lines.push({ label: attr.name, value: attr.values.join(" · ") });
		}
	}
	// Deliberately NO brand/category fallback. A brand name is not provenance,
	// and filling a "where this came from" cell with the catalogue's own
	// metadata turns a proof claim into a label. With no provenance attribute
	// the cell has nothing to say and the caller drops it.
	return lines.slice(0, 4);
}

/**
 * Catalogue facts for the product page's own details block. These are plain
 * metadata, printed as such — never as provenance or proof.
 */
export function catalogueLines(product: Product): ProofLine[] {
	const lines: ProofLine[] = [];
	if (product.brand) lines.push({ label: "ব্র্যান্ড", value: product.brand });
	if (product.category?.name) {
		lines.push({ label: "ধরন", value: product.category.name });
	}
	if (product.sku) lines.push({ label: "SKU", value: product.sku });
	return lines;
}

/**
 * Stock line for the shelf. Prints a real number when the backend gives one
 * and never invents scarcity; `null` means "say nothing".
 */
export function stockLine(
	product: Product,
): { low: boolean; count: number } | null {
	if (typeof product.stock !== "number" || product.stock <= 0) return null;
	return { low: product.stock <= 5, count: product.stock };
}
