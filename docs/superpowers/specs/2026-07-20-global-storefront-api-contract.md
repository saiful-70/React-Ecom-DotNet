# API Contract — International storefront (`global` template)

**Date:** 2026-07-20
**Consumer:** `app/templates/global/*` (variant `intl-01`)
**Base URL:** `API_BASE_URL_V1` (same as existing endpoints)
**Status:** Proposal — backend not yet implemented

This document lists the backend gaps the `global` storefront needs. Sections
that already have endpoints are noted for completeness; the rest are **served by
documented mock/heuristic helpers today** (`app/templates/global/_data/mock.ts`)
and must be replaced by real endpoints.

All responses follow the existing envelope: `{ success: boolean, message: string, data: ... }`.
Dates are ISO 8601. Prices are numbers in the store's currency (USD for intl-01).
No real customer data is used in examples (GDPR — synthetic values only).

---

## 1. Already covered by existing APIs (no change required)

| Homepage / page section | Endpoint |
|---|---|
| Hero banners | `GET /banners` |
| Department rail & mega-menu | `GET /categories` |
| Circular categories strip | `GET /featured-categories` |
| Flash-deal **products** | `GET /get-today-deal-products` |
| Featured products | `GET /get-featured-products` |
| Latest products | `GET /products?sort=latest` |
| Category showcases | `GET /products?category_id={id}` |
| Best selling | `GET /top-selling-products` |
| Top rated | `GET /products?sort=rating` |
| Brands strip | `GET /brands` |
| Listing / filters / search | `GET /products` |
| Product detail | `GET /product-details?id={id}` |
| Newsletter | `POST /subscribe` |
| Auth (login / register) | `POST /auth/login`, `POST /auth/register` |

> **Note on `sort`:** the `global` home requests `sort=latest` and `sort=rating`.
> If the backend does not support these values it should ignore them gracefully
> (returning an unsorted page) — the UI still renders. Confirm supported `sort`
> values and document them.

---

## 2. New endpoints needed (currently mocked)

### 2.1 Flash deal with countdown — `GET /flash-deal`

Drives the flash-deal band's **countdown timer**. Today the products come from
`get-today-deal-products` but there is **no campaign end time**, so the timer is
mocked to "end of current day" (`getFlashDealEnd` in `_data/mock.ts`).

**Response**

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 12,
    "title": "Weekend Flash Deal",
    "starts_at": "2026-07-20T00:00:00",
    "ends_at": "2026-07-22T23:59:59",
    "products": [ /* array of Product, same shape as /products items */ ]
  }
}
```

- `ends_at` is the only strictly-required addition; the UI computes the
  countdown from it.
- If `data` is `null` / `products` is empty, the section hides.

### 2.2 Deal of the Day — `GET /deal-of-the-day`

A single highlighted product. Today we **heuristically pick** the largest-
discount product from today's deals (`pickDealOfDay` in `_data/mock.ts`).

**Response**

```json
{
  "success": true,
  "message": "OK",
  "data": { /* a single Product */ }
}
```

- If `data` is `null`, the spotlight card hides and only "Latest products" shows.

### 2.3 Multi-currency (deferred; top-bar currency is display-only) — `GET /currencies`

The top bar shows `USD $` as a **static label**. To make it switchable:

**Response**

```json
{
  "success": true,
  "message": "OK",
  "data": [
    { "code": "USD", "symbol": "$", "name": "US Dollar", "rate": 1.0, "is_default": true },
    { "code": "EUR", "symbol": "€", "name": "Euro", "rate": 0.92, "is_default": false },
    { "code": "GBP", "symbol": "£", "name": "Pound Sterling", "rate": 0.79, "is_default": false }
  ]
}
```

- `rate` is relative to the store default currency.
- Client persists the choice (cookie) and multiplies displayed prices by `rate`.
  Prices at checkout must be recomputed/validated server-side.

---

## 3. Deferred multi-vendor set (v1 nav items hidden)

Not used in v1 (single-vendor). Documented so the nav items (All Vendors,
Vendor Zone, Auctions, Publication House) can be switched on later without a
frontend redesign — each maps to a listing page reusing existing product UI.

| Feature | Proposed endpoint | Response summary |
|---|---|---|
| All vendors | `GET /vendors?page=&per_page=` | `data: Vendor[]`, `meta: PaginationMeta` |
| Vendor storefront | `GET /vendors/{id}` | `data: { vendor: Vendor, products: Product[] }` |
| Vendor zone summary | `GET /vendor-zone` | `data: { top_vendors: Vendor[], new_vendors: Vendor[] }` |
| Auctions | `GET /auctions?status=live|upcoming|ended` | `data: Auction[]` (product + `current_bid`, `ends_at`) |
| Publication house | `GET /publications?page=` | `data: Publication[]`, `meta: PaginationMeta` |

**Proposed `Vendor` shape**

```json
{
  "id": 1,
  "name": "Global Tech Store",
  "slug": "global-tech-store",
  "logo": "https://.../logo.png",
  "banner": "https://.../banner.jpg",
  "rating": 4.6,
  "total_products": 128,
  "since": "2024-01-01"
}
```

**Proposed `Auction` shape**

```json
{
  "id": 1,
  "product": { /* Product */ },
  "starting_price": 100.0,
  "current_bid": 145.0,
  "bid_count": 12,
  "status": "live",
  "ends_at": "2026-07-25T18:00:00"
}
```

---

## 4. Auth note (no contract change)

The international register/login screens add a **country-code phone picker**.
The submitted `phone` is normalized to **E.164** (e.g. `+14155550132`) using a
bundled country list (`app/lib/data/countries.ts`) + `libphonenumber-js`. The
request bodies for `POST /auth/login` and `POST /auth/register` are **unchanged**
— only the phone string format differs. Please confirm the backend accepts
E.164 phone values (and, if relevant, stores the country for future SMS/OTP).

---

## 5. Summary of frontend mocks to remove when APIs land

| Mock helper (`_data/mock.ts`) | Replace with |
|---|---|
| `getFlashDealEnd()` | `GET /flash-deal` → `data.ends_at` |
| `pickDealOfDay()` | `GET /deal-of-the-day` → `data` |
| Static `USD $` top-bar label | `GET /currencies` + switcher |
