---
name: DebuggerMind Storefront
description: One storefront chassis, four template-scoped visual worlds plus the original classic storefront, themed per client by token override.
colors:
  classic-mint-cream: "hsl(140 30% 97%)"
  classic-green-black: "hsl(152 30% 10%)"
  classic-leaf-forest: "hsl(142 56% 30%)"
  classic-deep-forest: "hsl(152 68% 11%)"
  classic-mint-band: "hsl(140 28% 93%)"
  classic-bright-leaf: "hsl(128 50% 42%)"
  classic-coral-save: "hsl(4 74% 64%)"
  classic-green-gray: "hsl(142 18% 85%)"
  bazar-chart-white: "hsl(210 20% 98%)"
  bazar-marker-ink: "hsl(220 20% 9%)"
  bazar-tariff-azure: "hsl(203 91% 40%)"
  bazar-counter-board: "hsl(220 20% 12%)"
  bazar-offer-red: "hsl(2 76% 50%)"
  bazar-chart-rule: "hsl(210 14% 85%)"
  global-catalogue-page: "hsl(0 0% 100%)"
  global-print-ink: "hsl(0 0% 7%)"
  global-catalogue-blue: "hsl(217 70% 37%)"
  global-ink-navy: "hsl(217 45% 15%)"
  global-sale-red: "hsl(3 75% 46%)"
  global-hairline-rule: "hsl(0 0% 86%)"
  premium-viridian-lacquer: "hsl(160 62% 13%)"
  premium-label-stock: "hsl(42 45% 94%)"
  premium-foil-gold: "hsl(45 55% 52%)"
  premium-deep-lacquer: "hsl(162 55% 9%)"
  premium-vermilion-seal: "hsl(8 81% 50%)"
  premium-foil-hairline: "hsl(46 30% 38%)"
  pantry-counter-white: "hsl(0 0% 100%)"
  pantry-olive-ink: "hsl(96 14% 12%)"
  pantry-leaf-green: "hsl(146 62% 22%)"
  pantry-forest-chrome: "hsl(147 52% 13%)"
  pantry-honey-amber: "hsl(32 88% 42%)"
  pantry-stone-band: "hsl(84 24% 96%)"
  pantry-stone-hairline: "hsl(96 12% 88%)"
typography:
  classic-display:
    fontFamily: "Noto Serif Bengali Variable, Hind Siliguri, ui-serif, serif"
    fontWeight: 700
  bazar-display:
    fontFamily: "Anek Bangla Variable, Hind Siliguri, ui-serif, serif"
    fontWeight: 700
  global-display:
    fontFamily: "Archivo Variable, ui-serif, serif"
    fontWeight: 900
    letterSpacing: "-0.025em"
  premium-display:
    fontFamily: "Bodoni Moda Variable, ui-serif, serif"
    fontWeight: 700
  pantry-display:
    fontFamily: "Tiro Bangla, Hind Siliguri, ui-serif, serif"
    fontWeight: 400
  body-bengali:
    fontFamily: "Hind Siliguri, Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
  body-global:
    fontFamily: "Archivo Variable, Inter Variable, ui-sans-serif, sans-serif"
    fontWeight: 400
  body-premium:
    fontFamily: "Jost Variable, Inter Variable, ui-sans-serif, sans-serif"
    fontWeight: 400
rounded:
  classic: "0.875rem"
  bazar: "0.5rem"
  global: "0.125rem"
  premium: "0.125rem"
  pantry: "0.625rem"
  pill: "9999px"
spacing:
  gutter-mobile: "16px"
  gutter-tablet: "24px"
  gutter-desktop: "32px"
---

# Design System: DebuggerMind Storefront

## Overview

**Creative North Star: "One Chassis, Five Counters"**

There is no single house style here; there is a single house *contract*. The storefront is one chassis — shared routes, shared data actions, shared semantic token slots — dressed by five complete visual worlds, one per template. `app/layout.tsx` stamps the active template id on `<html data-template="…">`, and `app/globals.css` resolves every semantic token for that world by attribute selector. A component never knows which world it lives in: it asks for `bg-primary` or `border-border` and the world answers. Swap the attribute and the same product card is an open-shopfront offer card, a laminated tariff row, a catalogue plate, a batch label, or a pantry shelf tile.

