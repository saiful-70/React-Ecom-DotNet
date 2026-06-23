# API spec — Hero Banners & Featured Categories

Status: **proposed** (frontend ships with static demo data; these endpoints do not exist yet)

The homepage hero **carousel** and the **Featured Categories** strip currently render from
static demo data committed in the frontend:

- `app/components/home/_data/banners.ts` → `HERO_BANNERS`
- `app/components/home/_data/featured-categories.ts` → `FEATURED_CATEGORIES`
- shared types in `app/components/home/_data/types.ts`

This document specifies the two read endpoints the backend should expose so the demo data can be
swapped for CMS-managed data **without changing the component markup**. Both follow the existing API
conventions (versioned base URL `API_BASE_URL_V1`, list payload shaped like the categories endpoint).

> Localization note: the demo data stores Bengali + English inline (`title_bn` / `title_en`). The API
> instead returns a **single localized string** per field, resolved server-side from the
> `Accept-Language` header (or an explicit `?lang=` param). The frontend keeps `bn` as the default
> locale. Use synthetic data only — never seed with real customer data.

---

## 1. `GET /banners`

Ordered list of hero-carousel slides.

### Request

| Param      | Type    | In    | Default    | Description                                              |
|------------|---------|-------|------------|----------------------------------------------------------|
| `status`   | string  | query | `active`   | Filter by publish state: `active` \| `inactive` \| `all`.|
| `per_page` | integer | query | `10`       | Max slides to return.                                    |
| `lang`     | string  | query | `bn`       | Locale for text fields (`bn`, `en`). Falls back to `Accept-Language`. |

### Response — `200 OK`

```json
{
  "success": true,
  "message": "Banners fetched successfully",
  "data": [
    {
      "id": 1,
      "title": "নতুন কালেকশন এসে গেছে",
      "subtitle": "সর্বশেষ ট্রেন্ডের পণ্য এখন এক ক্লিকেই — সেরা দামে কিনুন।",
      "image_url": "https://cdn.example.com/banners/new-arrivals.webp",
      "cta_label": "এখনই কিনুন",
      "cta_url": "/products",
      "sort_order": 1,
      "status": "active",
      "starts_at": "2026-06-01T00:00:00Z",
      "ends_at": null,
      "created_at": "2026-05-20T09:12:00Z",
      "updated_at": "2026-06-10T14:03:00Z"
    }
  ],
  "meta": []
}
```

### Fields

| Field         | Type            | Notes                                                                 |
|---------------|-----------------|-----------------------------------------------------------------------|
| `id`          | integer         | Primary key.                                                          |
| `title`       | string          | Localized heading.                                                    |
| `subtitle`    | string          | Localized supporting line.                                            |
| `image_url`   | string (URL)    | Full-bleed banner image. Recommend ≥ 2070px wide, 16:9-ish.           |
| `cta_label`   | string          | Localized button label.                                               |
| `cta_url`     | string          | Internal path (e.g. `/products?is_featured=1`) or absolute URL.       |
| `sort_order`  | integer         | Ascending display order; ties broken by `id`.                         |
| `status`      | string          | `active` \| `inactive`.                                               |
| `starts_at`   | string \| null  | ISO 8601. Slide hidden before this instant. `null` = always.          |
| `ends_at`     | string \| null  | ISO 8601. Slide hidden after this instant. `null` = no end.           |
| `created_at`  | string          | ISO 8601.                                                             |
| `updated_at`  | string          | ISO 8601.                                                             |

Server should already exclude slides outside their `starts_at`/`ends_at` window when `status=active`.

---

## 2. `GET /featured-categories`

Ordered list of curated category tiles for the homepage strip. These are **editorially chosen** and
may differ from the full `GET /categories` tree, hence a dedicated endpoint.

### Request

| Param      | Type    | In    | Default  | Description                                        |
|------------|---------|-------|----------|----------------------------------------------------|
| `status`   | string  | query | `active` | `active` \| `inactive` \| `all`.                   |
| `per_page` | integer | query | `12`     | Max tiles to return.                               |
| `lang`     | string  | query | `bn`     | Locale for `name`.                                 |

### Response — `200 OK`

```json
{
  "success": true,
  "message": "Featured categories fetched successfully",
  "data": [
    {
      "id": 1,
      "category_id": 17,
      "slug": "electronics",
      "name": "ইলেকট্রনিক্স",
      "icon_url": "https://cdn.example.com/categories/electronics.webp",
      "sort_order": 1,
      "status": "active"
    }
  ],
  "meta": []
}
```

### Fields

| Field         | Type    | Notes                                                                        |
|---------------|---------|------------------------------------------------------------------------------|
| `id`          | integer | Primary key of the featured-category row.                                    |
| `category_id` | integer | FK to the real category. Frontend links to `/products?category_id={category_id}`. |
| `slug`        | string  | Category slug (stable, URL-friendly).                                        |
| `name`        | string  | Localized display label.                                                     |
| `icon_url`    | string  | Square icon/illustration. Recommend ≥ 300×300, transparent or white bg.      |
| `sort_order`  | integer | Ascending display order.                                                     |
| `status`      | string  | `active` \| `inactive`.                                                      |

---

## Frontend wiring (when endpoints are live)

1. **Routes** — add to `app/lib/api-route.ts`:
   ```ts
   HOME: {
     // ...existing
     BANNERS: "banners",
     FEATURED_CATEGORIES: "featured-categories",
   },
   ```
2. **Server actions** — create cached reads mirroring
   `app/components/shared/actions/categories.ts` (note it normalizes a bare `data: []` array):
   ```ts
   export async function getBanners() {
     return new ApiClient(API_ROUTES.HOME.BANNERS)
       .withMethod("GET")
       .withCache(["banners"], CACHE_TIMES.SHORT_TIME)
       .execute<BannersResponse>();
   }
   ```
   Do the same for `getFeaturedCategories()`.
3. **Components** — `HeroCarousel` / `FeaturedCategories` are currently `"use client"` and import the
   static arrays. Convert each to accept its list as a prop, fetch in the server `page.tsx`
   (`app/page.tsx`), and pass the data down — keeping the carousel interactivity client-side. The
   `HeroBanner` / `FeaturedCategory` types in `_data/types.ts` already map field-for-field onto the
   API shapes above (drop the `_bn`/`_en` split in favour of the localized `title`/`name`).
4. **Delete** the `_data/*.ts` demo files once both endpoints are integrated.

## Out of scope
- Admin/CMS write endpoints (create/update/reorder banners & featured categories).
- Image upload/transformation pipeline.
- A/B testing or per-segment banner targeting.
