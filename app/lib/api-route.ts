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
  PAYMENT_METHOD: {
    STRIPE: "stripe",
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