Three of the worlds are a material object rendered honestly — the flexiload top-up counter (bazar), the great mail-order catalogue (global), the apothecary batch label (premium). `pantry` is deliberately *not* a metaphor: it is the Bangladeshi single-brand natural-food shop played straight, and it is the world bound by a standing product commitment. PRODUCT.md fixes that constraint for the BD market — white surfaces, photography-led merchandising, one saturated signal colour on every buy action, no metaphor world, with Daraz BD / Chaldal / Pickaboo as the craft bar. `classic` sits outside the scheme entirely: two authored worlds were built on it and both were rejected, so it carries the original storefront instead. Do not redesign it without an explicit new decision. The worlds still diverge hard — mint-cream vs. lacquer, 14px vs. 2px corners, didone vs. grotesque — but they obey the same invariants: money is always tabular, the page gutter lives in exactly one place, status is a pill and a pill is never a control, colors resolve only through tokens, broken data degrades in-world, and no surface fabricates a claim the backend cannot back. The direction contract for each world is embedded verbatim as a `<script type="text/x-impeccable-contract">` block in its HomeLayout.

Above the worlds sits a third layer: per-client variant overrides (`app/variants/theme.ts`) injected as a server-rendered `<style>` using triple-`:root` selectors, so a client can retint any world without touching code. Confirmed rejections, shared by all five worlds: the generic shadcn default look, the banner-wall Bangladeshi marketplace, the Amazon-clone carousel arrangement, and the Temu urgency stack.

**Key Characteristics:**
- Five self-contained visual worlds selected by `data-template`, all speaking one semantic token vocabulary
- A three-rung cascade ladder: `:root` default → template block → `:root:root:root` client override
- Per-world display and body faces routed through two font variables (`--font-display`, `--font-bengali`)
- World-tinted shadows (`--shadow-warm`) instead of neutral black, everywhere
- A single shared reservation token, `--mobile-nav-offset`, so a template's fixed mobile bottom bar is never overlapped by a floating action
- Zoned BD conversion spine (COD, tap-to-call, Dhaka fees) in the Bengali worlds; flat-rate, estimated-date, guest-first spine in the international worlds
- Honest data: empty sections collapse, broken images become typographic plates, urgency only when the backend flag backs it

### The Five Worlds

Each world owns a full DESIGN.md next to its code; the notes below are the index card, not the depth.

**classic — "Leaf & Forest"** (variant bn-01). Not a designed world in the sense the other four are: the original storefront, restored on 2026-09-04 at the product owner's request after both authored worlds were rejected. Forest and leaf greens on mint-cream (`--primary 142 56% 30%`, `--background 140 30% 97%`), white cards at a soft 14px radius, Noto Serif Bengali display over Hind Siliguri body, and the token-driven saffron and terracotta gradients on promo surfaces. Its tokens live in the `:root` block of `globals.css` rather than a `data-template` block, so classic is the default every other world overrides. It owns only `ClassicHome` and `ClassicProductListing`; chrome, PDP and combo landing are the shared components under `app/components/`.

Two authored worlds were built here and both were rejected: a khata/ledger metaphor (commit `7096645`) and "The Open Shopfront", a white-field vermilion retail world (commit `e51a4ab`). Read them out of git if the question comes up again. Neither is in the tree.

**bazar — "The Flexiload Counter"** (`app/templates/bazar/DESIGN.md`, variant bn-02). The mobile top-up shop: laminated chart-white field, board-black chrome, tariff azure as primary, offer red as accent. Anek Bangla display over Hind Siliguri body; 8px laminated-chip corners. Signature devices: the SIM-colour department cycle (each department owns one hue end-to-end via a scoped `--dept` variable), 3px section-band chart breaks, and the keypad grammar — every actionable surface is a `.bz-key` that physically depresses 1px on press, up to the five-key mobile bottom nav and the sliding call FAB. **The One-Hue-Per-Department Rule.** A department's colour is assigned once by category index and never remixed downstream.

**global — "The Mail-Order Index"** (`app/templates/global/DESIGN.md`, variant intl-01). The great catalogue: white page, print ink, catalogue blue for actions, ink-navy chrome, 1px hairline rules structuring everything, 2px print corners with ink registration marks. Archivo carries both display (900, uppercase, tight) and body; every product bears a derived item number (`No. 004-217`). Signature devices: the composed hero tableau (never a carousel), the horizon-datum rule grammar, the printed availability course with an estimated arrival date, and a single slide-and-settle motion. **The Sale-Insert Rule.** Catalogue red appears only inside the deals insert band and on discount figures — nowhere else, not even wishlist states.

