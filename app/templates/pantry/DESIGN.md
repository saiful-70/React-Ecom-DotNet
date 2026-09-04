# pantry — "The Natural Pantry"

Single-brand Bengali natural-food paradigm for the `pantry` template
(variant `bn-03`).

## Thesis

The shop where the food is photographed, not merchandised. It refuses the
banner-wall marketplace grid AND its predictable opposite, the cream-paper
artisanal metaphor world: PRODUCT.md bans metaphor worlds for the BD
market, so the category standard (ghorerbazar / naturobd direct-to-consumer
food retail) is played straight at full craft. Form: the BD single-brand
natural-food storefront, the standing exit pinned by PRODUCT.md's BD brand
commitment over the rolled metaphor challengers (seed key 6f5fa93a). The
full direction contract is embedded verbatim as the first child of
`PantryHome`'s root element.

The conversion model is the paradigm's real difference: the product page
carries a cash-on-delivery **order form**, not a cart button. No cart step,
no `/checkout`, no account.

## World grammar

- **Palette.** White counter ground (`--background` `0 0% 100%`) so the
  goods are the loudest thing on screen; olive ink (`--foreground`
  `96 14% 12%`); leaf green as the buy colour (`--primary` `146 62% 22%`)
  and forest green as chrome (`--secondary` `147 52% 13%`); stone-green
  bands (`--muted` `84 24% 96%`, `--muted-foreground` `100 9% 36%`); honey
  amber (`--accent` `32 88% 42%`) as the only other saturated colour; stone
  hairline (`--border` `96 12% 88%`, `--input` `96 12% 80%`); trust green
  (`--success` `150 48% 28%`); `--destructive` `0 70% 44%`;
  `--bundle-save` `32 88% 38%`; green-tinted shadow base (`--shadow-warm`
  `140 30% 12%`). Tokens live in `globals.css` under
  `html[data-template="pantry"]`; components consume only semantic Tailwind
  classes — this world defines no raw-HSL surface of its own.
- **Dark is the pantry after closing**, hand-tuned rather than inverted:
  field `150 18% 7%`, cards `150 15% 10%`, ink `60 14% 92%`, buy green
  lifted to `146 48% 42%`, amber lifted to `32 82% 52%`, chrome `150 14% 14%`,
  trust `150 42% 44%`, rules `150 10% 21%`, shadow base `150 60% 2%`.
- **Type.** Tiro Bangla (`--font-display`) at **weight 400 only** — the
  single face is self-hosted as `@fontsource/tiro-bangla/400.css` and there
  is no bold cut, so *every* emphasis in the display face is scale, never
  `font-bold`. Hind Siliguri (`--font-bengali`) carries body, labels,
  buttons and all money. Ramp as built: hero name
  `clamp(1.875rem, 7vw, 4.25rem)` at 1.06 / `-0.015em` (`.pn-billboard`);
  promise heading `3xl → 5xl → 6xl`; PDP name `3xl → 4xl → 2.75rem` at
  1.12; section headings `2xl → 4xl`; sub-headings `2xl → 3xl`; card and
  ranked-row names `base → lg`; body at `text-base` with `leading-relaxed`,
  prose capped at `70ch`; form labels `text-base font-semibold` sans.
- **Corners.** 10px everywhere (`--radius: 0.625rem`, `rounded-lg`) — the
  pack-tile corner. Small chrome and thumbnails take `rounded-md`; pills are
  status only (discount chip, cart/wishlist count badges).
- **The shelf edge** (`.pn-shelf`): a 2px `--primary` rule with a soft
  green-tinted shadow falling from it. It is the world's only structural
  line above 1px and it means exactly one thing — goods below. It closes the
  masthead, the hero, every shelf section, the deals band and the listing's
  label band.
- **Hairlines, never cards, for facts.** `.pn-proof` divides on 1px
  `--border`: horizontal rules between rows on a phone, vertical rules
  between columns from `sm`. Used by the home proof rail and the PDP
  provenance block.
- **The photographic scrim** (`.pn-scrim`): a bottom-anchored forest
  gradient (`--secondary` at 0.92 → 0.72 → 0.28 → 0) so type clears 4.5:1
  over whatever the client uploaded, while the top of the food stays
  visible. Never a flat overlay across the whole image.
- **The sold-out hatch** (`.pn-hatch`): a fine 135° diagonal repeat in
  `--secondary` at 0.28 printed over the photograph. Out of stock is marked
  on the goods in the world's own material — never a grey wash that makes
  food look spoiled.
