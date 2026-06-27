# API spec — Campaign Landing Pages

Status: **proposed** (frontend ships with static demo data; these endpoints do not exist yet)

Single-product, conversion-focused landing pages live at `/campaigns/[slug]`. They currently render
from static TypeScript committed in the frontend:

- `app/(app-routes)/campaigns/_data/demo.ts` → `demoCampaign`
- `app/(app-routes)/campaigns/_data/index.ts` → registry + `getCampaign(slug)` / `listCampaignSlugs()`
- shared types in `app/(app-routes)/campaigns/_data/types.ts` → `CampaignConfig`

This document specifies the read endpoints the backend should expose so campaigns become
CMS-managed **without changing the component markup**. Both follow existing API conventions
(versioned base URL `API_BASE_URL_V1`, envelope `{ success, message, data, meta }`, list payload
shaped like `GET /categories`).

> **Localization.** Every text field returns a **single localized string**, resolved server-side from
> the `Accept-Language` header (or an explicit `?lang=` param). Default locale is `bn`. Numeric/price
> fields are locale-independent (raw numbers; the frontend formats them).
>
> **GDPR / data.** Use synthetic data only — never seed with real customer names, reviews, or phone
> numbers. Testimonials are marketing content, not customer records.

---

## 1. `GET /campaigns`

Lightweight list of published campaigns. Used by the frontend's `generateStaticParams` to pre-render
each landing page at build time, and (optionally) by a future campaigns index page.

### Request

| Param      | Type    | In    | Default  | Description                                          |
|------------|---------|-------|----------|------------------------------------------------------|
| `status`   | string  | query | `active` | Filter by publish state: `active` \| `inactive` \| `all`. |
| `per_page` | integer | query | `50`     | Max campaigns to return.                             |
| `lang`     | string  | query | `bn`     | Locale for text fields. Falls back to `Accept-Language`. |

### Response — `200 OK`

```json
{
  "success": true,
  "message": "Campaigns fetched successfully",
  "data": [
    {
      "slug": "demo",
      "brand": "DebuggerMind",
      "headline": "প্রাকৃতিক উপায়ে সুস্থতার সমাধান",
      "hero_image": "https://cdn.example.com/campaigns/demo/hero.webp",
      "status": "active",
      "starts_at": "2026-06-01T00:00:00Z",
      "ends_at": null,
      "updated_at": "2026-06-20T14:03:00Z"
    }
  ],
  "meta": []
}
```

The list payload is intentionally a summary. The full page content comes from the detail endpoint
below. Server should already exclude campaigns outside their `starts_at`/`ends_at` window when
`status=active`.

---

## 2. `GET /campaigns/{slug}`

Full configuration for one campaign landing page. `slug` is the URL segment.

### Request

| Param  | Type   | In    | Default | Description                                          |
|--------|--------|-------|---------|------------------------------------------------------|
| `slug` | string | path  | —       | Unique URL-friendly identifier (e.g. `demo`).        |
| `lang` | string | query | `bn`    | Locale for text fields. Falls back to `Accept-Language`. |

### Response — `200 OK`

