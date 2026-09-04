# CLASSIC — "The Open Shopfront"

The classic template's visual world: the BD retail standard, executed better
than the stores it sits beside. A white shopfloor, photography loudest, and
one saturated vermilion-orange carrying every buy action. It refuses the beige
ledger metaphor it replaces *and* the banner-wall clutter of the marketplace
idiom — the standing exit, taken deliberately over another dealt metaphor.

Benchmarks: Daraz BD, Chaldal, Pickaboo. Seed key `144d8307`.

## World grammar

- **Field:** pure white (`--background`, `--card`); faint grey section bands
  (`--muted`) mark the alternating shelves; the footer is an ink band
  (`--secondary`). No paper, no rules, no texture.
- **Separation:** hairlines (`--border`) — never a box inside a box, never a
  coloured side rule. Depth appears only where something floats: the sticky
  masthead's shadow and a card's hover lift (`shadow-warm-*`, offset + blur).
- **One buy action per surface:** a card has exactly one vermilion order
  button. Add-to-bag is a quiet bordered icon beside it and saving for later
  is a quiet heart up with the price — so nothing ever reads as two competing
  CTAs, and the disabled state cannot be mistaken for a second action.
- **Signal:** vermilion-orange (`--primary`) is the only saturated colour and
  belongs to buy actions alone — order buttons, discount chips, the count
  badges, the call plate in the bottom bar, the current carousel dot. Deep
  green (`--success`) carries trust: cash on delivery, the delivery window,
  in-stock, savings. Grey (`--accent`) is a hover surface, not a colour event.
  `--destructive` is errors only.
- **Type:** Baloo Da 2 (`font-display`) at 700–800 for headings, prices and
  the logo; Hind Siliguri body. Obvious scale steps: h1 2xl/3xl→4xl, h2
  2xl→3xl, body sm/base, price lg→5xl by surface.
- **Corners:** 12px (`--radius`); cards `rounded-xl`, controls `rounded-lg`.
- **Money:** always `.classic-price` — tabular lining numerals at -0.02em, so
  a column of prices aligns. In a card the price is the single heaviest
  element (xl/2xl extrabold ink); the product name sits *below* it in weight
  (medium, muted) because the price is what sells.
- **Fallbacks:** `ClassicImage` degrades to a muted plate. Pass
  `fallbackIcon` + `hideFallbackLetter` on any surface whose subject is known
  (departments, brands) — an initial from Latin source data reads as a foreign
  monogram on a Bengali page, and the default "no image" glyph reads as a
  broken image. Product photos keep the initial + glyph.

## Structural devices (classic.css)

- `.classic-chrome` — the sticky masthead. Separates on a hairline until the
  page moves, then hands over to a soft shadow (`data-scrolled`).
- `.classic-band` — a full-width faint-grey shelf between hairlines. Never a
  card, never a radius.
- `.classic-price` — the money treatment described above.
- `.classic-slide-track` / `.classic-slide` — the carousel track. **The one
  authored motion of this world:** a 620ms exponential ease-out glide of one
  viewport width. `data-animate="false"` (reduced motion, or a swipe in
  progress) makes it a hard cut. Nothing else on the page animates position.
- `.classic-dot` — 44px hit area around an 8px mark; the current slide is a
  filled vermilion lozenge, the rest hairline rings.
- **Browser surfaces**, scoped to `html[data-template="classic"]`: selection
  wash, caret, `accent-color`, and the scrollbar are all themed from the
  tokens.

## Composition

- **Chrome:** a thin grey utility strip (cash on delivery · delivery window ·
  tap-to-call · variant switcher), then the white sticky masthead (logo,
  search, wishlist / bag / account), then the department line. On mobile a
  fixed bottom bar of five ≥48px targets with the call plate in vermilion.
  The footer is the ink band: particulars, useful links, the terms restated.
  In showcase mode only, a dashed pill in the utility strip carries the flask
  and the variant id (`BN-01`) — the switcher's own long label is suppressed
  so demo scaffolding never truncates mid-word inside shop chrome.
- **Department rail:** round photographs on the grey band with edge fades and
  pointer-only paddle buttons, so the list never clips mid-item.
- **Home:** the banner **carousel is the first content of the page**, then the
  delivery strip (per-zone fees from the cities API, the free-shipping
  threshold, the phone number) so the cost is known before any order button,
  then the offer rail (`today-deals`), the department photographs on a grey
  band, combo offers (`combo-offers`), featured on a grey band
  (`featured-products`), and top selling (`top-selling`) closing the scroll.
  Scroll-target ids are unchanged.
- **Listing:** heading + count, search and sort on one line (16px input floor,
  48px controls), the shared filter sidebar, and the infinite offer grid — two
  columns on phones — with the in-world empty state.
- **PDP:** photograph beside the offer (price anchoring, variants, quantity,
  combo rail, the delivery-fee table, COD / delivery window / confirming-call
  lines) with the vermilion order button last; description and reviews on the
  grey band; the order action repeated at the bottom of the scroll, clear of
  the mobile bottom bar; related products in the offer-card language.

