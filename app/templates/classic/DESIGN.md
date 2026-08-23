# CLASSIC — "The Mudir Dokan Khata"

The classic template's visual world: the neighbourhood grocer's ruled khata
ledger. Trust through the most familiar retail object in Bangladesh — it
refuses both the banner-wall marketplace and the sterile white shadcn store.

## World grammar

- **Field:** unbleached khata paper (`--background`), page-white cards
  (`--card`), printed rule lines (`--border`) — always flat printed fields,
  never photographic paper textures.
- **Ink roles:** stamp red (`--primary`) belongs to the order zone alone —
  prices and order actions, never chrome. Ballpoint blue (`--accent`) writes
  the secondary entries: links, wishlist ticks, "add to bag", the call line.
  Kraft board (`--secondary`) is the chrome: masthead, mobile counter edge,
  ledger close.
- **Type:** Tiro Bangla (`font-display`) for headings and poster prices over
  Hind Siliguri body. All money is `tabular-nums`.
- **Corners:** 6px (`--radius`); shadows are warm-tinted offset+blur
  (`shadow-warm-*`).

## Structural devices (classic.css)

- `.khata-spine` — the one ledger rule-spine: a 2px blue printed line down
  the content's left inside each major band; every element registers on it.
- `.khata-rule-double` — hard band boundaries: heavy rule over hairline.
- `.khata-ruled` — the ruled paper field (32px pitch), used where the ledger
  "opens" (hero band).
- `.khata-tag` — gummed tag with a punched string-hole; status only, never
  clickable. Tags sit ON photo mats or beside data, never as eyebrows above
  headings.
- `.khata-stamp-in` — the one authored motion per surface: stamp-settle,
  scale 1.06 → 1 with one overshoot, exponential ease-out (PDP "লেখা হলো"
  stamp after add-to-cart). Reduced-motion safe.
- `.khata-strike` — a rule draws itself through a sold-out entry's price
  (material event, not a tint change).

## Composition

- **Chrome:** printed trust line (COD · delivery promise · tap-to-call) above
  the kraft masthead; ruled category strip; kraft bottom counter on mobile
  (five ≥48px targets incl. call); footer = double rule + shop particulars +
  the shop's terms, closing with the copyright line.
- **Home:** hero offer pinned as a gummed price tag (photo matted on page
  white, poster-scale red price, COD + zone-fee lines printed BEFORE the
  order button, ≥48px "এখনই অর্ডার করুন"); category chapter tabs; combo
  offers as ledger rows; three shelf bands alternating khata field / aged
  paper, each under its double rule.
- **Listing:** page heading over a double rule, search + sort on one ledger
  line (16px input on mobile), shared filter sidebar, infinite 2-col mobile
  grid of ledger-entry cards, in-world empty state.
- **PDP:** three hard bands separated by double rules — photograph (gallery +
  the entry: price anchoring, variants, quantity, city fee table, printed
  terms, order actions) → proof (description/specs/reviews) → order close
  (repeated CTA + call line, clear of the mobile bottom nav) → related
  entries.

## BD conversion spine

COD badge, tap-to-call, and the delivery-zone promise live in chrome and on
the PDP; city delivery fees print before every order button; order CTAs are
≥48px and repeat at the bottom of the PDP scroll; "অর্ডার কনফার্ম করতে আমরা
ফোনে কল করব" accompanies every order action; current price heavy in stamp
red with the original struck in muted.

## Finish review — verdict

Checked against the craft floor: no kickers/eyebrows (tags moved onto photo
mats), no icon-card scaffolds, no gradient text, lucide icons throughout,
1px-max colored side rules, warm offset shadows, themed focus rings
(`ring-warm-focus`), tabular numerals on money, hover/disabled/loading/empty
states on every interactive element, `type-check` and scoped lint clean.
Verdict: **committed** — the khata grammar carries every atom from masthead
to ledger close; ship it.
