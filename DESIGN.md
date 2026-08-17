---
name: DebuggerMind Storefront
description: A forest-green Bengali retail counter, themed per client by token swap.
colors:
  leaf-forest: "hsl(142 56% 30%)"
  leaf-forest-foreground: "hsl(140 30% 98%)"
  deep-canopy: "hsl(152 68% 11%)"
  deep-canopy-foreground: "hsl(140 30% 97%)"
  bright-leaf: "hsl(128 50% 42%)"
  bright-leaf-foreground: "hsl(140 30% 98%)"
  mint-cream: "hsl(140 30% 97%)"
  green-black: "hsl(152 30% 10%)"
  card-white: "hsl(0 0% 100%)"
  mint-band: "hsl(140 28% 93%)"
  muted-sage: "hsl(152 12% 38%)"
  green-gray-border: "hsl(142 18% 85%)"
  markdown-red: "hsl(0 72% 48%)"
  confirm-green: "hsl(142 60% 34%)"
  caution-amber: "hsl(38 88% 50%)"
  save-coral: "hsl(4 74% 64%)"
typography:
  display:
    fontFamily: "Noto Serif Bengali Variable, Hind Siliguri, ui-serif, Georgia, serif"
    fontSize: "clamp(1.5rem, 4vw, 1.875rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Noto Serif Bengali Variable, Hind Siliguri, ui-serif, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Hind Siliguri, Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "Hind Siliguri, Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Hind Siliguri, Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
  price:
    fontFamily: "Hind Siliguri, Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
    fontFeature: "tabular-nums"
rounded:
  sm: "10px"
  md: "12px"
  lg: "14px"
  pill: "9999px"
spacing:
  gutter-mobile: "16px"
  gutter-tablet: "24px"
  gutter-desktop: "32px"
  card-pad-mobile: "8px"
  card-pad-desktop: "16px"
  section-gap: "32px"
components:
  button-primary:
    backgroundColor: "{colors.leaf-forest}"
    textColor: "{colors.leaf-forest-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "40px"
    typography: "{typography.title}"
  button-primary-hover:
    backgroundColor: "hsl(142 56% 30% / 0.9)"
  button-buy:
    backgroundColor: "{colors.leaf-forest}"
    textColor: "{colors.leaf-forest-foreground}"
    rounded: "{rounded.md}"
    padding: "0 32px"
    height: "48px"
  button-outline:
    backgroundColor: "{colors.mint-cream}"
    textColor: "{colors.leaf-forest}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.deep-canopy}"
    textColor: "{colors.deep-canopy-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "40px"
  input-default:
    backgroundColor: "{colors.mint-cream}"
    textColor: "{colors.green-black}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "40px"
  card-product:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.green-black}"
    rounded: "{rounded.lg}"
    padding: "8px"
  badge-markdown:
    backgroundColor: "{colors.markdown-red}"
    textColor: "{colors.leaf-forest-foreground}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
    typography: "{typography.label}"
  badge-save:
    backgroundColor: "{colors.save-coral}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
    typography: "{typography.label}"
  header-bar:
    backgroundColor: "{colors.deep-canopy}"
    textColor: "{colors.deep-canopy-foreground}"
    height: "64px"
---

# Design System: DebuggerMind Storefront

## Overview

**Creative North Star: "The Green Bazaar Counter"**

The interface is a well-kept market counter. Clean white product cards are laid out on a pale mint-cream field; the chrome above and below them is a deep forest green so dark it reads almost black, and it stays out of the way. Nothing on the counter competes with the goods: photography, price, and the offer are what the eye lands on, in that order. Warmth comes from the green-tinted shadow ramp and the generously rounded 14px corners, not from decoration.

Two registers coexist on purpose. The chrome and the reading surfaces are calm and uncluttered — one accent colour, thin borders, quiet type. The merchandising zones are allowed to be loud: markdown badges, coral SAVE pills, gradient featured chips, and live countdowns earn their volume because selling is the job. Product grids stay dense and efficient, especially on small screens, where card padding drops to 8px and the type steps down rather than the grid thinning out. Density is a deliberate retail choice, not an accident of cramming.

The whole world is a single token layer. Every colour, radius, and shadow resolves through CSS custom properties on `:root`, so an entire client identity is swapped by overriding variables — green is the default dress, not the identity. Confirmed rejections: the generic shadcn default look (slate-gray, 8px radius, no point of view), the cluttered Bangladeshi marketplace wall of banners and six competing accents, and the cold Western SaaS blue-gray dashboard register.

