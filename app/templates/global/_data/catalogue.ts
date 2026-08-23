/**
 * Catalogue apparatus for the global ("Mail-Order Index") template.
 * Deterministic, presentation-only helpers — no fabricated commercial claims.
 */

/**
 * Standard international shipping window in days. Used for the printed
 * availability course ("In stock — get it by <date>") on plates and the PDP.
 * The date is always labelled "Estimated" in the UI; replace with a real
 * per-country delivery API when one exists.
 */
export const SHIPPING_WINDOW_DAYS = 6;

/** Stock at or below this prints the honest "Only X left" line. */
export const LOW_STOCK_THRESHOLD = 5;

/** Order date + shipping window. */
export function estimatedDeliveryDate(from: Date = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + SHIPPING_WINDOW_DAYS);
  return d;
}

/**
 * Catalogue item number derived from the product id, e.g. 4217 → "004-217".
 * Purely a typographic identity — stable, reversible, never invented.
 */
export function itemNo(id: number): string {
  const padded = String(Math.abs(id) % 1_000_000).padStart(6, "0");
  return `${padded.slice(0, 3)}-${padded.slice(3)}`;
}

/**
 * Printed currency line, e.g. "USD $" — but when business settings resolve
 * the symbol to the code itself (unknown codes fall back that way, giving
 * "TK TK"), print it once.
 */
export function currencyLine(code: string, symbol: string): string {
  return code.trim().toLowerCase() === symbol.trim().toLowerCase()
    ? code.trim()
    : `${code.trim()} ${symbol.trim()}`;
}

/**
 * Short printed date ("Tue, 2 Sep") in the visitor's locale. i18next language
 * codes ("en" | "bn") map cleanly onto Intl locales.
 */
export function formatCatalogueDate(date: Date, language: string): string {
  try {
    return new Intl.DateTimeFormat(language, {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(date);
  } catch {
    return date.toDateString();
  }
}