- **Pack tiles** (`.pn-pack`): physical things. 120ms transitions, 1px
  depress on `:active`, selected state a *filled* green field
  (`bg-primary`), never a tint. Both the transition and the travel are
  disabled under `prefers-reduced-motion`.
- **Browser surfaces** are scoped in `pantry.css`: selection paints
  `--primary / 0.18` (deliberately overriding the global amber selection —
  amber may not leak here), caret is green, the scrollbar is a green thumb
  on the stone band, and links carry a `0.22em` underline offset.
- **Motion** is per-surface and small: card image `scale-1.03` on hover
  (`motion-safe:` only), deals and department tiles lift 1px
  (`motion-reduce:` guarded), the pack-tile press, and the call FAB sliding
  its number out on hover/focus. The sticky order bar's translate and the
  FAB's slide are not reduced-motion gated — recorded as built, not as a
  rule to copy.

### Named rules

**The Amber Rule.** Honey amber (`--accent`) appears if and only if the
backend returned a real reduction — `discountPercent()` non-null, or a combo
whose `compare_at_price − price` is positive. Its five sanctioned surfaces
are: the hero discount chip, the card discount chip, the deals band's own
field and tile chips, the PDP's percent-off figure, and the PDP combo
savings figure. Nowhere else: no amber in the header, the promise bar, the
footer, the proof rail, the order form, the selection colour, or any nav
state. The world's whole trust argument rests on amber being unbuyable.
Note the one hazard the tokens carry: `--warning` resolves to the same
`32 88% 42%`, so a warning surface would be indistinguishable from a
discount — no pantry surface currently uses it.

**The Shelf-Edge Rule.** `.pn-shelf` — 2px `--primary` plus its dropped
shadow — is the only structural line thicker than 1px in this world, and it
means "goods below". Everything else that divides is a 1px `--border`
hairline. A 2px rule used decoratively, or a shelf edge with no goods under
it, is off-world.

**The One-Money-Voice Rule.** The price ladder a shopper actually reads
down — shelf tile, ranked row, PDP headline, thumb-zone sticky bar — is
bold tabular *sans* in `text-primary`, never the display serif, and struck
originals are muted, line-through and tabular beside it. The hero price is
the same bold tabular sans but inherits `secondary-foreground` because it
sits on the forest scrim. Two sanctioned exceptions, both because the money
is not the thing being read: the order form's item-total and delivery-charge
rows stay plain, because they are the bill's supporting lines and the payable
total beneath them is what carries the weight; and the pack-tile price stays
`font-semibold` inheriting the tile's own foreground, because a selected tile
is a filled green field and `text-primary` on it would be invisible. Every
other money surface — including the deals-band tile, the payable total and
the PDP combo price, all three brought into line after the finish review —
takes the bold tabular sans form, and new ones must too.
`tabular-nums` itself is universal, including the phone number and the
order reference.

**The Green-Family Rule.** Buy (`--primary`), chrome (`--secondary`) and
trust (`--success`) all resolve to green in this world, on purpose: in
natural food, green reads "pure", and splitting the trust line off into a
foreign hue would cost more than the ambiguity does. The honest cost is
that this world's slot separation is **weaker than its siblings'** — a
reader cannot tell buy from chrome from trust by hue alone, only by
lightness, fill and position (green fill + ≥48px + `primary-foreground`
text = buy; whole filled forest regions = chrome; green *text* on a light
band = trust). Any new green surface must declare which of the three it is
by those cues, and a fourth green meaning may not be added.

## What this world does not have

- **No secondary navigation bar** and **no mobile bottom nav**
  (`Navigation: null`, `MobileNav: null` in `index.ts`). A handful of
  departments needs a home rail, not a mega-menu; and two fixed bars on a
  360px phone is one too many. Consequently pantry is absent from the
  `--mobile-nav-offset` list in `globals.css` — instead the sticky order bar
  publishes its own measured height as `--pn-order-bar` on `<html>` while
  mounted, and the floating call FAB lifts by it.
- **Floating tap-to-call is the only floating action** (`PantryCallFab`),
  right-anchored, rendering nothing when the business has no phone number.
- **No delivery-window claim, no return-window claim, no purity or sourcing
  claim** anywhere. Business settings carry no such field and this template
  serves every client, so all three were removed in a review round. They
  must not come back: the only delivery statements shipped are "nationwide,
  charge depends on area", the real per-city charge once an area is chosen,
  and the merchant's own `free_shipping_on_over` threshold when it is a
  positive number.