**premium — "The Batch Label"** (`app/templates/premium/DESIGN.md`, variant intl-02). Apothecary packaging: the page *is* viridian lacquer, the buy panel is a floating label-stock card, foil gold carries the purchase action, vermilion is the wax-seal accent. Bodoni Moda didone at real scale contrast over small tracked Jost caps; 2px box-board corners framed by foil hairlines and L-corner marks. Signature devices: the LOT provenance line inside every label, exploded numbered spec callouts pinned over photography, physically pressed variant keys (inset shadow + travel, never tint-only), and the vermilion seal-press on add-to-cart. **The Four-Colour Rule.** No fifth hue exists anywhere in this world; even warnings resolve to gold and vermilion.

**pantry — "The Natural Pantry"** (`app/templates/pantry/DESIGN.md`, variant bn-03). The Bangladeshi single-brand natural-food shop, played straight — the second non-metaphor world, taken under the same standing BD commitment as classic. A white counter ground so the food is the loudest thing on screen, olive ink, stone-green bands, leaf green (`{colors.pantry-leaf-green}`) on every buy field and forest green (`{colors.pantry-forest-chrome}`) owning whole regions — promise bar, promise band, footer. Tiro Bangla at weight 400 *only* (there is no bold cut, so emphasis is scale) over Hind Siliguri body; 10px pack-tile corners. Signature devices: the **cash-on-delivery order form on the product page itself** in place of a cart checkout, the 2px green shelf edge (`.pn-shelf`) closing every band of goods, three shelf densities by meaning (grid / snap rail / numbered ranked list), pack-size tiles that depress and fill green rather than tint, and the diagonal sold-out hatch printed on the photograph. No secondary nav and no mobile bottom nav: a floating tap-to-call plus the PDP's phone-only sticky order bar. **The Amber Rule.** Honey amber (`{colors.pantry-honey-amber}`) appears only where the backend returned a real reduction — nowhere else, not in chrome, not in nav states, not even in the selection colour.

## Colors

Color is a fixed vocabulary of semantic slots filled differently by each world; a slot means the same *job* everywhere.

### Primary
- **`--primary` / `--ring`** — the buy slot: the colour of order actions, active prices, and focus rings. Leaf-forest green in classic, tariff azure in bazar, catalogue blue in global, foil gold in premium, leaf green in pantry. Whatever the world, the brightest instance of this slot on screen is the purchase path.

### Secondary
- **`--secondary`** — the chrome slot: masthead, footer, bottom nav, counter edges. Classic uses it for the ink footer band and icon plates (its masthead is white), then counter board-black, ink navy, deep lacquer, and pantry's forest green. Chrome frames the goods and never becomes a call to action — pantry is the one world where chrome and buy share a hue family, which its own DESIGN.md records as a deliberate cost.

### Tertiary
- **`--accent`** — the second signal *where a world has one*: the offer-red chip (bazar), the sale-insert red (global), the vermilion seal (premium), the honey amber of a real discount (pantry). Classic is the deliberate exception — its accent is a neutral grey hover surface, because that world spends its whole colour budget on the single vermilion buy signal. Each world's own DESIGN.md restricts where its accent may appear; the restriction travels with the world, not with this file.
- **`--destructive`, `--success`, `--warning`, `--bundle-save`** — feedback slots, each with a paired `-foreground`. `--success` carries classic's trust lines (cash on delivery, the delivery window, in stock) and pantry's (cash on delivery, phone confirmation). `--bundle-save` exists so a savings claim is never confused with an error: it resolves green in classic, and lands in the accent family — red or amber — in the other four worlds.