```json
{
  "success": true,
  "message": "Campaign fetched successfully",
  "data": {
    "slug": "demo",
    "brand": "DebuggerMind",
    "headline": "প্রাকৃতিক উপায়ে সুস্থতার সমাধান",
    "subheadline": "১০০% ভেষজ উপাদানে তৈরি। বিশ্বস্ত গ্রাহকদের পছন্দ। ক্যাশ অন ডেলিভারিতে অর্ডার করুন।",
    "hero_image": "https://cdn.example.com/campaigns/demo/hero.webp",
    "hero_bullets": [
      "BCSIR পরীক্ষিত ও অনুমোদিত",
      "১০০% প্রাকৃতিক ও ভেষজ",
      "৭ দিনের মানি-ব্যাক গ্যারান্টি",
      "ক্যাশ অন ডেলিভারি সারা দেশে"
    ],
    "countdown_minutes": 10,
    "countdown_message": "এই অফার শেষ হবে — এখনই অর্ডার করলে পাবেন ফ্রি ডেলিভারি",
    "trust_badges": [
      { "icon": "shield-check", "label": "BCSIR পরীক্ষিত", "sublabel": "ল্যাব রিপোর্ট" },
      { "icon": "award", "label": "ISO সার্টিফাইড", "sublabel": "মান নিয়ন্ত্রণ" },
      { "icon": "users", "label": "২ লক্ষ+ গ্রাহক", "sublabel": "সন্তুষ্ট গ্রাহক" }
    ],
    "benefits": [
      { "icon": "leaf", "title": "১০০% প্রাকৃতিক", "description": "শুধুমাত্র ভেষজ উপাদান, কোনো রাসায়নিক নেই।" },
      { "icon": "truck", "title": "সারা দেশে ডেলিভারি", "description": "ঢাকার ভেতরে ২৪ ঘন্টা, বাইরে ২-৩ দিন।" }
    ],
    "personas": [
      { "title": "ব্যস্ত পেশাজীবী", "description": "যাদের সময় নেই কিন্তু সুস্থ থাকা চান।", "image": null }
    ],
    "testimonials": [
      { "name": "রহিম আহমেদ", "location": "ঢাকা", "rating": 5, "review": "মাত্র ২ সপ্তাহে পার্থক্য বুঝতে পেরেছি।", "image": null }
    ],
    "average_rating": 4.9,
    "total_reviews": 2345,
    "product": {
      "id": 1042,
      "name": "প্রিমিয়াম হেলথ প্যাক — ১ মাসের কোর্স",
      "tagline": "এক মাসের সম্পূর্ণ কোর্স",
      "image": "https://cdn.example.com/products/1042/main.webp",
      "gallery": [
        "https://cdn.example.com/products/1042/g1.webp",
        "https://cdn.example.com/products/1042/g2.webp"
      ],
      "original_price": 1200,
      "offer_price": 990,
      "stock": 100,
      "tax": 0,
      "tax_type": "exclude"
    },
    "bonuses": [
      { "name": "ফ্রি গ্যাসট্রিক রিলিফ পাউডার", "value": 400, "image": null }
    ],
    "offer_limited_note": "খুবই সীমিত সময়ের জন্য",
    "faqs": [
      { "question": "এই পণ্য কি নিরাপদ?", "answer": "হ্যাঁ, এটি BCSIR পরীক্ষিত এবং সম্পূর্ণ প্রাকৃতিক।" }
    ],
    "seo_title": "প্রিমিয়াম হেলথ প্যাক — সীমিত সময়ের অফার | DebuggerMind",
    "seo_description": "BCSIR পরীক্ষিত ১০০% প্রাকৃতিক হেলথ প্যাক। ক্যাশ অন ডেলিভারি।",
    "status": "active",
    "starts_at": "2026-06-01T00:00:00Z",
    "ends_at": null,
    "created_at": "2026-05-20T09:12:00Z",
    "updated_at": "2026-06-20T14:03:00Z"
  },
  "meta": []
}
```

### Response — `404 Not Found`

Unknown or unpublished slug. The frontend renders Next.js `notFound()` (its 404 page).

```json
{ "success": false, "message": "Campaign not found", "data": null, "meta": [] }
```

---

## Fields — top level