- **No urgency stack** in the deals band: no countdown (no endpoint gives an
  end time), no "only 3 left" (stock says nothing about the offer), no
  rotated corner ribbon.
- **No marketplace apparatus on the listing page**: no facet rail of its
  own, no breadcrumb chain, no chip wall, and pagination rather than
  infinite scroll — a single-brand shop has an end and a shopper is allowed
  to reach it. The shared toolbar's search is opted out because the header
  carries a permanent one.

## Composition

- **Home** (`PantryHome`, async Server Component) — the shop walked front to
  back: window → why it is pure → shelves → departments → today's price
  cuts → what we promise at the door.
  - `PantryHeroShelf`: one flagship good full-bleed at `68vh` on a phone
    (`32rem` / `36rem` from `md`), chosen as the first featured-or-latest
    product with both a photograph and stock, degrading through photograph,
    then anything, then the plate. Name, price, struck original, one ≥48px
    green order button and the COD line all sit inside the scrim base;
    `.pn-shelf` closes it; a stone terms band prints COD and the
    free-delivery threshold when one is configured.
  - `PantryProofRail`: hairline rail of two fixed facts (payment, nationwide
    delivery with area-dependent charge) plus a third **provenance cell only
    when `proofLines()` returned one** for that product; the grid drops to
    two columns when it did not, so nothing stretches.
  - **Three shelf densities**, because three identical grids are a wall, not
    a shop, and the layout is a property of what the shelf *means*
    (`PantryShelfSection`): `grid` (the picked selection — 2 / 3 / 4 full
    tiles), `rail` (new arrivals — a snap-scrolling sideways rail at every
    width, on the stone band), `ranked` (order volume — a compact numbered
    row per good, two columns of rows on desktop, rank in the display face,
    56/64px thumbnail dropped entirely when there is no photograph because a
    name-plate is unreadable at that size). Every density closes on
    `.pn-shelf`.
  - `PantryCategoryRail`: departments as identical square tiles, snap-scroll
    on phones and a 4-column grid from `md` (the scroll container is dropped
    so it can never trap a vertical swipe), capped at `MAX_DEPARTMENTS = 8`
    with a "view all" link when the backend returns more. Below it **at most
    one** banner runs as an editorial scrim strip; the rest are ignored.
  - `PantryDealsBand`: the only amber field on the page.
  - `PantryPromise`: full forest field, the largest type after the hero, and
    one action — phoning the shop. A service statement, never a sourcing
    one; `support_time` prints only if set, and with no `contact_phone` the
    band speaks without offering a call.
- **Listing** (`PantryProductListing`): a stone label band with the shelf
  name and a tabular count, the COD line (and threshold when set) restated
  for search-engine arrivals, `.pn-shelf`, then the shared toolbar, sidebar
  filters, `ProductsGrid` with `CardComponent={PantryProductCard}` and
  `ProductPagination`. Empty shelf says so plainly and hands back two real
  ways out: all products, or the shop's phone.
- **PDP** (`PantryProductDetails`, client component): square gallery on
  6 of 12 columns, buy column on the other 6 — name in the big serif, then
  price / struck original / percent-off / real stock count on one line, then
  the **order form itself**. The cart survives as a quiet underlined
  text-weight control beside it, never competing. Below the decision:
  description (`70ch`), catalogue metadata printed as metadata (brand,
  category, SKU — never under a provenance heading), provenance only when
  the backend returned it, combo link cards, reviews, and a repeated stone
  order block carrying the price.
- **Combo shelf** (`PantryCombo`): the same 6/6 split as the PDP — photograph
  left, decision right. Name in the big serif, one money voice, the packages
  as `.pn-pack` tiles that fill green when chosen, per-unit pickers, then the
  bill (total, saving, closing date) above a ≥52px green order button and the
  two cash-on-delivery promises in trust green. The bag stays the quiet
  underlined path. Contents run as a shelf of photographed goods closed by
  `.pn-shelf`; the trust badges take the `.pn-proof` hairline rail. Amber
  appears only on a real reduction, so the closing date prints plain.
  **Deliberate deviation:** this page does *not* carry the on-page order form.
  A bundle order needs a server-validated tier quote at checkout, which
  `placePantryOrder` (single product, single variant) cannot express, so the
  order button goes to the scoped buy-now checkout. Reversing this means
  teaching the pantry order action about bundle tiers and quotes first.