**Key Characteristics:**
- Deep-canopy chrome, mint-cream field, white product cards
- Bengali serif for every heading, humanist sans for everything else
- 14px corner language with pill-shaped status badges
- Green-tinted shadows that rest low and lift on interaction
- Quiet chrome, loud offers — volume is zoned, not global
- Fully token-driven so one shell serves many client identities

## Colors

A single-hue green world (forest through leaf) over mint neutrals, with red, coral, and amber admitted only as commerce signals.

### Primary
- **Leaf Forest** (`{colors.leaf-forest}`): the buy colour. Primary buttons, active price, link hover, focus rings, selected states, and the wishlist-on state. It carries every action that moves a shopper toward an order.
- **Bright Leaf** (`{colors.bright-leaf}`): the lighter pop, used where Leaf Forest would be too heavy — top-bar iconography, featured-badge gradients, tertiary nav hovers, and gradient stops.

### Secondary
- **Deep Canopy** (`{colors.deep-canopy}`): chrome only. The sticky header, the utility top bar, the footer, secondary/icon buttons, and the fade behind the desktop add-to-cart overlay. Near-black at 11% lightness, so it frames the page without becoming a colour event.

### Tertiary
- **Markdown Red** (`{colors.markdown-red}`): discount percentages, the combo total price, and error text. It means "money" or "wrong", never decoration.
- **Save Coral** (`{colors.save-coral}`): a separate semantic from Markdown Red, reserved for "you save" pills on bundle and combo tiers so a savings claim is never confused with an error. Falls back to Markdown Red when a variant theme leaves it unset.
- **Caution Amber** (`{colors.caution-amber}`): warnings and the offer countdown frame. Nothing else.
- **Confirm Green** (`{colors.confirm-green}`): success toasts and confirmations, deliberately distinct from Leaf Forest so a confirmation is not mistaken for a button.

### Neutral
- **Mint Cream** (`{colors.mint-cream}`): the page field. Every card sits on it; it is never used as a card surface itself.
- **Card White** (`{colors.card-white}`): product cards, popovers, dialogs, and the purchase panel. Pure white is what separates goods from counter.
- **Mint Band** (`{colors.mint-band}`): muted bands, image placeholders behind loading photography, and gradient tails.
- **Green Black** (`{colors.green-black}`): all primary text.
- **Muted Sage** (`{colors.muted-sage}`): secondary text, struck-through original prices, review counts, helper copy.
- **Green Gray Border** (`{colors.green-gray-border}`): every border and input stroke. Borders are hairlines, often at 60% opacity on cards.

### Named Rules
**The Chrome-Is-Canopy Rule.** Header, top bar, footer, and mobile bottom nav render in Deep Canopy. Primary green never becomes chrome, and chrome never becomes a call to action; when both appear in one row, the button wins the eye.

**The Red-Means-Money Rule.** Red is admitted for exactly two things: a price that dropped and a thing that broke. It is never a brand colour, never a background for a section, and never a hover state.

**The One Accent Rule.** Outside merchandising badges, a screen carries one accent family. Any second hue on a chrome or form surface is a bug in the token usage, not a design choice.

## Typography

**Display Font:** Noto Serif Bengali Variable (falling back to Hind Siliguri, then Georgia)
**Body Font:** Hind Siliguri (falling back to Inter Variable, then system sans)
**Numerals:** Hind Siliguri with `tabular-nums` wherever money appears

**Character:** A Bengali serif does the talking and a Bengali humanist sans does the work. The pairing is bilingual by construction — both faces carry Bengali and Latin, so an English string and a Bengali string in the same heading share one voice instead of falling back to a mismatched system font. Headings are tight (`-0.025em`) and confident; body text is generous in line height and short in measure.

### Hierarchy
- **Display** (700, `clamp(1.5rem, 4vw, 1.875rem)`, 1.25): page titles — product name on a details page, combo title on a landing page. One per page.
- **Headline** (700, 1.125rem, 1.4): section headers inside a page ("What's included", "Select combo"), usually paired with a 16px leading icon in Leaf Forest.
- **Title** (500, 0.875rem, 1.4): product card names, clamped to two lines, shifting to Leaf Forest on card hover. Steps down to 0.75rem below the `sm` breakpoint.
- **Body** (400, 0.875rem, 1.625): descriptions, terms, chat, and long-form HTML from the backend. Keep the measure near 65–75ch in prose blocks.
- **Label** (600, 0.75rem, 1.2): field labels, badge text, trust-row captions, unit captions under countdown digits.
- **Price** (700, 1.25rem, tabular): the money type. Always tabular, always tightened, always the heaviest thing in its own block.