- **Combo landing** (`product/ClassicCombo.tsx`): the PDP composition with the
  package swapped in for the product — photograph beside the offer, price
  anchoring, the packages as a hairline-separated radio list (never a box in a
  box), per-unit pickers, the delivery-fee table and the three trust lines
  before the vermilion order button, contents as a divided list on the grey
  band, and the order action repeated at the foot. The countdown is ink on the
  white field, not vermilion: it restates a real `ends_at`, but it is not a buy
  action, and this world spends its whole colour budget on the one that is.

### The mobile fold

Two surfaces are explicitly budgeted against the 390×844 first viewport, and
changing them means re-measuring it:

- **Delivery strip:** three tight rows on a phone (terms · zone fees in two
  columns · threshold + tap-to-call), collapsing to one line from `md` via
  `md:contents` on the row wrappers. Every fact stays visible at every width —
  only the shorthand changes (the fee label drops to the zone name, the call
  label to the number). It prints the first two zones plus a "+N more zones"
  count, so a merchant with more zones is never silently under-quoted; the
  full table prints on the PDP above the order button.
- **Carousel + first rail (mobile, 390×844):** measured — carousel 219px,
  strip 102px, heading 32px, first card top 584, photograph 585–756, price
  796–816. Photograph and price both clear the fold; the order button sits
  just under it, with the bottom bar's call target in the thumb zone.
- **Carousel + first rail (desktop, 1440×900):** measured — carousel 300px,
  first card top 644, photograph 645–965 (255 of 320px above the fold), price
  at 1004. **The price does not reach the desktop fold, and cannot with this
  composition.** The arithmetic: chrome 171 + carousel + dots 32 + strip 69 +
  heading block 72, then a 4-across 1:1 photograph is 320px and the price sits
  39px under it. Clearing 900 needs the card to start at ≤509px, i.e. a
  carousel under ~180px (a ribbon, not a window) — or a denser grid. Six
  across would do it (209px photographs) at the cost of the photography-first
  premise and a ragged last row for 8-item sections. Do not "fix" this by
  shrinking the carousel further without deciding that tradeoff explicitly.
- **PDP gallery:** the main frame is 1:1 at every width, but on a phone it is
  capped by viewport *height* (`max-w-[46vh]` on an `aspect-square` box, so the
  square shrinks without cropping or CLS) and the thumbnails drop to 56px.
  With the tightened breadcrumb and column gaps, the name, price and discount
  chip all land inside the fold. `lg` releases both caps.

## The carousel

`home/ClassicHeroCarousel.tsx`, fed by the `banners` prop.

- Full-width track, fixed aspect ratio held at every breakpoint
  (`16/9` → `21/9` at `sm` → `24/5` at `lg`), so there is zero CLS; `priority`
  on the first slide, the rest lazy. Nothing overlaid on the photograph. The
  ratios are a **fold budget, not a taste choice** — see below.
- Auto-advance every 5.5s; pauses on hover, on focus-within, when the tab is
  hidden, and on the explicit pause button. Under `prefers-reduced-motion`
  (watched live, not sampled at mount) it never advances by itself and slide
  changes are hard cuts.
- Dots as real buttons with accessible names, desktop-only prev/next as ink
  plates, touch swipe (44px threshold), ArrowLeft/ArrowRight when the
  carousel has focus, `aria-roledescription="carousel"`, each slide labelled
  "N of M", and a polite live region announcing the current slide.
- Slides link through `BannerLink`, so banner click tracking and the
  `/demo/<id>` variant prefix both survive.
- Degrades: zero banners render nothing; one banner is a static frame with no
  dots, arrows, pause or timer; a broken image falls back to the in-world
  `ClassicImage` plate.

## BD conversion spine

Cash-on-delivery badge and tap-to-call in the utility strip, the mobile bottom
bar and the footer; the delivery window everywhere it is claimed; per-zone
delivery fees from the cities API printed before every order button (home
delivery strip, PDP fee table); the free-shipping threshold from business
settings; "অর্ডার কনফার্ম করতে আমরা ফোনে কল করব" beside every order action;
order CTAs ≥48px, repeated at the bottom of the PDP scroll; price anchoring
(heavy current price, struck original, vermilion discount chip); two-column
mobile grid; 16px input floor; tabular numerals on all money; in-world
image/logo fallbacks. No remote third-party placeholder image anywhere: the
only non-API image URL in the template is the local `/placeholder.svg`, used
solely for cart-line payloads that shared code needs a URL string for.

## Finish review — verdict

Checked against the craft floor: no kickers or eyebrows, no icon-card
scaffold, no gradient text, no hard offset shadows, lucide icons only, no
coloured side rules, hairline separation instead of nested cards. Hover,
active, disabled, loading and empty states are present on every interactive
element; focus is visible everywhere via `ring-warm-focus`; icon-only buttons
carry `aria-label`; the carousel is fully keyboard operable and pausable.
Money is tabular; browser surfaces are themed. One authored motion moment
(the slide glide) and nothing else moving. `type-check` and scoped lint clean.

Verdict: **committed** — the standard, played straight and finished properly:
white field, one orange, photography given the room. Ship it.