- **Order form** (`PantryOrderForm`): pack rail → quantity keys → name +
  phone (paired from `sm`) → area select → address → optional note folded
  into a native `<details>` → **the bill, above the button** (item total,
  real per-city delivery charge, payable total; with no area chosen the
  delivery row does not exist and a line says so) → the green confirm
  button → the two COD promises in trust green. Zod v4 schema rebuilt per
  locale so validation speaks Bengali, hand-bridged to react-hook-form (no
  `@hookform/resolvers` dependency), BD phone normalised on input. On
  success the form is *replaced* by a confirmation panel — never a silent
  navigation — which prints the real order reference or admits it does not
  have one.
- **Chrome**: forest terms bar (COD + the real phone number, at every width,
  plus the self-gating language and variant switchers) → white sticky
  masthead (logo, search, bag, account) closed by `.pn-shelf`; forest footer
  whose every line is settings-backed, with no placeholder address, invented
  hours, catalogue description, certification or payment logo; floating call
  FAB.
- **Degrade states.** `PantryImage` renders a stone plate bordered by the
  world's hairline carrying the item's **name** in the display face — not an
  initial, which reads as a broken image and collides the moment two items
  share a letter — sized per `plateScale` (`card` `2xl→3xl`, `hero`
  `3xl→5xl→6xl`) so it fills the box; `plateLabel={false}` on the department
  rail (the caption already names it) falls back to a `primary/40` leaf
  glyph instead. A new `src` gets a fresh chance, so gallery switching
  recovers. `PantryLogo` degrades a missing or 404 logo to the `site_name`
  wordmark in the display face at `2xl→3xl`, never `font-bold`.

## Honest-data behaviour

- The **deals band collapses entirely** when no product carries a real
  discount: the backend's `today_deal` flag is set independently of price,
  and the band is headed "prices have dropped", so `PantryHome` filters the
  flagged set by `discountPercent() !== null` and renders nothing if empty.
- The **proof rail drops its provenance cell** when `proofLines()` is empty.
  `proofLines()` reads only backend attributes whose name matches a
  provenance key (bn + en: origin/source/district/weight/purity/process and
  their Bengali equivalents), caps at 4, and deliberately has **no
  brand/category fallback** — filling a "where this came from" cell with
  catalogue metadata would turn a proof into a label. The PDP provenance
  section is omitted on the same condition, so a page can make no origin
  claim at all.
- `stockLine()` prints a real number or nothing; "only N left" is
  `stock <= 5` against a real field, never invented scarcity.
- `free_shipping_on_over` arrives as a string and is `"0"` on shops that
  grant none; both the hero band and the listing band print it only when it
  parses to a positive number.
- Sections collapse rather than render filler, every footer and promise line
  is omitted when its setting is absent, and the confirmation panel says the
  reference is not available yet rather than inventing one.

## Known gaps, recorded as built

- **The pack-size tile rail is real code no fixture exercises.**
  `packOptions()` returns `[]` below two variants, so `.pn-pack` tiles, the
  card's "choose a pack" action and the PDP's pack-driven price only appear
  for a product with two or more backend variants. No current demo product
  has them, so the rail has never been seen in the showcase.
- **The PDP order button falls slightly below a 1440×900 fold for
  multi-pack products.** The pack rail's extra row pushes it under. The
  sticky order bar is `md:hidden` by design, so it covers this on phones
  only — at 1440×900 there is no in-viewport CTA below the fold-line; the
  in-page mitigations are the paired name/phone row, the folded note field,
  and the six-column gallery split that shortens the head.

## Finish review — verdict

Contract embedded verbatim; palette is the globals.css block with no
template-owned raw HSL; amber confined to real backend reductions;
`.pn-shelf` the only >1px structural line; no kickers or eyebrows, no
icon-card scaffolds (the promise band is type and one action), no gradient
text, no emoji-as-icons (lucide throughout), no rotated ribbons, no
countdowns, no colored side borders above 1px. States present: hover,
disabled (muted pack tiles, disabled CTAs), loading (order submit spinner,
wishlist spinner), empty (in-world empty shelf offering the phone),
sold-out (hatch on the goods + forest chip + disabled action), server error
(alert with a phone fallback). Focus via `ring-warm-focus` throughout;
`aria-pressed` on pack tiles and gallery thumbs, `aria-invalid` +
`aria-describedby` on every field, `role="status"`/`aria-live` on the
confirmation, `aria-labelledby` on every section; `tabular-nums` on all
money, counts, phone numbers and references; 16px input floor and ≥44px tap
targets. **Verdict: ships**, with the two gaps above open. The
one-money-voice deviations this document first logged were closed in the same
pass, except the two sanctioned exceptions named under that rule.
