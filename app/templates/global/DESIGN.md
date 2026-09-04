# THE MAIL-ORDER INDEX — `global` template

Seed key `61608d55` · candidate 6 of 7 on the ordered grounded list.

## Thesis

The marketplace as a great mail-order catalogue — numbered order instead of
feed chaos. Every product carries an item number, departments are index tabs,
availability is printed on the page. It refuses the Amazon-clone carousel
arrangement and the Temu urgency stack.

## The world

| Element | Decision |
| --- | --- |
| Page | Catalogue-page white (`--background`), print ink (`--foreground`) |
| Action color | Catalogue blue (`--primary`); chrome ink-navy (`--secondary`) |
| Sale red | `--accent`, appears ONLY inside the deals insert band and on discount figures (−24%, save amounts). Nowhere else — wishlist states, low-stock lines and pressed states are ink. |
| Rules | 1px hairlines (`--border`) structure everything; section headings sit on a rule; the listing h1 sits on a 2px ink rule |
| Corners | `--radius` 0.125rem (print corner); composed spreads carry 12×2px ink registration marks (`.g-corners`) |
| Type | Archivo Variable for display (weight 900, uppercase, tight tracking) and body; every number is `tabular-nums` |
| Type ramp | 10px/11px (item numbers, group titles) · 12px (courses, chips) · 14px (body/controls) · 16px (`1rem`, masthead search input) · 18–24px (section heads) · 30–36px (page heads) · 36–60px (hero display) |
| Item numbers | `No. 004-217`, derived from the product id (`itemNo()` in `_data/catalogue.ts`) — on plates, hero captions, ranked rows, and the PDP |

## Named raises

- **Printed availability course** — `GlobalAvailabilityLine`: "In stock — get
  it by Tue, 2 Sep · Estimated" on every plate and the PDP. The date is order
  date + `SHIPPING_WINDOW_DAYS` (6), computed client-side after hydration and
  always labelled Estimated. "Only X left" prints only when the API stock
  field is present and ≤ 5 (`LOW_STOCK_THRESHOLD`), in ink, not red.
- **Horizon datum** — the hero tableau is a `g-datum` section: a full-bleed
  hairline at its base that headline and figures ground on; each figure's
  caption top-rule and the department index-tab rule repeat the same datum
  grammar down the page.
- **Hero is one composed tableau** — up to three real, in-stock, photographed
  products at mismatched print scales (h-72 / h-52 / h-36 on desktop), never
  a carousel. With a single photographed specimen the tableau composes it as
  one catalogue-scale plate (h-96 desktop) with a printed figure legend
  (No. · name · price) on the datum — the tableau survives sparse data.
  Headline text comes from the first backend banner when present.
- **Truth discipline** — no unverifiable commercial claims anywhere. The
  footer terms line prints only settings/constant-backed facts (flat intl
  rate, free-over threshold from `INTL_SHIPPING`; support hours only when
  `support_time` is set). There is no returns/authenticity/safe-payment copy
  because no backing field exists; lines collapse rather than fabricate.
- **One motion grammar** — slide-and-settle (`g-settle`, translateY 14px → 0,
  `cubic-bezier(0.16,1,0.3,1)`, transform-only so content is visible by
  default). The authored moment is the staggered hero entrance; `g-lift` and
  the sticky buy bar reuse the same ease. Disabled under reduced motion.
- **Honest urgency only** — the deals insert (`DealsInsert`) is backed by the
  backend `today_deal` flag; its printed line "Prices valid today, <date>"
  restates that flag. No countdown, no fake stock. The old mock flash-deal
  timer (`_data/mock.ts`) was deleted.

- **Set entry** (`product/GlobalCombo.tsx`) — the combo landing as a catalogue
  spread. The set carries its own `Set No.` from `itemNo(combo.id)`; the
  packages are index rows on hairlines with radio semantics; the contents are a
  numbered plate list where each item prints its own item number. The delivery
  course sits above the order actions as on every plate. A real `ends_at`
  prints as one ink course line ("Offer ends in — 2 days · 04:11:22"), never a
  red urgency box: the sale-insert rule keeps `--accent` on discount figures
  only, and the honest-urgency rule bans invented ones, not backend-dated ones.

## Conversion spine (Baymard)

- Variant selection is buttons (shared `ProductVariantSelector`), never
  dropdowns; facet options are tappable buttons too (`GlobalFacetGroups`),
  multi-select within department and brand.
- Applied-filter chips above the grid with individual × and "Clear all"
  (`GlobalFilterChips`), writing the same URL params the shared actions parse.
- Mobile filtering is a full-screen sheet (`GlobalFilterSheet`) with a draft
  state and an explicit "Show N results" button — N is probed live against
  the products endpoint (per_page 1, debounced), never guessed.
- Sticky mobile buy bar (`GlobalStickyBuyBar`) appears via
  IntersectionObserver when the buy box scrolls out; price/variant/stock come
  from the PDP's single state; the PDP reserves constant bottom padding
  (no CLS); it sits above the bottom nav.
- Delivery-cost transparency: `GlobalDeliveryInfo` prints the flat intl rate
  and free-over threshold (`INTL_SHIPPING`) plus the estimated arrival date
  BEFORE the buy actions.
- Guest-first: no sign-in copy in the buy path; the account icon is quiet
  chrome. Reviews summary (4.x + count) prints beside the price only when the
  `reviews` feature flag is on and reviews exist.
- Gallery keeps thumbnails on mobile (shared `ProductImageGallery`).

## Browser surfaces

`global.css` themes selection (blue/white), caret (blue), thin scrollbars
(ink on newsprint), and underline offset, scoped to
`html[data-template="global"]`.

## Finish review

- Contrast: ink on white and muted-foreground (38% gray) on white/newsprint
  clear 4.5:1; on the accent band text is white on `3 75% 46%` red (≥4.5:1
  for the small validity line at semibold).
- States: hover (borders darken, tabs/plates settle up), disabled (muted
  buttons with not-allowed cursor), loading (spinner in sheet count + shared
  infinite-list loader), empty (listing empty state with a clear-all action;
  every home section collapses when its source is empty), focus
  (`ring-warm-focus` on every interactive element), keyboard (mega-menu
  closes on Escape, sheet closes on Escape and locks scroll, sticky-bar CTA
  untabbable while hidden).
- Coverage: section ids `featured-products`, `today-deals`, `top-selling`
  preserved for the smooth-scroll nav; feature flags gate their sections;
  currency always via `<Price>`/business settings; all images via
  next/image; no `px-*` on `.container`.
- Refuse-list check: no kickers/eyebrows, no icon-card scaffolds (footer
  terms are a ruled line of backed facts; help-card grid deleted), no
  gradient text, no emoji icons (lucide throughout), ranked numerals appear
  only where rank is information.
- Masthead search is the dominant instrument: full middle width, 3rem tall,
  2px ink rule box (blue on focus), small-caps placeholder — styled from
  template CSS (`.g-masthead-search`) around the shared HeaderSearch.

## Verdict

Shipped. The catalogue discipline holds: one red insert in a white book,
numbered plates on hairline rules, availability printed where the shopper
reads, and a single page-turn motion. Remaining honest gap: the datum is
restated per-section rather than one continuous line through the deal band
(the band is an insert laid on the page, which the print metaphor tolerates);
and new i18n keys currently fall back to their English defaults until the
locale files gain `global.*` entries (listed in the build report).
