# API Contract Addendum — Combo Landing Page Fields

**Date:** 2026-07-27
**Consumer:** `bn-01` (classic template) — `/combo/{slug}` landing page redesign
**Base URL:** `API_BASE_URL_V1`
**Depends on:** [`2026-07-21-bundle-combo-api-contract.md`](./2026-07-21-bundle-combo-api-contract.md) (delivered combo API)
**Status:** 🔵 PROPOSED — frontend ships now with graceful degradation; backend fields optional.

## Problem

The combo landing page was redesigned to sell the offer harder: an editorial hero
with an image gallery, a live deal countdown, a proper description block, and a
"what's included" section. Three optional, **additive** fields on the combo payload
would let the backend drive that content instead of the frontend inferring it.

The frontend already degrades gracefully — every field below is optional and the page
renders correctly without it. No breaking change; no field is renamed or removed.

## Users / personas

- **Shopper:** reads a fuller description and sees a multi-image gallery before buying.
- **Merchandiser:** controls the offer's imagery, long-form copy, and selling points
  from the back office instead of relying on a single banner + one-line description.

## Requested fields (additive on `GET /combos/{slug}` `data`)

All fields are **localized** the same way as existing combo strings (request `?lang=bn|en`),
and all are **nullable/omittable**. Prices/dates unchanged.

| Field | Type | Required? | Behaviour when absent |
|---|---|---|---|
| `images` | `string[]` (absolute URLs) | No | Falls back to `[banner]`; gallery shows a single image, no thumbnail strip. |
| `body` | `string` (localized, **HTML**) | No | The "About this offer" section is hidden. |
| `highlights` | `string[]` (localized) | No | The hero selling-point checklist is hidden. |
| `trust_badges` | `TrustBadge[]` (see below) | No | The client shows built-in default badges (100% original / fast delivery / COD / 7-day return). |

```ts
interface TrustBadge {
  icon: string;      // key mapped to a fixed client icon; known: "original" | "delivery" | "cod" | "return"
  label: string;     // localized text
  is_active: boolean;// inactive badges are filtered out client-side
}
```

Notes:
- `images` **includes** the existing `banner` as its first element by convention (the
  banner stays the default/primary image); if `images` is omitted the banner is used alone.
- `body` is **HTML** — it is sanitized client-side with DOMPurify and styled via Tailwind
  `prose` (the same pipeline as product descriptions). Send trusted, well-formed markup
  (`<p>`, `<ul>`, `<h2>`, `<a>`, etc.). Server-side sanitisation is still recommended.
- `trust_badges`: **icons stay client-side** ("the icons are OK") — the backend controls
  only `label` and `is_active`, plus an `icon` key selecting which fixed icon to show.
  Unknown `icon` keys fall back to a default icon. If every badge is inactive, the row is
  hidden entirely. Open question: this is currently read from the **combo payload**, but as
  a store-wide concern it may fit better on **business settings** — see open questions.
- `description` (existing, short) is unchanged and now renders as the **hero subtitle**;
  `body` is the new long-form block. Keep `description` a one-liner.
- `ends_at` (existing) now drives a **live countdown** on the page. No change needed, but
  ensure it reflects the real offer window in the shopper's expectation (server clock is
  authoritative; the client only displays it).

### Example `data` (synthetic)

```jsonc
{
  "id": 9101,
  "slug": "kombo-1",
  "title": "কম্বো ১",
  "description": "দুটি পণ্য একসাথে, একটাই দামে।",
  "badge": "COMBO OFFER",
  "banner": "https://cdn.example.com/combo/kombo-1/hero.jpg",

  // NEW — optional
  "images": [
    "https://cdn.example.com/combo/kombo-1/hero.jpg",
    "https://cdn.example.com/combo/kombo-1/angle-2.jpg",
    "https://cdn.example.com/combo/kombo-1/lifestyle.jpg"
  ],
  "body": "<p>এই কম্বোতে থাকছে নির্বাচিত জামা ও কাপড়।</p><ul><li>ফ্রি ডেলিভারি</li><li>ক্যাশ অন ডেলিভারি</li></ul>",
  "highlights": ["১০০% অরিজিনাল পণ্য", "সীমিত সময়ের অফার"],
  "trust_badges": [
    { "icon": "original", "label": "১০০% অরিজিনাল", "is_active": true },
    { "icon": "delivery", "label": "ফাস্ট ডেলিভারি", "is_active": true },
    { "icon": "cod", "label": "ক্যাশ অন ডেলিভারি", "is_active": true },
    { "icon": "return", "label": "৭ দিনের রিটার্ন", "is_active": false }
  ],

  "is_active": true,
  "starts_at": null,
  "ends_at": "2026-08-03T18:00:00Z",
  "terms": "অফারটি স্টক থাকা পর্যন্ত প্রযোজ্য।",
  "tiers": [ /* unchanged */ ]
}
```

## Functional requirements

| # | Requirement | Notes |
|---|---|---|
| FR-1 | Return an optional `images[]` array of absolute URLs (banner first). | Omit or `null` when only the banner exists. |
| FR-2 | Return an optional localized `body` as **HTML** (sanitized client-side). | Omit or `null` → About section hidden. |
| FR-3 | Return an optional localized `highlights[]`. | Omit or `null` → hero checklist hidden. |
| FR-4 | Return an optional `trust_badges[]` (`icon`, localized `label`, `is_active`). | Omit or `null` → built-in default badges shown. |
| FR-5 | Keep `description` a short one-line subtitle; `ends_at` accurate for the countdown. | No schema change; behavioural note. |

## Out of scope

- **Reviews / ratings on combos** — confirmed there is no review option for combos; the
  page intentionally has no reviews section. No review fields requested.
- Merchandiser back-office UI to configure these fields (imagery, HTML body, badges) —
  separate work item.
- Suggested tables: extend `bundles` with `images` (json), `body` (localized HTML text),
  `highlights` (localized json), `trust_badges` (localized json) — or source `trust_badges`
  from store-wide settings (see open questions).

## Open questions

1. Should `images[]` be a distinct field or an existing `banner` + gallery array pattern
   reused from products? (FE assumes a standalone `images[]`, banner-first.)
2. Max gallery length to cap client rendering? (FE currently renders all returned images.)
3. **`trust_badges` source:** per-combo (current FE integration point) or store-wide
   business settings? These badges are generic assurances, so store-wide is arguably the
   better model — but the same wire shape can simply be echoed onto the combo payload so
   the FE needs no change. Confirm the source of truth. (FE reads `combo.trust_badges`.)
4. **`body` HTML safety:** confirm the allowed tag/attribute set. FE sanitizes with
   DOMPurify defaults; server-side sanitisation on save is still recommended.