| Field               | Type             | Req. | Notes                                                                       |
|---------------------|------------------|------|-----------------------------------------------------------------------------|
| `slug`              | string           | ✓    | Unique, URL-friendly. Stable — changing it breaks shared links.             |
| `brand`             | string           | ✓    | Shown in the hero eyebrow.                                                  |
| `headline`          | string           | ✓    | H1, ~2–8 Bengali words.                                                     |
| `subheadline`       | string           | ✓    | One sentence under the H1.                                                  |
| `hero_image`        | string (URL)     | ✓    | Full URL. Used for the hero **and** the OG/social share image. ≥ 1200px wide. |
| `hero_bullets`      | string[]         | ✓    | Trust bullets in the hero. Frontend lays out 4 cleanly.                     |
| `countdown_minutes` | integer          | ✓    | Banner timer duration in minutes. See [Countdown](#countdown-semantics).    |
| `countdown_message` | string           | ✓    | Text shown beside the timer.                                                |
| `trust_badges`      | TrustBadge[]     | ✓    | 3 looks best. See [nested objects](#fields--nested-objects).                |
| `benefits`          | Benefit[]        | ✓    | 4–6 items.                                                                  |
| `personas`          | Persona[]        | ✓    | 3 items.                                                                    |
| `testimonials`      | Testimonial[]    | ✓    | 4–8 items.                                                                  |
| `average_rating`    | number           | ✓    | 0–5, displayed to 1 decimal. May differ from the mean of `testimonials`.    |
| `total_reviews`     | integer          | ✓    | Headline review count.                                                      |
| `product`           | Product          | ✓    | The single product this LP sells. See below.                               |
| `bonuses`           | Bonus[] \| null  |      | Free gifts shown in the offer block. Omit/`null`/`[]` if none.              |
| `offer_limited_note`| string \| null   |      | e.g. "খুবই সীমিত সময়ের জন্য".                                                |
| `faqs`              | FAQ[]            | ✓    | 4–6 items.                                                                  |
| `seo_title`         | string           | ✓    | `<title>` + OG title.                                                       |
| `seo_description`   | string           | ✓    | Meta description + OG description.                                          |
| `status`            | string           | ✓    | `active` \| `inactive`.                                                     |
| `starts_at`         | string \| null   |      | ISO 8601. Page hidden (404) before this instant. `null` = always live.     |
| `ends_at`           | string \| null   |      | ISO 8601. Page hidden (404) after this instant. `null` = no end.           |
| `created_at`        | string           |      | ISO 8601.                                                                   |
| `updated_at`        | string           |      | ISO 8601.                                                                   |

## Fields — nested objects

**`product`** — maps onto the cart item; `id` is critical (see [Risks](#risks-and-notes)).

| Field            | Type                       | Req. | Notes                                                              |
|------------------|----------------------------|------|--------------------------------------------------------------------|
| `id`             | integer                    | ✓    | **Real backend product ID.** Used at checkout; a fake ID is rejected. |
| `name`           | string                     | ✓    |                                                                    |
| `tagline`        | string \| null             |      |                                                                    |
| `image`          | string (URL)               | ✓    | Primary product image.                                             |
| `gallery`        | string[] \| null           |      | Additional images.                                                 |
| `original_price` | number                     | ✓    | Pre-discount price (BDT). Shown struck-through.                    |
| `offer_price`    | number                     | ✓    | Campaign price (BDT). Added to cart.                               |
| `stock`          | integer                    | ✓    | Available units.                                                   |
| `tax`            | number \| null             |      | Tax amount/rate; default `0`.                                      |
| `tax_type`       | `"include"` \| `"exclude"` |      | How `tax` applies; default `"exclude"`.                            |

**`trust_badges[]`** — `{ icon: string, label: string, sublabel?: string }`
**`benefits[]`** — `{ icon: string, title: string, description?: string }`
**`personas[]`** — `{ title: string, description: string, image?: string }`
**`testimonials[]`** — `{ name: string, location?: string, rating: number (0–5), review: string, image?: string }`
**`bonuses[]`** — `{ name: string, value: number, image?: string }`
**`faqs[]`** — `{ question: string, answer: string }`

### Icon slugs (enumerated)

`trust_badges[].icon` and `benefits[].icon` are **slugs**, not URLs — the frontend maps them to
`lucide-react` icons. The CMS must restrict editors to these values (or coordinate with frontend to
add new ones):

- **Trust badges:** `shield-check`, `award`, `users`
- **Benefits:** `leaf`, `heart`, `sparkles`, `shield`, `thumbs-up`, `truck`

An unknown slug should be returned as-is; the frontend falls back gracefully but the icon won't render.

### Countdown semantics

`countdown_minutes` is a **per-visit** duration — the timer resets on every page load (intentional, no
fake persistence). It is **not** a real campaign deadline. The real publish window is `starts_at` /
`ends_at`, which the server enforces by 404-ing expired pages. If marketing later wants a true shared
deadline counter, add an absolute `countdown_ends_at` timestamp and the frontend will compute remaining
time at render — flag this and we'll extend the contract.

---

## Frontend wiring (when endpoints are live)

1. **Routes** — add to `app/lib/api-route.ts`:
   ```ts
   CAMPAIGNS: {
     LIST: "campaigns",
     DETAILS: (slug: string) => `campaigns/${slug}`,
   },
   ```
2. **Server actions** — create cached reads (`getCampaign(slug)`, `listCampaignSlugs()`) mirroring
   `app/components/shared/actions/categories.ts`. These replace the static lookups in
   `app/(app-routes)/campaigns/_data/index.ts`. `generateStaticParams` calls the list endpoint;
   `page.tsx` calls the detail endpoint and renders the same component tree.
3. **Field naming** — the API uses `snake_case`; the frontend `CampaignConfig` type uses `camelCase`
   (`hero_image` → `heroImage`, `offer_price` → `offerPrice`, etc.). Map in the server action so the
   components stay unchanged.
4. **Delete** the `_data/demo.ts` static config once the endpoints are integrated.

## Risks and notes

1. **Real product IDs required.** The demo uses `id: 99001` (synthetic) — the backend rejects it at
   checkout. Each campaign's `product.id` **must** reference a real, in-stock product. Consider
   validating the FK on save in the CMS.
2. **Order flow is unchanged.** Submitting the campaign form wipes the cart, adds `product` at
   `offer_price`, and hands off to `/checkout`. Campaign orders are **indistinguishable** from normal
   orders to the backend today. If marketing needs attribution, add a `campaign` field carried through
   the checkout/order-create payload — flag this and we'll thread it through.
3. **Scheduling = visibility.** When `status=active` with a past `ends_at`, the detail endpoint should
   404 (not return an expired page). The static-generation list should likewise omit it.
4. **Audit trail.** Publishing/scheduling a campaign changes what customers see and what they can buy.
   If campaign config falls under document-control/approval requirements, ensure create/update/publish
   is recorded with author + timestamp (out of scope for these read endpoints, but flagging it).

## Out of scope

- Admin/CMS **write** endpoints (create/update/publish/reorder campaigns).
- Image upload/transformation pipeline.
- Direct campaign-order (COD) endpoint — the current flow reuses cart → checkout.
- A/B testing or per-segment variants.