### Named Rules
**The Serif-Heads Rule.** Every `h1`–`h5` inherits the display serif and tight tracking from the base layer. Body copy, buttons, labels, and numerals never use it. A serif button is off-system.

**The Tabular Money Rule.** Every rendered amount uses `tabular-nums`, so a column of prices and a ticking countdown never jitter. Currency symbol and separators come from the locale formatter, never from a hardcoded string.

## Layout

A centered `container` capped at 1400px carries every page, with a single responsive gutter: 16px, rising to 24px at 768px and 32px at 1024px. Breakpoints run `xs` 475px, `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px — the extra `xs` step exists because a meaningful share of traffic sits below 400px wide.

Product grids are the spatial signature: two columns on phones, three at `sm`, four from `lg`, with a 12px gap that never opens up on desktop. Sections stack with 32px of air, and content pages narrow to a 5-column-equivalent max (`max-w-5xl`) so reading measure stays sane while grids stay wide. Purchase panels sit in flow at every breakpoint rather than floating, so the price and the buttons scroll as one block with the thing being bought.

Density is mobile-first in the literal sense: card padding starts at 8px and grows to 16px on desktop, action buttons shrink to 28px tall on phones, and desktop-only affordances (hover quick-actions, the add-to-cart overlay) simply do not render below `lg` instead of being reproduced as taps.

### Named Rules
**The Single Gutter Rule.** The gutter lives on `.container` and only there. Adding `px-*` to a container element doubles the padding and has already cost a 390px phone 96px of usable width.

**The No-Body-Scroller Rule.** The viewport scroller is `<html>`. Nothing may turn `<body>` into a scroll container — the moment it becomes one, the sticky header sticks to the document top and disappears from a scrolled page.

## Elevation & Depth

Depth is a response to touch, not a permanent property. Surfaces rest low — product cards sit on a barely-there `shadow-warm-sm` — and lift to `shadow-warm-md` with a 1px upward translate on desktop hover, over a 300ms transition. Every shadow is tinted with the same green base (`--shadow-warm`) rather than neutral black, so shadows read as warm depth on a mint field instead of gray dirt. Variant themes retint that base to match their own palette.

### Shadow Vocabulary
- **Rest** (`0 1px 2px hsl(var(--shadow-warm)/0.06), 0 1px 3px hsl(var(--shadow-warm)/0.08)`): the default card and trust-row state.
- **Raised** (`0 4px 6px -1px …/0.08, 0 2px 4px -2px …/0.06`): purchase panels and elements that must read as sitting on top of the field at rest.
- **Lifted** (`0 10px 25px -5px …/0.10, 0 4px 10px -4px …/0.08`): hover state for cards, and floating action buttons.
- **Overlay** (`0 20px 40px -12px …/0.18, 0 8px 16px -8px …/0.10`): drawers, sheets, and anything that covers content.

### Named Rules
**The Rest-Low, Lift-On-Touch Rule.** A surface that never changes state never gets more than Rest. If a card has no hover and no press, it has no business at Lifted.

## Shapes

One radius ramp derived from a single `--radius` of 14px: cards and panels at 14px, buttons, inputs, and selects at 12px, small chips at 10px, and status badges fully pilled. Images inside cards are clipped to the parent's radius; hero galleries and thumbnails round to 16px and 8px respectively as deliberate exceptions.

Borders are hairlines in Green Gray Border, frequently at 60% opacity so a grid of cards reads as a soft field rather than a table. Interactive surfaces gain a Leaf Forest border at 30% opacity on hover instead of a colour fill. Circular geometry is reserved for two things: status badges and the savings roundel on a combo hero, where a 64px circle in Markdown Red sits over the corner of the image.

### Named Rules
**The Pill-For-Status Rule.** Fully rounded means "this is a state, not a control" — discount, featured, stock, savings. A pill that can be clicked is misusing the shape.

## Components

### Buttons
- **Shape:** gently rounded (12px), 40px tall by default, 36px small, 44px large, 48px for buy actions.
- **Primary:** solid Leaf Forest on white text, 16px horizontal padding, icon and label separated by an 8px gap; icons are locked to 16px.
- **Hover / Focus:** background drops to 90% opacity on hover; focus shows a 2px ring in Leaf Forest with a 2px background-coloured offset. Transitions run on colour only.
- **Secondary:** Deep Canopy fill, used for icon-shaped actions over imagery (wishlist, quick view) at 32px circles.
- **Outline:** hairline border on the page field, filling with Bright Leaf on hover — the "Add to cart" half of a buy pair, where Primary takes "Buy now".
- **Ghost / Link:** chrome-only. Header icon actions and inline text links; link style underlines with a 4px offset on hover.
- **Disabled:** 50% opacity, pointer events off. Sold-out and unresolved-variant states both land here.

### Chips
- **Style:** pilled, 600 weight, 12px text, transparent border, solid semantic fill (Markdown Red, Save Coral, Caution Amber, or the saffron gradient for featured).
- **State:** stacked top-left over product imagery, never more than two at once; the discount chip always sits below the featured chip.

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** Card White on the Mint Cream field; image wells use Mint Band at 40% while loading.
- **Shadow Strategy:** Rest at idle, Lifted on desktop hover with a 1px rise (see Elevation).
- **Border:** hairline Green Gray Border at 60%, shifting to Leaf Forest at 30% on hover.
- **Internal Padding:** 8px on phones, 12px at `sm`, 16px from `md`.

### Inputs / Fields
- **Style:** 40px tall (48px for in-flow selects on purchase surfaces), hairline border, page-field background, 12px radius, 16px text on mobile stepping to 14px at `md` — the 16px floor is deliberate, it stops iOS zooming on focus.
- **Focus:** 2px Leaf Forest ring with a 2px offset; the border itself does not change colour.
- **Error:** border switches to Markdown Red and a 12px label with a 14px alert icon appears directly beneath.
- **Disabled:** 50% opacity with a not-allowed cursor. Unavailable select options render disabled rather than being removed, so a shopper sees the full size run.

### Navigation
- **Style:** a Deep Canopy sticky bar at 64px holding logo, centered search, and a right-hand icon cluster; beneath it a category menu bar with hover-opened mega panels up to 600px wide.
- **States:** nav triggers tint to 10% Leaf Forest on hover with the label taking the full accent; mega-panel entries round to 10px and use the accent background on focus.
- **Mobile:** the category bar collapses into a full-height panel behind a hamburger, and templates that ship a bottom nav lift the back-to-top button clear of it.

### Product Card
The system's signature object. A square image well with badge stack top-left, desktop-only hover actions top-right, and a gradient add-to-cart overlay rising from the bottom in Deep Canopy at 80%. Below the image: a two-line clamped name, an optional star row shown only when reviews exist, then the price line — discounted amount in heavy Leaf Forest, original struck through in Muted Sage beside it. Below `lg` the hover affordances are replaced by a permanent three-button row (add to cart, wishlist, view) pinned to the card bottom so every card in a grid ends at the same baseline.

### Combo Purchase Panel
The conversion surface: a 14px panel at Raised elevation with the total price in Markdown Red on the left, a savings pill on the right, a hairline divider, then a two-button row — Buy Now (Primary, 48px) beside Add to Cart (Outline, 48px) — stacking vertically below `sm`. A 12px secure-checkout line with a shield icon closes it. The panel is in flow at every breakpoint; it never floats.

## Do's and Don'ts

### Do:
- **Do** resolve every colour, radius, and shadow through the CSS custom properties on `:root`. A hardcoded hex breaks client theming silently, because a variant swaps tokens and never touches components.
- **Do** keep chrome in Deep Canopy and actions in Leaf Forest, so the buy path is the brightest green on screen.
- **Do** render money with `tabular-nums` and a locale formatter; currency and separators come from business settings.
- **Do** let merchandising be loud inside its own zone — badges, SAVE pills, countdowns — while chrome and forms stay quiet.
- **Do** step density down for small screens (8px card padding, 28px action buttons, 12px type) rather than dropping a grid column.
- **Do** put desktop-only affordances behind `lg` and give phones a permanent equivalent; a hover-only action is unreachable on the primary device.
- **Do** keep the gutter on `.container` alone.
- **Do** show unavailable option values as disabled rather than hiding them.

### Don't:
- **Don't** use Markdown Red for anything but a price drop or an error, and don't let Save Coral and Markdown Red appear as interchangeable.
- **Don't** set a serif on buttons, labels, or numerals; the display face is for `h1`–`h5` only.
- **Don't** add `px-*` to a `.container` element.
- **Don't** make `<body>` a scroll container — it detaches the sticky header on every scrolled page.
- **Don't** stack more than two badges over a product image.
- **Don't** introduce a second accent hue on chrome or form surfaces.
- **Don't** float the purchase panel over content; it belongs in flow with the thing being bought.
- **Don't** ship the generic shadcn default look, a banner-wall marketplace, or a blue-gray SaaS dashboard register — all three are confirmed anti-references.