### Neutral
- **`--background` / `--foreground`** — the field and its ink: white shopfloor, chart white, catalogue page, viridian lacquer, white counter. Premium is the deliberate inversion — its field is dark and saturated, its cards are light.
- **`--card`, `--popover`** (+ foregrounds) — raised surfaces: pure white in the four light worlds, label stock in premium.
- **`--muted` / `--muted-foreground`** — bands, wells, and secondary text; in classic this is the light mint band, and in pantry the stone-green band that does the same.
- **`--border` / `--input`** — the rule line: hairline in classic and global, chart rule in bazar, foil hairline in premium, stone hairline in pantry. Borders are 1px structure in every world; a colored border thicker than 1px is off-system — the sanctioned exceptions are each world's single named structural device (bazar's 3px section band, pantry's 2px shelf edge), which its own DESIGN.md defines and bounds.
- **`--sidebar-*`** — a parallel eight-slot set for sidebar surfaces, filled per world alongside the main set.
- **`--shadow-warm`** — the shadow tint base (see Elevation & Depth).

Every slot has a `.dark` mirror per world (`html[data-template="…"].dark`), tuned by hand — dark mode is the shop after closing, not an inversion filter.

### Named Rules
**The Token-Only Rule.** Components consume semantic Tailwind classes wired to these variables and nothing else. A hardcoded hex anywhere downstream silently breaks both the world switch and client theming. The one sanctioned raw-HSL surface is bazar's template-owned `--dept-1..6` cycle, defined once in `bazar.css`.

**The Ladder Rule.** Three cascade rungs, weakest to strongest: `:root` (the classic world and default), `html[data-template="…"]` (0,1,1) with dark blocks at (0,2,1), then per-client variant overrides emitted by `buildVariantThemeCss` as `:root:root:root` (0,3,0) and `:root:root:root.dark` (0,4,0) in a server `<style id="variant-theme">` — present on first paint, winning regardless of stylesheet order. New tokens enter at rung 1, get world values at rung 2, and stay overridable at rung 3; skipping a rung breaks a template or a client.

**The Same-Slot-Same-Job Rule.** A world may change what `--primary` looks like, never what it means. If a design wants a new *meaning* (as savings once did), it earns a new slot in all five worlds, not a repurposed one.

## Typography

**Display Font:** per world, via `--font-display` — Noto Serif Bengali Variable (classic), Anek Bangla Variable (bazar), Archivo Variable (global), Bodoni Moda Variable (premium), Tiro Bangla (pantry, single weight 400)
**Body Font:** per world, via `--font-bengali` — Hind Siliguri (classic, bazar, pantry), Archivo Variable (global), Jost Variable (premium)
**Fallback chain:** `font-display` falls to `--font-bengali` then serif; `font-sans` falls from `--font-bengali` to Inter Variable then system sans (see `tailwind.config.ts`)

**Character:** The type system is two variables and a discipline. All faces are self-hosted through Fontsource in `app/layout.tsx` (no build-time Google Fonts fetch); a world redeclares the two variables in its `globals.css` block and every heading, price, and body line follows. The Bengali worlds pair a Bengali display face with Hind Siliguri so Bengali and Latin strings share one voice; the international worlds go single-family grotesque (global) or didone-over-sans (premium). Pantry is the one world whose display face ships a single weight (Tiro Bangla 400), so emphasis there is scale alone and `font-bold` on the display face is off-system.

### Hierarchy
- **Headings** (`h1`–`h5`): globally set to `font-display` with tight tracking in the base layer — the one type decision made for all worlds at once. Sizes are per-world (each template DESIGN.md carries its ramp).
- **Body**: `font-sans` (0.875rem at 1.6+ line height as the working default), 16px minimum on mobile inputs so iOS never zooms on focus.
- **Money**: the heaviest thing in its own block, always tabular (see rule below), current price in the world's price colour with the original struck through in muted.

### Named Rules
**The Tabular Money Rule.** Every rendered amount uses `tabular-nums` so price columns and counters never jitter. Currency symbol, separators, and formatting come from business settings and the locale formatter — never a hardcoded string. All five worlds pass this today. The companion "heaviest thing in its block, in the buy colour" convention is fully held in four worlds; pantry holds it on its main price ladder (shelf tile, ranked row, PDP headline, sticky bar) and carries five logged deviations recorded in its own DESIGN.md.

**The Display-Heads Rule.** `h1`–`h5` inherit the world's display face from the base layer; body copy, buttons, and form labels never borrow it. A didone button or a Baloo Da 2 input label is off-system in any world.

## Layout

