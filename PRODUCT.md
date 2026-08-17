# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are **shoppers on live client storefronts** — retail customers in Bangladesh buying from a deployed instance (for example bdbazaronline.com). They arrive from social ads, search, or a shared product/combo link, usually on a phone, and their job is to evaluate one product or offer and place an order with as little friction as possible.

The `/demo/<id>` showcase gallery (variants `bn-01`, `bn-02`, `intl-01`) exists in the same codebase as a sales/preview surface, but it is secondary: design decisions serve the shopper's buy flow first.

## Product Purpose

A storefront frontend that turns a merchant's catalogue — products, categories, combo offers, campaigns — into completed orders. It is the customer-facing half of a system whose commerce data and order processing live in an external .NET backend. Success is a completed purchase: product or combo page → cart or buy-now → checkout → order placed.

## Positioning

Three things distinguish this product and must not regress:

1. **One codebase, many clients.** A client is onboarded by adding one variant descriptor file plus one registry line — no fork, no branch. A deployment is `template × theme × branding × feature flags × language`, expressed as serializable data.
2. **Conversion mechanics are built in, not bolted on.** Combo/bundle landing pages, per-unit variant pickers, live offer countdowns, cash-on-delivery, and a scoped buy-now checkout are first-class product surfaces, not a generic catalogue with promotions layered on top.
3. **Server rendering for speed and SEO.** Catalogue, categories, and product pages are server-rendered with real SEO metadata so pages are indexable and paint fast on a phone.

## Operating Context

- Shoppers browse and buy on mobile, typically on a mobile data connection.
- Merchandising is offer-led: combo tiers, deals, campaign pages, and shared links to a single offer are common entry points, not just category browsing.
- Delivery is zoned (inside Dhaka vs. outside Dhaka) for Bangladesh deployments, with a free-shipping threshold coming from business settings; the international template uses a flat rate instead.
- The same build serves two run modes: showcase mode (every variant browsable under `/demo/<id>`) and client deploy mode (one variant pinned, served at the root).

## Capabilities and Constraints

- **Cash on delivery is the primary payment method.** Checkout must never bury or de-prioritise it.
- **Low-end Android on mobile data is the target device.** Page weight, image size, and touch-target sizing are hard constraints, not aspirations.
- **The backend contract is fixed.** The external .NET API owns products, orders, categories, and business settings; the frontend cannot invent fields or endpoints, and features degrade gracefully when a payload is unusable (as the combo unit picker already does).
- Surfaces that exist today: home, product listing, product details, cart, checkout, payment status, combo landing pages, campaign landing pages, auth, and profile.
- Feature flags gate whole capabilities per client: chat widget, wishlist, reviews, homepage sections (featured / today's deals / top selling), campaigns, bundles, cookie consent, language switcher.
- Language support is limited to `bn` and `en`, with `bn` as default and fallback for Bengali deployments; there is no RTL support.
- Currency and money formatting follow the deployment (BDT for Bangladesh deployments); separators and date formats are locale-driven, never hardcoded.
- **Undecided / not established in this interview:** whether "Bengali-first" is a positioning claim the product markets on, and what evidence or proof assets exist. Recorded as open rather than assumed.

## Evidence on Hand

No testimonials, ratings, case studies, press, customer logos, or benchmark numbers have been confirmed as real and usable. Future work must not fabricate them. Product content (catalogue, prices, offers, business settings, delivery rules) comes from the backend API; demo variants are populated from that same API rather than from a curated content set.

Organizational policy, not an interview answer: real customer data must never appear in examples or demos — use synthetic data.

## Product Principles

1. **The shopper's next step is always obvious.** Every surface exists to move one decision forward: which product, which tier, which options, then order.
2. **Ship the client's identity, not ours.** Anything that differs between clients belongs in variant data (theme, branding, flags, template), never hardcoded into a shared component.
3. **Design for the worst phone on the worst connection.** Weight and interaction cost are product decisions, not a later optimisation pass.
4. **Degrade, never dead-end.** When the backend omits or malforms data, the surface falls back to a usable state instead of an error or an empty screen.
5. **Cash on delivery is a first-class path.** It is the default mental model of the buyer and must read as fully supported at every step.
