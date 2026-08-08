export enum CACHE_TIMES {
  VERY_SHORT_TIME = 1, //1 second
  SHORT_TIME = 10, //10 seconds
  ONE_HOUR = 1 * 60 * 60,
  SIX_HOURS = 6 * 60 * 60,
  TWELVE_HOURS = 12 * 60 * 60,
  ONE_DAY = 24 * 60 * 60,
  THREE_DAYS = 3 * 24 * 60 * 60,
  SEVEN_DAYS = 7 * 24 * 60 * 60,
  THIRTY_DAYS = 30 * 24 * 60 * 60,
}

export enum CART_STOCK {
  DEFAULT = 50,
}

export enum ORDER_STATUS {
  PROCESSING = "processing",
  PENDING = "pending",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
}

export enum PER_PAGE_PARAMS {
  DEFAULT = 50,
  MAX = 1000,
  HUNDRED = 100,
  TWENTY_FIVE = 25,
  TEN = 10,
  FIVE_HUNDRED = 500,
}
