# Campaign Landing Pages

Single-product, conversion-focused landing pages at `/campaigns/[slug]`. Designed for the Bangladeshi market: Bengali copy, COD-first, urgency + social proof above the fold, inline order form that pre-fills the cart and hands off to `/checkout`.

Modeled on patterns like [bonobhumi.com.bd](https://bonobhumi.com.bd/l/dt11).

## TL;DR — Add a new campaign

1. Copy [`app/(app-routes)/campaigns/_data/demo.ts`](../app/(app-routes)/campaigns/_data/demo.ts) → `_data/<slug>.ts`. Update every field.
2. Set `product.id` to the **real backend product ID** (critical — see [Risks](#risks-and-known-gaps)).
3. Register it in [`_data/index.ts`](../app/(app-routes)/campaigns/_data/index.ts):
   ```ts
   import { myCampaign } from "./my-campaign";
   const CAMPAIGNS = { [demoCampaign.slug]: demoCampaign, [myCampaign.slug]: myCampaign };
   ```
4. Visit `/campaigns/<slug>` in dev. Done.

The route is statically generated at build (`generateStaticParams`), so redeploy to pre-render new campaigns.

## Page anatomy

Top → bottom:

| Section | File | Notes |
|---|---|---|
| Countdown banner | `CountdownBanner.tsx` | Terracotta strip, MM:SS counter (client-side, resets per visit) |
| Hero | `CampaignHero.tsx` | Headline, subheadline, 4 bullets, CTA, % off sticker |
| Trust strip | `TrustStrip.tsx` | 3-column badges (BCSIR / ISO / customers etc.) |
| Benefits grid | `BenefitsGrid.tsx` | Up to 6 saffron-tile cards; 2-col mobile, 3-col desktop |
| Target audience | `TargetAudience.tsx` | 3 numbered persona cards |
| Offer block | `OfferBlock.tsx` | Product + bonus stack + total-value math + savings line |
| Testimonials | `TestimonialsGrid.tsx` | Rating header + review cards (4-col grid) |
| FAQ | `CampaignFAQ.tsx` | shadcn accordion |
| Order form | `CampaignOrderForm.tsx` | Name / phone / address / delivery area + live total |
| Sticky CTA | `StickyMobileCTA.tsx` | Fixed bottom bar, mobile only (`lg:hidden`) |

Composition: [`[slug]/page.tsx`](../app/(app-routes)/campaigns/[slug]/page.tsx).

## Data model

Defined in [`_data/types.ts`](../app/(app-routes)/campaigns/_data/types.ts). Key fields:

```ts
interface CampaignConfig {
  slug: string;                  // URL segment, must be unique
  brand: string;                 // Shown in hero eyebrow
  headline: string;              // H1, ~2-8 Bengali words
  subheadline: string;           // 1 sentence under H1
  heroImage: string;             // Full URL (Unsplash / CDN / Cloudinary)
  heroBullets: string[];         // 4 trust bullets in hero
  countdownMinutes: number;      // Banner timer duration
  countdownMessage: string;
  trustBadges: CampaignTrustBadge[];   // Exactly 3 looks best
  benefits: CampaignBenefit[];         // 4-6 items
  personas: CampaignPersona[];         // 3 items
  testimonials: CampaignTestimonial[]; // 4-8 items
  averageRating: number;               // 0-5, shown to 1 decimal
  totalReviews: number;
  product: CampaignProduct;            // See below
  bonuses?: CampaignBonus[];           // Free gifts shown in offer block
  offerLimitedNote?: string;           // "খুবই সীমিত সময়ের জন্য"
  faqs: CampaignFAQ[];                 // 4-6 items
  seoTitle: string;
  seoDescription: string;
}

interface CampaignProduct {
  id: number;                          // ← MUST be the real backend product ID
  name: string;
  tagline?: string;
  image: string;
  originalPrice: number;
  offerPrice: number;
  stock: number;
  tax?: number;
  taxType?: "include" | "exclude";
}
```

### Icon slugs

Used by `trustBadges[].icon`, `benefits[].icon`. Lookups are in the component files (`ICONS` map). Currently supported:

- **Trust strip:** `shield-check`, `award`, `users`
- **Benefits:** `leaf`, `heart`, `sparkles`, `shield`, `thumbs-up`, `truck`

To add a new icon, import it from `lucide-react` and add it to the relevant `ICONS` map.

## Order flow

User submits the form → `CampaignOrderForm.tsx`:

1. Validates name (≥2 chars), phone (10-15 chars, digits/+/-/space), address (≥5 chars).
2. `clearCart()` — wipes any existing cart.
3. `addToCart()` — adds the campaign product (`id`, `name`, `offerPrice`, `image`, `stock`, `tax`, `taxType`, qty 1).
4. `router.push("/checkout?campaign=<slug>&name=…&phone=…&address=…&area=dhaka|outside")`.

The query string is informational only — `/checkout` does not currently consume those params. If you want pre-fill on the checkout page, that's a separate change in `app/(app-routes)/checkout/page.tsx`.

### Why we don't submit directly

The user chose to reuse the existing cart → checkout flow rather than a dedicated campaign-order endpoint. Pros: single source of truth for shipping math, business settings, payment options. Cons: an extra page hop vs. a true single-page LP. If conversion data shows the hop hurts, we can switch to a direct COD endpoint later — the form is already isolated in one file.

## Design system

Inherits the warm Bengali tokens (terracotta primary, saffron accent, cream background, forest green secondary, Hind Siliguri + Noto Serif Bengali). See [`app/globals.css`](../app/globals.css) and [`tailwind.config.ts`](../tailwind.config.ts).

Utilities used heavily:
- `bg-warm-gradient`, `bg-saffron-gradient`, `bg-terracotta-gradient`
- `shadow-warm-sm` / `shadow-warm-md` / `shadow-warm-lg`
- `font-display` (Noto Serif Bengali for headings)
- `font-sans` defaults to Hind Siliguri

## Responsive behavior

- **Mobile (< 640px):** Single-column everywhere; benefits grid is 2-col; testimonials stack; sticky CTA visible at bottom.
- **Tablet (640-1024px):** 2-col where it makes sense (personas, offer block).
- **Desktop (≥ 1024px):** Hero is 2-col, sticky CTA hidden, all decorative offsets at full size.

The `<main>` element has `pb-24 lg:pb-0` so mobile content isn't hidden behind the sticky CTA.

## SEO

- `generateMetadata` reads `seoTitle` / `seoDescription` from config and uses `campaign.heroImage` for OG.
- `generateStaticParams` exports all known slugs.
- A `BreadcrumbList` JSON-LD is emitted at the top of the page.

## Risks and known gaps

1. **Real product IDs required.** The demo uses `id: 99001` (synthetic). The backend will reject this at checkout. Always set `product.id` to a real backend product before going live.
2. **Shipping totals are indicative.** The form shows ৳60 / ৳120 to give the customer a price expectation. The real shipping comes from business settings on `/checkout`. If those values diverge, customers see the total jump. Options to address: (a) match the constants to business settings, (b) fetch shipping from the API in the form, (c) drop the live total and show "shipping calculated at checkout".
3. **Query-string pre-fill is one-way.** `/checkout` currently ignores `?name=…&phone=…&address=…`. Wire up consumption there if you want a true one-form LP feel.
4. **Countdown is per-visit.** It resets every reload. That's intentional for legal/UX clarity (no fake persistence), but if you want a real campaign deadline use a fixed end-date timestamp in config and compute remaining time at render.
5. **Audit-trail.** Campaign orders look identical to normal orders to the backend. If marketing needs attribution, add a `campaign` field to the cart item or pass it through the checkout server action.
6. **No A/B testing hooks.** Each campaign is one variant. If you want to A/B test (e.g. two hero copies), wire a feature-flag check in the page component.

## Testing checklist

- [ ] Visit `/campaigns/demo` in dev — all sections render
- [ ] Countdown ticks down, doesn't crash at 00:00
- [ ] Mobile (375px): sticky CTA visible, hero floating elements don't overflow, form fits viewport
- [ ] Tap "অর্ডার করুন" CTAs anywhere on page → smooth-scrolls to form
- [ ] Submit form with valid data → cart is wiped, campaign product added, redirects to `/checkout`
- [ ] Submit form with invalid phone → inline validation prevents submission
- [ ] `npm run type-check` passes
- [ ] OG image renders correctly when sharing the URL on Slack/Facebook
