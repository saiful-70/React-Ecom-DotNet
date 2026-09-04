/**
 * PayPal hand-off bridge (browser only).
 *
 * `POST /payments/paypal/initiate` answers with an `approval_url` and a
 * `paypal_order_id`. After the buyer approves, PayPal sends them back to the
 * backend's configured return URL, and the frontend MUST call
 * `POST /payments/paypal/capture` — without it the payment is authorised but
 * never taken.
 *
 * The return hop is a fresh page load with query params we don't fully control
 * (PayPal itself uses `token`/`PayerID`; the backend may forward `order_id`).
 * So the ids are stashed in sessionStorage at hand-off time and read back on
 * return, with the URL params taking precedence when present.
 *
 * sessionStorage (not localStorage): the value is meaningless after the tab
 * closes and must not leak into another checkout.
 */

const STORAGE_KEY = "paypal_handoff";

/**
 * One cart line that went into the order, so the return page can remove
 * exactly what was paid for. A full checkout lists every line at its full
 * quantity; a "Buy Now" checkout lists only the scoped line at the Buy Now
 * quantity, leaving any pre-existing quantity in the cart.
 */
export interface PaypalHandoffLine {
  id: number;
  quantity: number;
  variantId?: number;
  bundleTierId?: number;
}

export interface PaypalHandoff {
  orderId: number;
  paypalOrderId?: string;
  lines?: PaypalHandoffLine[];
}

export function rememberPaypalHandoff(
  orderId: number,
  paypalOrderId?: string,
  lines?: PaypalHandoffLine[]
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ orderId, paypalOrderId, lines } satisfies PaypalHandoff)
    );
  } catch {
    // Private-mode / quota failures are non-fatal: the return page falls back
    // to the URL params.
  }
}

export function readPaypalHandoff(): PaypalHandoff | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PaypalHandoff>;
    if (typeof parsed?.orderId !== "number") return null;
    return {
      orderId: parsed.orderId,
      paypalOrderId:
        typeof parsed.paypalOrderId === "string"
          ? parsed.paypalOrderId
          : undefined,
      lines: Array.isArray(parsed.lines)
        ? parsed.lines.filter(
            (line): line is PaypalHandoffLine =>
              typeof line?.id === "number" && typeof line?.quantity === "number"
          )
        : undefined,
    };
  } catch {
    return null;
  }
}

export function clearPaypalHandoff(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