One centered `.container` capped at 1400px carries every page. The responsive gutter is 16px, rising to 24px at 768px and 32px at 1024px — and it is defined only in `app/globals.css` (`@layer utilities`), deliberately not in `tailwind.config.ts`, because the pinned `container.screens` would silently drop per-breakpoint padding. Breakpoints run `xs` 475px, `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px; the extra `xs` step exists because a meaningful share of shoppers sit below 400px wide.

Product grids are two columns on phones in every world and never thinner; density steps down through padding and type size, not by dropping a column. Composition above the grid is entirely per-world (banner carousel and offer rails, tariff board, catalogue tableau, label hero, full-bleed pantry window) and lives in each template's own DESIGN.md. Homepage section ids `featured-products`, `today-deals`, and `top-selling` are a cross-world contract — the smooth-scroll navigation depends on them in all five templates.

### Named Rules
**The Single Gutter Rule.** The page gutter lives on `.container` and only there. Adding `px-*` to a container element doubles the padding; this once cost a 390px phone a third of its usable width.

**The No-Body-Scroller Rule.** The viewport scroller is `<html>` (`overflow-x: clip` on both html and body — clip, not hidden, so no scroll container is created). Nothing may turn `<body>` into a scroll container: the moment it becomes one, every sticky header resolves against body's scrollport and vanishes on scrolled pages. The unlayered `html body[data-scroll-locked]` override at the bottom of `globals.css` exists to defend this against Radix's scroll-lock injection — do not move it into a layer or "simplify" it.

## Elevation & Depth

Depth is world-tinted and earned by state, never a permanent decoration. All five worlds share one shadow ramp (`shadow-warm-sm` / `shadow-warm` / `shadow-warm-md` / `shadow-warm-lg`) whose tint follows the world's `--shadow-warm` base — cool neutral on the white shopfloor, board-black on chart white, print-ink on the catalogue page, near-black lacquer under the labels, deep green on the pantry counter — so shadows read as the world's own material rather than gray dirt. Premium's floating label panel (`shadow-warm-lg`) is the deepest resting elevation in the system and is a deliberate exception: the label genuinely sits on the lacquer.

### Shadow Vocabulary
- **Rest** (`shadow-warm-sm`: `0 1px 2px …/0.06, 0 1px 3px …/0.08`): default card state.
- **Raised** (`shadow-warm`: `0 4px 6px -1px …/0.08, 0 2px 4px -2px …/0.06`): panels that sit on the field at rest.
- **Lifted** (`shadow-warm-md`: `0 10px 25px -5px …/0.10, 0 4px 10px -4px …/0.08`): hover lift, floating actions.
- **Overlay** (`shadow-warm-lg`: `0 20px 40px -12px …/0.18, 0 8px 16px -8px …/0.10`): drawers, sheets, the premium label panel.

### Named Rules
**The Tinted-Shadow Rule.** No neutral-black `shadow-*` utilities; every shadow routes through `--shadow-warm` so it retints with the world and with client overrides. Where a world wants physical depth (bazar's keys, premium's pressed variant keys), it uses real inset shadows and 1px travel — never a halo or a tint change alone.

## Shapes

Corner radius is a world signature, driven by one `--radius` per world: 6px gummed-tag corners in classic, 8px laminated-chip corners in bazar, 10px pack-tile corners in pantry, and 2px print/box-board corners in both international worlds. Tailwind's `rounded-lg/md/sm` derive from the variable, so shared components change shape with the world automatically. Framing devices are per-world (double rules, 3px band breaks, registration marks, foil L-corners) and documented in each template's DESIGN.md; what is shared is the discipline that structure comes from 1px rules, not from fills or thick colored borders.

### Named Rules
**The Pill-For-Status Rule.** Fully-rounded means "this is a state, not a control": stock tags, discount chips, filter counts. No world ships pill buttons, and a pill that can be clicked is misusing the shape — this holds in all five worlds intact.

## Components

Shared component shells live under `app/components/` and are world-agnostic: `ProductsGrid` / `ProductsInfiniteList` accept a per-template `CardComponent`, the shared variant selector renders buttons (never dropdowns), and `Price` owns money formatting. Their look is entirely token-driven; their behavior carries the invariants below. Per-world component treatments (shopfront offer cards, tariff rows, catalogue plates, label panels) are specified in the template DESIGN.mds.

### Focus & interaction states
- Every interactive element uses `ring-warm-focus`: a 2px `--ring` ring offset against `--background`, visible in every world and under every client override.
- Every world ships the full state set — hover, disabled (muted + not-allowed), loading, empty, sold-out — and unavailable variant options render disabled rather than hidden.
- Motion is one authored moment per surface (carousel glide, key depress, slide-and-settle, seal press), transform-only so content is visible by default, and gated on `prefers-reduced-motion`.

### Image fallback plates
- **Behavior:** a missing image URL or a load failure never shows the browser's broken-image glyph. It degrades to a flat plate in the world's field colour carrying the item's initial (or name) set in the display face — bazar's `BazarImage`, premium's wordmark plate, and pantry's `PantryImage` name plate (name only, sized per box scale to fill it) are the reference implementations.

### Brand-mark degrade
- **Behavior:** when a client has no logo asset, the header and footer render a `site_name` wordmark in the world's display face instead of an empty box or a placeholder image.

### Conversion spine (two dialects, one skeleton)
- **BD worlds (classic, bazar, pantry):** cash on delivery badged in chrome and on the PDP; tap-to-call as a first-class action (header, bottom nav, floating key); zoned delivery fees (inside/outside Dhaka, or the per-city charge from the cities API) printed *before* every order button; the phone-confirmation trust line beside every order action; order CTAs at least 48px tall and repeated at the bottom of the PDP scroll. Pantry pushes the dialect furthest: the PDP carries the whole cash-on-delivery order form in place of a cart button, and the shared cart remains only as a quiet secondary path.
- **International worlds (global, premium):** flat `INTL_SHIPPING` rate and free-over threshold printed before the buy actions; an estimated arrival date computed from `SHIPPING_WINDOW_DAYS` and always labelled "Estimated"; guest-first buy path with no account pressure; a sticky mobile buy bar driven by IntersectionObserver with reserved bottom padding (no CLS).
- **Both:** price anchoring is universal — heavy tabular current price in the buy colour, struck original in muted, savings in the `--bundle-save` slot.

### Honest data
- Urgency only when the backend backs it: deal bands restate the `today_deal` flag, "only X left" prints only from a real stock field, and no world ships a fabricated countdown or invented stock.
- Sections collapse when their data source is empty rather than rendering skeleton filler; footer claims (support hours, shipping terms) print only settings-backed facts and omit the line otherwise.
- Stock is always printed where the shopper reads, from the API, never inferred.

## Do's and Don'ts

### Do:
- **Do** resolve every colour, radius, and shadow through the semantic tokens; add new tokens at all three ladder rungs (`:root`, each `html[data-template]` block, overridable by variants).
- **Do** keep the buy slot (`--primary`) the brightest instance of its colour on screen and chrome in `--secondary` — in every world, the purchase path wins the eye.
- **Do** render money with `tabular-nums` and the business-settings formatter; BDT for Bangladesh deployments, never a hardcoded symbol or separator.
- **Do** print delivery cost — zoned fees or flat rate — before the order button, and label computed dates "Estimated".
- **Do** degrade in-world: initial-plates for broken images, wordmarks for missing logos, collapsed sections for empty data.
- **Do** keep the gutter on `.container` alone and the viewport scroller on `<html>`.
- **Do** keep order CTAs at 48px+ and reachable without hover; the primary device is a low-end Android phone.
- **Do** gate authored motion on `prefers-reduced-motion` and keep it transform-only.

### Don't:
- **Don't** hardcode a hex, a neutral-black shadow, or a fixed radius in a shared component — it breaks the world switch and client theming silently.
- **Don't** import template runtime code from `app/variants/*` or middleware; variants reference templates by id only, and the token layer must stay edge-safe.
- **Don't** repurpose a semantic slot for a new meaning, and don't let one world's accent restriction leak into another (each world's DESIGN.md owns its own accent law).
- **Don't** ship pill-shaped buttons, kickers/eyebrows above headings, icon-card scaffolds, gradient text, emoji-as-icons, rotated ribbons, or colored side borders thicker than 1px — the shared refuse-list all five worlds were reviewed against.
- **Don't** fabricate urgency, stock, reviews, or trust claims; if the backend has no field for it, the line does not exist.
- **Don't** add `px-*` to a `.container` element or turn `<body>` into a scroll container.
- **Don't** ship the shadcn default look, the banner-wall marketplace, the Amazon-clone carousel, or the Temu urgency stack — the four confirmed anti-references.
