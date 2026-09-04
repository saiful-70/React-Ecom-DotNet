# premium — "The Batch Label"

Single-brand editorial paradigm for the `premium` template (variant `intl-02`).

## Thesis

The store as a packaging system — provenance (batch numbers, foil rules,
seals) is the premium signal. It refuses the cream-and-serif Aesop default:
the world stays drenched viridian lacquer. Form: the apothecary batch label
(candidate 5 of 7, seed key 2dc2f44e). The full direction contract is
embedded verbatim as the first child of `PremiumHome`'s root element.

## World grammar

- **Four-colour hard commitment.** Every element resolves to viridian
  (`--background`), label stock (`--card`/`--foreground`), foil gold
  (`--primary`/`--border`), vermilion (`--accent`). Tokens live in
  `globals.css` under `html[data-template="premium"]`; components consume
  only semantic Tailwind classes.
- **Type.** Bodoni Moda didone (`font-display`) at real scale contrast —
  huge product names, listing title up to 6xl — over small Jost caps
  (tracked 0.12–0.18em) for provenance lines, nav, and keys.
- **Batch grammar.** Every product carries `LOT <id, 4-pad> — <category>`
  (`lib.ts:lotLine`), set as a provenance line *inside* label surfaces,
  below the name — never as an eyebrow above a heading.
- **Label panel.** The buy box is ONE pristine label-stock panel floating
  over the lacquer (`shadow-warm-lg`), complete within the first desktop
  viewport on both home hero and PDP.
- **Exploded callouts.** Specs render as numbered instruction-plate markers
  pinned over the photography (`.premium-callout-marker`, fixed positions),
  keyed to a numbered list beside/below. Fewer than 2 real specs → markers
  are omitted and the plain numbered list remains.
- **Pressed keys.** Variant selection is a physical key row
  (`.premium-key`): selected keys sit visibly deeper — inset shadow + 1px
  translate — never tint-only. Buttons, never dropdowns.
- **Corners & rules.** 2px box-board L-corners (`.premium-corners`) frame
  photography; foil hairlines (`.premium-hairline`, `.premium-rule-flank`)
  carry the grid.
- **Motion (one authored moment per surface).** PDP: label-panel rise on
  load. Add-to-cart: the seal press — scale 0.98 on press, vermilion seal
  flash on commit. Everything else static and visible by default;
  `prefers-reduced-motion` disables both.

## Conversion spine

- One-viewport buy box on PDP desktop: gallery left, sticky label panel
  right; accordions (materials / shipping / provenance) below the fold via
  the shared Radix accordion restyled in-world.
- Sticky mobile buy bar via IntersectionObserver on the panel; price ×
  quantity + variant state + gold CTA synced to the main form; the page
  reserves `pb-24 lg:pb-0`, so no CLS.
- Delivery transparency printed on the label before the CTA: flat intl rate
  + free-over threshold (`INTL_SHIPPING`), plus an "Estimated: <weekday,
  date>" line from `SHIPPING_WINDOW_DAYS` (labelled Estimated; no invented
  promise).
- Guest-first: no account-pressure copy anywhere on the buy path; express
  lane is a quiet underlined "Buy now — express checkout".
- Home pacing: hero specimen → alternating full-bleed banner sections
  (backend-authored copy only; omitted when empty) → collection grids →
  most-ordered ranked ledger (rank carries the information) → engraved
  colophon footer. No deal walls, no countdowns.

## The set label (combo landing)

`product/PremiumCombo.tsx`. A combo is one boxed set: specimen photography on
seven columns with the contents numbered like a spec sheet, and a single
label-stock panel on five carrying the whole purchase — the set's own
`LOT nnnn — N pieces` line under the name, the packages as `.premium-key`
rows that sit visibly deeper when chosen, the shipping terms printed on the
label, the gold seal-press action and the quiet express lane beneath it. Long
copy and terms fold into the same in-world accordion the PDP uses.

**No countdown, by rule.** `ends_at` is real data so it is honoured, but as a
dated provenance line ("Available until Friday, 5 September"). A ticking clock
would import the deal-wall grammar this template exists to refuse.

## Finish review

- Contrast: label-stock/muted-foreground on viridian and lacquer pass; all
  secondary text is tinted from the world hues, never gray. Card-side
  secondary text uses `card-foreground` at ≥60% on label stock.
- Depth: `shadow-warm-*` only (offset + blur, tinted by `--shadow-warm`);
  key depth is a real inset + travel, not a halo.
- Refuse-list: no kickers/eyebrows (LOT lines live inside labels, below
  names), no icon-card scaffolds, no gradient text, no emoji-icons
  (lucide only), no hard offset shadows, no fifth hue.
- States: hover (underline-offset link language, key border), disabled
  (keys + CTA), sold-out (vermilion tag + disabled CTA), empty
  (ProductsEmptyState; missing images degrade to the wordmark plate),
  loading (shared infinite-list sentinel). Focus via `ring-warm-focus`,
  `aria-pressed` on keys/thumbnails, tabular-nums on all money.
- Coverage: hero specimen, callouts, key row, label panel, delivery lines,
  estimated date, sticky bar, accordions, reviews (flag), combos (flag),
  wishlist (flag), infinite listing with premium cards, colophon footer.

**Verdict: shipped.** `npm run type-check` clean; `next lint` clean on the
folder. The world holds its four colours; the label carries the sale.
