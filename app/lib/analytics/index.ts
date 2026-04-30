// Google Analytics exports
export {
  GoogleAnalytics,
  trackPurchase,
  trackAddToCart,
  trackViewItem,
  trackSearch,
  trackBeginCheckout,
} from "./google-analytics";

// Meta Pixel exports
export {
  MetaPixel,
  trackMetaEvent,
  trackMetaPurchase,
  trackMetaAddToCart,
  trackMetaViewContent,
  trackMetaSearch,
  trackMetaInitiateCheckout,
  trackMetaLead,
  trackMetaCompleteRegistration,
  trackMetaAddToWishlist,
} from "./meta-pixel";

/**
 * Unified tracking functions that call both GA and Meta Pixel
 * Use these for convenience when you want to track on both platforms
 */
import {
  trackPurchase as trackGAPurchase,
  trackAddToCart as trackGAAddToCart,
  trackViewItem as trackGAViewItem,
  trackSearch as trackGASearch,
  trackBeginCheckout as trackGABeginCheckout,
  type GAPurchaseItem,
} from "./google-analytics";

import {
  trackMetaPurchase,
  trackMetaAddToCart,
  trackMetaViewContent,
  trackMetaSearch,
  trackMetaInitiateCheckout,
} from "./meta-pixel";

export type CapiUser = {
  email?: string | null;
  phone?: string | null;
  externalId?: string | null;
};

const generateEventId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const sendCapi = (
  eventName: string,
  eventId: string,
  customData: Record<string, unknown>,
  user?: CapiUser
) => {
  if (typeof window === "undefined") return;
  const payload = {
    eventName,
    eventId,
    eventSourceUrl: window.location.href,
    customData,
    user,
  };
  // Fire-and-forget. keepalive lets the request survive navigation (esp. for Purchase).
  fetch("/api/meta-capi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    /* swallow — pixel still fires client-side */
  });
};

/**
 * Track purchase on both platforms (pixel + CAPI for deduplication)
 */
export const trackUnifiedPurchase = (
  transactionId: string,
  value: number,
  currency: string = "BDT",
  items: GAPurchaseItem[] = [],
  user?: CapiUser
) => {
  const eventId = generateEventId();
  const contentIds = items.map((item) => item.item_id);

  trackGAPurchase(transactionId, value, currency, items);
  trackMetaPurchase(value, currency, contentIds, "product", eventId);
  sendCapi(
    "Purchase",
    eventId,
    {
      value,
      currency,
      content_ids: contentIds,
      content_type: "product",
      order_id: transactionId,
      num_items: items.reduce((sum, i) => sum + (i.quantity || 0), 0),
    },
    user
  );
};

/**
 * Track add to cart on both platforms (pixel + CAPI for deduplication)
 */
export const trackUnifiedAddToCart = (
  itemId: string,
  itemName: string,
  price: number,
  quantity: number = 1,
  user?: CapiUser
) => {
  const eventId = generateEventId();
  const value = price * quantity;

  trackGAAddToCart(itemId, itemName, price, quantity);
  trackMetaAddToCart(itemId, itemName, value, "BDT", eventId);
  sendCapi(
    "AddToCart",
    eventId,
    {
      content_ids: [itemId],
      content_name: itemName,
      content_type: "product",
      value,
      currency: "BDT",
    },
    user
  );
};

/**
 * Track product view on both platforms (pixel + CAPI for deduplication)
 */
export const trackUnifiedViewProduct = (
  itemId: string,
  itemName: string,
  price: number,
  category?: string,
  user?: CapiUser
) => {
  const eventId = generateEventId();

  trackGAViewItem(itemId, itemName, price, category);
  trackMetaViewContent(itemId, itemName, price, "BDT", category, eventId);
  sendCapi(
    "ViewContent",
    eventId,
    {
      content_ids: [itemId],
      content_name: itemName,
      content_type: "product",
      value: price,
      currency: "BDT",
      ...(category ? { content_category: category } : {}),
    },
    user
  );
};

/**
 * Track search on both platforms (pixel only — search is low-value for CAPI)
 */
export const trackUnifiedSearch = (searchTerm: string) => {
  trackGASearch(searchTerm);
  trackMetaSearch(searchTerm);
};

/**
 * Track checkout initiation on both platforms (pixel + CAPI for deduplication)
 */
export const trackUnifiedBeginCheckout = (
  value: number,
  items: GAPurchaseItem[] = [],
  user?: CapiUser
) => {
  const eventId = generateEventId();
  const contentIds = items.map((item) => item.item_id);

  trackGABeginCheckout(value, items);
  trackMetaInitiateCheckout(value, "BDT", contentIds, items.length, eventId);
  sendCapi(
    "InitiateCheckout",
    eventId,
    {
      value,
      currency: "BDT",
      content_ids: contentIds,
      content_type: "product",
      num_items: items.length,
    },
    user
  );
};
