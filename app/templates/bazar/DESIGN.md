# bazar — "The Flexiload Counter"

Bengali-first paradigm for the `bazar` template (variant `bn-02`).

## Thesis

Commerce in the grammar of the flexiload counter — the mobile top-up shop
every Bangladeshi visits weekly: departments as SIM-coloured chips, offers as
a laminated tariff chart, the phone number as identity. It refuses the
department-sidebar WooCommerce bazaar arrangement. Form: the flexiload
counter (candidate 6 of 7, seed key bd057c37). The full direction contract is
embedded verbatim as the first child of `BazarHome`'s root element.

## World grammar

- **Palette.** Laminated chart-white field (`--background`), board-black
  chrome (`--secondary`), tariff-azure primary, offer-red accent. Semantic
  tokens live in `globals.css` under `html[data-template="bazar"]`;
  components consume only semantic Tailwind classes. The one template-owned
  raw-HSL surface is the SIM-colour department cycle
  (`--dept-1..--dept-6`: azure / red / amber / green / violet / teal at
  chart saturation) in `bazar.css`, with lifted dark-mode overrides.
- **Colour-coded causality.** Each department owns ONE hue end-to-end,
  assigned by top-level category index (`dept-color.ts:deptStyle`). A
  component scopes `--dept` once; `.bz-dept-chip` / `.bz-dept-dot` /
  `.bz-dept-band` read it. The colour is never restated in TSX and never
  remixed — the home rail, the listing rail, and the category tiles all
  resolve the same index to the same hue. The SIM colours are a system, not
  any telco's trade dress.
- **Hard band boundaries.** Crossing a section is a chart break: one
  full-width 3px rule whose leading segment carries the section colour,
  folded INTO the board-black rule (`BazarSectionBand`) — never a floating
  marker above the heading. Breadcrumb strips close with the same 3px board
  rule.
- **Type.** Anek Bangla Variable (`font-display`) for headings, prices, and
  the phone number; Hind Siliguri body. Every money figure sits on tabular
  numerals (`.bz-num`).
- **Corners.** 8px laminated-chip corners everywhere (`--radius: 0.5rem`,
  `rounded-lg`); no pill buttons — pills are status only (filter count).
- **Keypad grammar (the authored moment).** Every actionable surface is a
  key: `.bz-key` depresses 1px with shadow collapse on press. The mobile
  bottom nav is a five-key keypad on board-black in the thumb zone; the
  order steps are Bengali keypad digits (১ ২ ৩ — the sequence IS the
  information); the floating call FAB is a board-black key that slides its
  number out on hover/focus. Tariff rows enter with a transform-only
  45ms-staggered rise (`.bz-row-enter`), visible by default and gated on
  `prefers-reduced-motion`.
- **Broken data degrades in-world.** Every product/category image renders
  through `BazarImage`: a missing URL or a load error (404) becomes a
  chart-white plate with the item's initial in the display face — never the
  browser's broken-image glyph. The brand mark (`BazarBrandMark`) likewise
  falls back to a `site_name` wordmark in header and footer, and the PDP
  image well is the in-template `BazarGallery` built on the same primitive.
- **Browser surfaces.** Selection paints azure, caret and form accents are
  azure, scrollbars are board-black on chart-white — all scoped to
  `html[data-template="bazar"]` in `bazar.css`.

## BD conversion spine

- **Phone-first.** Tap-to-call number as an azure key in the board strip of
  the header (all widths), a CALL key in the keypad nav, the floating call
  key, "ফোনে অর্ডার করুন" on the PDP, and the number restated in the footer.
- **COD + promise.** "ক্যাশ অন ডেলিভারি" badge and the delivery promise
  ("ঢাকায় ২৪–৪৮ ঘণ্টা, ঢাকার বাইরে ২–৩ দিন") in the header strip, the footer,
  and the PDP delivery chart.
- **Fees before the ask.** `BazarDeliveryChart` prints per-zone fees (from
  `GET /cities`), the `free_shipping_on_over` threshold, COD, the promise,
  and the phone-confirm trust line ABOVE the buy keys; when the cities API
  is empty it degrades to the trust lines, never disappears.
- **Order keys ≥48px** (min-h-12 tiles, min-h-14 PDP), repeated at the PDP
  bottom after the tabs with the trust line.
- **Stock always printed** — "স্টকে আছে" / "স্টক শেষ" as a chart tag on every
  tile, tariff row, and the PDP; never hidden, never a rotated ribbon.
- **Price anchoring.** Heavy tabular azure current price, struck original,
  offer-red minus-savings tag. 2-col mobile grid; 16px input floor.

## Composition

- **Home** (`BazarHome`, async Server Component): tariff-board hero
  (`BazarTariffBoard` — today's deals as chart rows with one-tap add keys,
  falling back deals → featured → top-selling so the board opens populated
  whenever any product data exists; the 7/5 hero split only renders when
  both board and poster are present — a lone one takes the full row) beside
  the laminated poster banner → SIM-coloured department rail → three-step
  "কীভাবে অর্ডার করবেন" strip → featured band → top-selling band → category
  tiles → promo posters. Section ids `today-deals`, `featured-products`,
  `top-selling` preserved for the smooth-scroll nav.
- **Listing**: breadcrumb chart strip with tabular result count, the same
  department rail (active department goes board-black, keeps its dot),
  active-filter status pill with a clear key, shared `ProductsInfiniteList`
  with `BazarProductCard`, and an in-world empty state that offers the call.
- **PDP**: gallery left; purchase column reads name → printed stock →
  chart-entry price → variants → combo link cards → delivery chart → the
  keypad order strip (one block: `BazarQuantityKeys` quantity keys over the
  two order keys, phone/wishlist keys) → share. Tabs, repeated order keys
  behind a board rule, related-products band.
- **Combo landing** (`product/BazarCombo.tsx`): the package as a tariff sheet.
  Breadcrumb chart strip → gallery → chart-entry price → the packages as rows
  you press (`.bz-key`, selected carries a primary bar and a tinted field) →
  per-unit picker → `BazarDeliveryChart` → the keypad order block → trust
  chart lines. Contents print as a `.bz-chart-divide` chart with tabular
  counts under a `BazarSectionBand`, and the order keys repeat behind the 3px
  board rule. The countdown takes board-black cells, the counter's display —
  it is never given the offer red, which stays a savings signal.
- **Chrome**: counter header (board strip + chart-white search row closed by
  the board rule), keypad mobile nav, floating call key, counter-board
  footer (identity chip, contact chart lines, COD/promise restated, keypad
  newsletter form, copyright rule) — the page ends on the board.

## Finish review — verdict

Checked against the craft floor and the direction contract: contract
embedded verbatim; dept cycle defined once and never remixed; hard band
boundaries on every section crossing; no kickers/eyebrows, no icon-card
scaffolds (steps are inline digits on one strip), no gradient text, no
emoji-as-icons (lucide throughout), no rotated ribbons, no >1px colored side
borders; hover/disabled/loading/empty states present (key depress, muted
disabled keys, newsletter spinner, in-world empty chart); focus via
`ring-warm-focus`, aria labels and `aria-pressed`/`aria-current` on toggles
and rails; selection/caret/scrollbar themed; tabular numerals on all money;
`npm run type-check` and `next lint --dir app/templates/bazar` clean.
**Verdict: ships.** Known trade-offs: tariff-board one-tap add uses the
first variant (same rule as the shared card); delivery fees depend on the
backend cities API and degrade to promise-only when it is down.
