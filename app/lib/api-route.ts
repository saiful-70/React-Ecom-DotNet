export const API_ROUTES = {
  BUSINESS_SETTINGS: "/business-settings",
  AUTH: {
    LOGIN: "auth/login",
    REGISTER: "auth/register",
    LOGOUT: "auth/logout",
    GET_PROFILE: "auth/get-profile",
    UPDATE_PROFILE: "auth/update-profile",
    CHANGE_PASSWORD: "auth/change-password",
    REFRESH_TOKEN: "auth/refresh-token",
  },
  HOME: {
    FEATURED: "get-featured-products",
    TOP_SELLING: "top-selling-products",
    TODAY_DEAL: "get-today-deal-products",
    BANNERS: "banners",
    FEATURED_CATEGORIES: "featured-categories",
  },
  PRODUCTS: {
    BASE_URL: "products",
    DETAILS: (id: number) => `product-details?id=${id}`,
    FILTER_BY_CATEGORY: (id: number) => `/products?category_id=${id}`,
    CATEGORIES: "categories",
    BRANDS: "brands",
    BY_PARAMS: (params: string) => `/products?${params}`,
  },
  ORDER: {
    ORDER_HISTORIES: "order-histories",
    ORDER_DETAILS: "order-details",
    PURCHASE_ORDER: "purchase-order",
  },
  WISHLIST: {
    TOGGLE: "toggle-wishlist",
    GET_ALL: "wishlists",
  },
  CHECKOUT: {
    COUNTRIES: "countries",
    CITIES: (countryId: number) => `cities?country_id=${countryId}`,
    SHIPPING_COST: (countryId: number, cityId: number) =>
      `shipping-cost?country_id=${countryId}&city_id=${cityId}`,
    CHECKOUT_DATA: "checkout-data",
  },
  NEWSLETTER: {
    SUBSCRIBE: "subscribe",
  },
  REVIEWS: {
    CREATE: "create-review",
  },
  // Only COD, Stripe and PayPal are implemented server-side. bKash / Nagad /
  // SSLCommerz are NOT available as APIs — do not add routes for them.
  PAYMENT_METHOD: {
    /** Preferred gateway controller (JWT): body `{ order_id }` → `checkout_url`. */
    STRIPE_INITIATE: "payments/stripe/initiate",
    /** JWT: body `{ order_id }` → `approval_url` + `paypal_order_id`. */
    PAYPAL_INITIATE: "payments/paypal/initiate",
    /**
     * JWT. The frontend MUST call this after the buyer approves on PayPal;
     * PayPal only authorises on approval, the funds are taken here.
     */
    PAYPAL_CAPTURE: "payments/paypal/capture",
  },
  CHAT: {
    ASK: "ask",
  },
  CAMPAIGNS: {
    LIST: "campaigns",
    DETAILS: (slug: string) => `campaigns/${encodeURIComponent(slug)}`,
  },
  BUNDLES: {
    /** Primary bundle for a product's PDP. `lang` passed via withParams. */
    PRODUCT_BUNDLE: "product-bundle",
    /** Paginated list of active combos. */
    COMBOS: "combos",
    /** Single combo by slug. */
    COMBO_DETAILS: (slug: string) => `combos/${encodeURIComponent(slug)}`,
    /** Server-authoritative pricing + quote for a selected tier. */
    VALIDATE: "checkout/validate-bundle",
  },
};
