# Full Application Audit — Fix Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the defects found in the 2026-07-23 whole-app audit (security, checkout/bundle pricing correctness, state robustness, conventions), prioritized so money-handling and security bugs land first.

**Architecture:** Next.js 15 App Router frontend (React 19, TypeScript, Tailwind, Jotai, react-i18next) talking to an external .NET backend through the fluent `ApiClient`. Fixes are frontend-only; where correctness ultimately depends on backend behavior (server-side re-pricing, city IDs, quote semantics), the task says so explicitly and defines the frontend contract.

**Tech Stack:** Next.js 15.5.x, React 19, TypeScript, Jotai, react-i18next, zod v4, sonner.

## Global Constraints

- **No test runner is configured.** Verification for every task = `npm run type-check` && `npm run lint` (both must pass with no NEW errors/warnings) plus the manual check listed in the task. Never claim "tests pass".
- Install with `npm install --legacy-peer-deps`.
- All imports use the `@/*` alias (→ `app/*`). Never introduce `../../` imports.
- Internal navigation must use `VariantLink` / `useVariantRouter`, never raw `next/link` / `next/navigation` `useRouter`.
- Currency is BDT (৳) via the `Price` component / business settings — never hardcode symbols in code or translation strings.
- i18n: every new user-facing string gets a key in BOTH `app/i18n/locales/en.json` and `bn.json`.
- Server actions return `ApiResponse<T>`-shaped objects; errors are returned, not thrown. Callers branch on `success`.
- Keep `page.tsx` files server-only.
- Commit after each task with a conventional-commit message. Do not amend.

## Open questions (product/backend decisions — confirm before the affected task)

1. **Q1 (Task 6):** Should the cart allow more than one combo/bundle line at a time? The order payload supports exactly one top-level `server_quote_id`. Plan assumes: **one bundle line per order; block checkout otherwise** with a clear message. Alternative (backend change): per-item quote IDs.
2. **Q2 (Task 7):** What is the shipping rule for a mixed cart (bundle + normal items)? Plan assumes: **charge the normal BD city rate once, but honor a `free_delivery` perk from any validated bundle quote (shipping = 0)**. Backend must agree or orders will re-price differently.
3. **Q3 (Task 9):** Free-shipping-over-threshold is advertised on cart/home but never applied at BD checkout, and two different thresholds are shown (5000 fallback vs 1200 default). Plan assumes: **apply free shipping at checkout when subtotal ≥ business-settings threshold** (single source of truth). Alternative: remove the badge instead.
4. **Q4 (Task 5):** The backend `validate-bundle` accepts `city_id`, but the BD checkout's two city options ("ঢাকার ভিতরে"/"ঢাকার বাহিরে") have no backend IDs in the frontend. Get the two backend city IDs from the .NET team. Plan uses a named constant with `TODO-confirm` values `1`/`2`.
5. **Q5 (Task 16):** List of legitimate image hosts (backend/CDN domains) to replace the wildcard `remotePatterns`.
6. **Q6 (Task 3):** Should a customer be able to buy the same combo tier more than once in a single order? Plan assumes **no — bundle lines are capped at quantity 1** (matches the one-quote-one-set contract). Supporting qty > 1 later requires the backend to quote multiplied compositions.

---

# Phase 0 — Critical: money and security (ship immediately)

### Task 1: Secure cookie flag never applied in production

**Files:**
- Modify: `app/lib/config/server.config.ts:17`

**Interfaces:**
- Produces: unchanged `getCookieConfig(config?)` signature; behavior change only.

**Defect:** `const isProduction = API_CONFIG.SITE_URL === "production"` compares a URL string to the literal `"production"` — always false, so the `__token__` JWT cookie is never `Secure` and the `domain` branch never runs.

- [ ] **Step 1: Fix the production check**

```ts
// app/lib/config/server.config.ts
export const getCookieConfig = (
  config?: Partial<CookieConfig>
): CookieConfig => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    path: "/",
    // Only set domain in production, omit in development
    ...(isProduction && API_CONFIG.SITE_URL
      ? {
          domain: new URL(API_CONFIG.SITE_URL).hostname.replace(/^www\./, ""),
        }
      : {}),
    // Enable secure cookies in production
    secure: isProduction,
    // Use 'lax' for better compatibility with redirects
    sameSite: "lax" as const,
    ...config,
  };
};
```

If `API_CONFIG` exposes `NODE_ENV` (check `app/lib/config/api.config.ts`), prefer `API_CONFIG.NODE_ENV === "production"` for consistency. Guard the `new URL(...)` call: if `API_CONFIG.SITE_URL` is not a valid absolute URL, omit `domain` rather than throwing (wrap in `try/catch` or test with `URL.canParse`).

- [ ] **Step 2: Verify**

Run: `npm run type-check && npm run lint` → both pass.
Manual: `NODE_ENV=production node -e` check is not practical here; instead read the built cookie by running `npm run build && npm start` locally and logging in — the `Set-Cookie` for `__token__` must include `Secure` (accept that localhost over http will still set it; browsers allow Secure on localhost).

- [ ] **Step 3: Commit**

```bash
git add app/lib/config/server.config.ts
git commit -m "fix(auth): derive cookie Secure/domain from NODE_ENV, not a URL-vs-literal comparison"
```

---

### Task 2: `withCookieHeaders()` called with no argument is a silent no-op (orders + bundle validation unauthenticated)

**Files:**
- Modify: `app/(app-routes)/checkout/action.ts:139` (`createPurchaseOrder`)
- Modify: `app/(app-routes)/combo/action.ts:48` (`validateBundle`)
- Modify: `app/lib/api-client.ts:64` (make the foot-gun impossible)

**Interfaces:**
- Consumes: `cookies()` from `next/headers`.
- Produces: `ApiClient.withCookieHeaders(cookies: ReadonlyRequestCookies)` — parameter becomes **required**.

**Defect:** `withCookieHeaders(cookies?)` starts with `if (cookies) {...}` — calling it bare silently attaches no auth token, so logged-in users' orders aren't linked to their account and quote validation is anonymous.

- [ ] **Step 1: Fix both call sites**

In `app/(app-routes)/checkout/action.ts` add `import { cookies } from "next/headers";` (if not present) and change:

```ts
const response = await new ApiClient(API_ROUTES.ORDER.PURCHASE_ORDER)
  .withMethod("POST")
  .withBody(orderData)
  .withCookieHeaders(await cookies())
  .execute<PurchaseOrderResponse>();
```

In `app/(app-routes)/combo/action.ts` likewise:

```ts
import { cookies } from "next/headers";
// ...
const response = await new ApiClient(API_ROUTES.BUNDLES.VALIDATE)
  .withMethod("POST")
  .withParams({ lang })
  .withBody(request)
  .withCookieHeaders(await cookies())
  .execute<ApiResponse<BundleValidationResult>>();
```

Note: guests must still be able to order/validate — confirm `withCookieHeaders` is a no-op *per token* when the cookie jar has no `__token__` (it reads the cookie and skips if absent). If it throws for anonymous users, keep the call but verify the anonymous path inside `withCookieHeaders` degrades gracefully.

- [ ] **Step 2: Make the parameter required in `ApiClient`**

In `app/lib/api-client.ts:64` change the signature from `withCookieHeaders(cookies?: ReadonlyRequestCookies)` to `withCookieHeaders(cookies: ReadonlyRequestCookies)` and delete the `if (cookies)` wrapper's else-silence (keep a null-check that `console.warn`s if somehow passed undefined at runtime). Then run type-check: the compiler now lists every bare call site — fix any others it reveals the same way.

- [ ] **Step 3: Verify**

Run: `npm run type-check && npm run lint` → pass, zero bare call sites remain (`grep -rn "withCookieHeaders()" app/` returns nothing).
Manual: log in, place a test order against a dev backend; the request must carry the Authorization/cookie header (check backend logs or a local proxy) and the order must appear under `/profile` order history.

- [ ] **Step 4: Commit**

```bash
git add app/lib/api-client.ts "app/(app-routes)/checkout/action.ts" "app/(app-routes)/combo/action.ts"
git commit -m "fix(auth): require cookie jar in withCookieHeaders; attach auth to order + bundle-validate calls"
```

---

### Task 3: Bundle line with quantity > 1 breaks pricing end-to-end (customer under/over-charged)

**Files:**
- Modify: `app/contexts/CartContext.tsx:66-114` (ADD_TO_CART), `:146-160` (UPDATE_QUANTITY)
- Modify: `app/(app-routes)/checkout/components/OrderSummary.tsx:86-134` (hide steppers for bundle lines)
- Modify: `app/components/cart/CartItem.tsx:95` (same)
- Test manual: cart + checkout with a combo tier

**Interfaces:**
- Consumes: `CartItem.bundle_tier_id?: number` (already on the cart item type).
- Produces: invariant — **any cart line with `bundle_tier_id != null` always has `quantity === 1`**. Checkout code may rely on it.

**Defect (Q6):** `runBundleValidations` sends one set's composition, the subtotal uses `v.pricing.price` (one set), but `prepareOrderItems` multiplies `comp.qty * item.quantity`. Steppers allow bundle-line increments (bundle lines have `stock: undefined`), and re-adding the same tier merges quantities. Result: displayed/charged total covers 1 set while order items carry N sets.

- [ ] **Step 1: Clamp bundle lines to quantity 1 in the reducer**

In `ADD_TO_CART`, when the existing/incoming item is a bundle line, force quantity 1:

```ts
case "ADD_TO_CART": {
  const isBundleLine = action.payload.bundle_tier_id != null;
  const existingItem = state.items.find(/* unchanged id+variant match */);
  const quantityToAdd = isBundleLine ? 1 : action.payload.quantity || 1;

  let newItems: CartItem[];
  if (existingItem) {
    newItems = state.items.map((item) =>
      /* unchanged id+variant match */
        ? {
            ...item,
            quantity: isBundleLine ? 1 : item.quantity + quantityToAdd,
          }
        : item
    );
  } else {
    // unchanged, but quantity: quantityToAdd already respects the clamp
  }
  // ...rest unchanged
}
```

In `UPDATE_QUANTITY`, short-circuit for bundle lines:

```ts
? {
    ...item,
    quantity:
      item.bundle_tier_id != null
        ? 1
        : Math.min(
            action.payload.quantity,
            item.stock || action.payload.quantity
          ),
  }
```

(`bundle_tier_id` must exist on the reducer's `CartItem` type — it does; verify in `app/contexts/CartContext.tsx` type block near the top.)

- [ ] **Step 2: Hide quantity steppers for bundle lines**

In `app/(app-routes)/checkout/components/OrderSummary.tsx` (rows around lines 86-134) and `app/components/cart/CartItem.tsx` (around line 95): when `item.bundle_tier_id != null`, render a static "×1" (reuse existing quantity text styling) instead of the +/- buttons. Add i18n keys `bundle.fixedQuantity` = en `"Combo — fixed quantity"` / bn `"কম্বো — নির্দিষ্ট পরিমাণ"` for the tooltip/aria-label on the static element.

- [ ] **Step 3: Verify**

Run: `npm run type-check && npm run lint` → pass.
Manual: add a combo tier twice from `/combo/<slug>` → cart shows one line, qty 1. Cart page and checkout summary show no steppers on the combo line. Checkout total equals the validated `pricing.price` for one set.

- [ ] **Step 4: Commit**

```bash
git add app/contexts/CartContext.tsx "app/(app-routes)/checkout/components/OrderSummary.tsx" app/components/cart/CartItem.tsx app/i18n/locales/en.json app/i18n/locales/bn.json
git commit -m "fix(bundle): enforce quantity 1 on bundle cart lines to match one-quote-one-set pricing"
```

---

### Task 4: Combo slug interpolated unencoded into backend URL (path traversal into arbitrary backend GETs)

**Files:**
- Modify: `app/lib/api-route.ts` (`BUNDLES.COMBO_DETAILS`)
- Modify: `app/(app-routes)/combo/[slug]/page.tsx` (validate before fetching)

**Interfaces:**
- Produces: `COMBO_DETAILS(slug: string)` URL-encodes; `isValidComboSlug(slug: string): boolean` exported from `app/lib/bundles/types.ts`.

**Defect:** `/combo/..%2Fusers` decodes to `../users` and the fetch resolves to `<API_BASE>/users?lang=bn` — arbitrary GET traversal within the backend API; `?` in a slug corrupts query handling.

- [ ] **Step 1: Encode + validate**

In `app/lib/api-route.ts`:

```ts
COMBO_DETAILS: (slug: string) => `combos/${encodeURIComponent(slug)}`,
```

In `app/lib/bundles/types.ts` add:

```ts
/** Slugs are backend-generated: lowercase alphanumerics and hyphens only. */
export const isValidComboSlug = (slug: string): boolean =>
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
```

In `app/(app-routes)/combo/[slug]/page.tsx`, before calling `getCombo(slug)` (both in `generateMetadata` and the page):

```ts
if (!isValidComboSlug(slug)) notFound();
```

Confirm the regex against real slugs in the backend/spec (`docs/superpowers/specs/2026-07-21-bundle-combo-api-contract.md`); widen to allow digits-only or underscores if the backend produces them.

- [ ] **Step 2: Verify**

Run: `npm run type-check && npm run lint` → pass.
Manual: `curl -I "http://localhost:3000/combo/..%2Fusers"` → 404. A real combo slug still renders.

- [ ] **Step 3: Commit**

```bash
git add app/lib/api-route.ts app/lib/bundles/types.ts "app/(app-routes)/combo/[slug]/page.tsx"
git commit -m "fix(security): encode and validate combo slug before backend fetch"
```

---

# Phase 1 — High: checkout correctness and stability

### Task 5: `formData.cityId` is never set — bundle quotes always priced with `city_id: null` (Q4)

**Files:**
- Modify: `app/lib/constants/delivery.ts` (add backend city IDs)
- Modify: `app/(app-routes)/checkout/components/ShippingAddressForm.tsx` (set `cityId` alongside `city`)

**Interfaces:**
- Consumes: `handleInputChange(field, value)` prop already passed to the form; `formData.cityId?: number` already in `FormData` (`checkout/model.ts:163`).
- Produces: `CITY_OPTIONS[n].backendCityId: number`.

- [ ] **Step 1: Add backend IDs to the city options**

```ts
// app/lib/constants/delivery.ts — values TODO-confirm with backend team (Q4)
export const CITY_OPTIONS = [
  {
    value: CITY_INSIDE_DHAKA,
    labelKey: "checkout.cities.insideDhaka",
    rate: DELIVERY_RATES.insideDhaka,
    backendCityId: 1,
  },
  {
    value: CITY_OUTSIDE_DHAKA,
    labelKey: "checkout.cities.outsideDhaka",
    rate: DELIVERY_RATES.outsideDhaka,
    backendCityId: 2,
  },
] as const;
```

- [ ] **Step 2: Set `cityId` when the user picks a city**

In `ShippingAddressForm.tsx`, find the city `onValueChange`/`onChange` handler (it currently calls `onInputChange("city", value)`), and extend it:

```ts
onInputChange("city", value);
const opt = CITY_OPTIONS.find((o) => o.value === value);
onInputChange("cityId", opt?.backendCityId ?? 0);
```

If `onInputChange`'s value type is `string` only, it is `string | number` in `CheckoutPage.tsx:110` — pass the number through. If the select is also rendered by another form component (grep `CITY_OPTIONS` for consumers), apply the same change there.

- [ ] **Step 3: Verify**

Run: `npm run type-check && npm run lint` → pass.
Manual: with a combo in the cart, pick "ঢাকার বাহিরে" at checkout, watch the network tab: `validate-bundle` request body has `city_id: 2` (and the `useEffect` on `formData.cityId` refires so shipping updates).

- [ ] **Step 4: Commit**

```bash
git add app/lib/constants/delivery.ts "app/(app-routes)/checkout/components/ShippingAddressForm.tsx"
git commit -m "fix(checkout): wire selected city to cityId so bundle quotes price the real destination"
```

---

### Task 6: Multi-bundle carts — shipping double-counted, only first quote submitted (Q1)

**Files:**
- Modify: `app/components/pages/CheckoutPage.tsx:244-260` and submit path
- Modify: `app/components/product/bundle/use-bundle-cart.ts` (prevent a second bundle entering the cart)

**Interfaces:**
- Consumes: Task 3's invariant (bundle lines qty 1).
- Produces: invariant — **at most one bundle line in the cart**.

**Decision (Q1):** one bundle per order. Enforce at add-time (better UX than failing at checkout).

- [ ] **Step 1: Enforce single bundle line at add-time**

In `use-bundle-cart.ts`, before adding: if the cart already contains a line with `bundle_tier_id != null` **and** a different `bundle_id`/`tier`, remove it first (replace semantics) and show `toast.info(t("bundle.replacedExisting"))`. Add keys `bundle.replacedExisting` en `"Your previous combo was replaced — one combo per order."` / bn `"আগের কম্বোটি সরিয়ে নতুনটি যোগ হয়েছে — প্রতি অর্ডারে একটি কম্বো।"`. Use the existing cart context API (`removeFromCart(id, variant_id)` then `addToCart(...)`).

- [ ] **Step 2: Defensive checkout guard**

In `CheckoutPage.tsx` `handleSubmit`, before validation: if `bundleLines.length > 1`, `toast.error(t("bundle.onePerOrder"))` and return (keys: en `"Only one combo per order is supported."` / bn `"প্রতি অর্ডারে শুধুমাত্র একটি কম্বো সমর্থিত।"`). With ≤1 bundle line, `bundleShipping` (sum over one quote) and `firstQuote` are both correct by construction — no further math change needed.

- [ ] **Step 3: Verify**

Run: `npm run type-check && npm run lint` → pass.
Manual: add combo A, then combo B → cart holds only B and the toast shows. Checkout shipping equals B's quote shipping.

- [ ] **Step 4: Commit**

```bash
git add app/components/product/bundle/use-bundle-cart.ts app/components/pages/CheckoutPage.tsx app/i18n/locales/en.json app/i18n/locales/bn.json
git commit -m "fix(bundle): enforce one combo per order; prevents double shipping and orphaned quotes"
```

---

### Task 7: Mixed cart (bundle + normal) discards validated bundle shipping and the free-delivery perk (Q2)

**Files:**
- Modify: `app/components/pages/CheckoutPage.tsx:251-258`

**Interfaces:**
- Consumes: `bundleShippingReady`, `bundleShipping`, `bundleValidations` already computed in the component.

**Rule (Q2, confirm with backend):** one delivery charge per order. If every validated bundle quote grants free delivery (`pricing.shipping === 0` / `free_delivery` perk) **and** there are no normal lines → 0 (already works). Mixed cart → the normal city/global rate applies, **unless** a validated quote flags `free_delivery`, in which case shipping is 0 for the whole order.

- [ ] **Step 1: Implement the rule**

```ts
const bundleGrantsFreeDelivery =
  bundleShippingReady && bundleShipping === 0 && bundleLines.length > 0;

const finalShipping =
  bundleLines.length > 0 && normalLines.length === 0 && bundleShippingReady
    ? bundleShipping
    : bundleGrantsFreeDelivery
      ? 0
      : isGlobal
        ? getGlobalDeliveryCharge(calculatedSubtotal)
        : formData.city
          ? getDeliveryCharge(formData.city)
          : 0;
```

If `BundleValidationResult.pricing` exposes an explicit `free_delivery`/perk flag (check `app/lib/bundles/types.ts`), test that flag instead of `shipping === 0` — zero shipping and "perk granted" are not the same thing.

- [ ] **Step 2: Verify**

Run: `npm run type-check && npm run lint` → pass.
Manual: combo tier with free-delivery perk + one normal item → checkout shipping shows ৳0 (Task 18 makes 0 render as "Free"); submitted `shipping_cost` is 0.

- [ ] **Step 3: Commit**

```bash
git add app/components/pages/CheckoutPage.tsx
git commit -m "fix(checkout): honor bundle free-delivery perk in mixed carts"
```

---

### Task 8: `/profile` crashes when order-history fetch fails

**Files:**
- Modify: `app/(app-routes)/profile/page.tsx:31` and/or `app/components/pages/ProfilePage.tsx:150-153`

**Defect:** `orderHistoryResponse.data.length` throws when the action returns `{ success: false, data: null }` → whole route error-screens.

- [ ] **Step 1: Guard at the boundary**

In `profile/page.tsx`, normalize before passing down:

```ts
const orderHistory = orderHistoryResponse.success
  ? orderHistoryResponse.data ?? []
  : [];
```

Pass `orderHistory` (a plain array) to `ProfilePage`/`OrderInfo`/`ProfileOverView` instead of the raw response, and update their prop types accordingly (they currently receive the response object — change props to the array; adjust `.data.length` reads to `.length`).

- [ ] **Step 2: Verify**

Run: `npm run type-check && npm run lint` → pass.
Manual: temporarily point `API_BASE_URL_V1` at an unreachable host (or block the order-history endpoint in devtools), load `/profile` → page renders with an empty order list, no crash. Restore env.

- [ ] **Step 3: Commit**

```bash
git add "app/(app-routes)/profile/page.tsx" app/components/pages/ProfilePage.tsx
git commit -m "fix(profile): render empty order history on fetch failure instead of crashing the route"
```

---

### Task 9: Free-shipping promise shown on cart/home but never applied at BD checkout; two different thresholds (Q3)

**Files:**
- Modify: `app/components/cart/OrderSummary.tsx:31-32` (threshold fallback `"5000"` → shared default)
- Modify: `app/components/pages/CheckoutPage.tsx` (`finalShipping`)
- Read: `app/lib/utils/business-settings.ts` (existing default `"1200"` and the settings accessor)

**Rule (Q3):** single threshold from business settings (default 1200); BD checkout applies free shipping when `calculatedSubtotal >= threshold`.

- [ ] **Step 1: Unify the threshold**

In `app/components/cart/OrderSummary.tsx:31-32` replace the hardcoded `"5000"` fallback with the shared default exported by `app/lib/utils/business-settings.ts` (export a `DEFAULT_FREE_SHIPPING_OVER = 1200` constant there if only an inline default exists today, and use it in both places).

- [ ] **Step 2: Apply at checkout**

In `CheckoutPage.tsx`, read the threshold the same way the cart badge does (business settings atom/util — mirror `OrderSummary.tsx`'s accessor) and extend the `finalShipping` expression from Task 7: for the BD branch, `calculatedSubtotal >= freeShippingOver ? 0 : getDeliveryCharge(formData.city)`. Keep the global branch unchanged (it already has its own free-over rule).

- [ ] **Step 3: Verify**

Run: `npm run type-check && npm run lint` → pass.
Manual: BD cart at ৳1,500 → cart badge says free shipping AND checkout charges ৳0; cart at ৳500 → ৳80/৳130 as before.

- [ ] **Step 4: Commit**

```bash
git add app/components/cart/OrderSummary.tsx app/components/pages/CheckoutPage.tsx app/lib/utils/business-settings.ts
git commit -m "fix(checkout): apply the advertised free-shipping threshold at BD checkout; unify threshold source"
```

---

### Task 10: Cart `storage` listener registered in render body — leak + duplicate dispatches + unguarded JSON.parse

**Files:**
- Modify: `app/contexts/CartContext.tsx:283-290`

- [ ] **Step 1: Move to an effect with cleanup**

Delete the block at lines 283-290 and add below the save-effect (line 256):

```ts
// Cross-tab sync: reload the cart when another tab writes it.
useEffect(() => {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== "cart") return;
    try {
      const cartItems = JSON.parse(event.newValue || "[]");
      if (Array.isArray(cartItems)) {
        dispatch({ type: "LOAD_CART", payload: cartItems });
      }
    } catch (error) {
      console.error("Error syncing cart from another tab:", error);
    }
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}, []);
```

- [ ] **Step 2: Verify**

Run: `npm run type-check && npm run lint` → pass.
Manual: open two tabs, add an item in tab A → tab B's cart badge updates exactly once. Write garbage to `localStorage.cart` in devtools and fire a storage event → console error, no crash.

- [ ] **Step 3: Commit**

```bash
git add app/contexts/CartContext.tsx
git commit -m "fix(cart): register cross-tab storage listener in an effect with cleanup and guarded parse"
```

---

### Task 11: Upgrade Next.js 15.5.7 → latest 15.5.x (known advisories: rewrite SSRF, image DoS, server-function disclosure)

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Upgrade**

```bash
npm install next@15.5 --legacy-peer-deps
npm audit --omit=dev
```

Expected: `next` lands on ≥ 15.5.21; the three GHSA advisories for `next` disappear from the audit output. If `sharp`/`postcss` advisories remain, run `npm audit fix --omit=dev --legacy-peer-deps` and re-check (do not force-upgrade majors).

- [ ] **Step 2: Verify the app still builds and runs**

```bash
npm run type-check && npm run lint && npm run build
```

All pass. Then `npm run dev`, click through home → product → cart → checkout, and one `/demo/<id>/...` route with `NEXT_PUBLIC_SHOWCASE=true` (middleware rewrites are the code most exposed to a Next patch).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): upgrade next to patched 15.5.x (SSRF/image-DoS/server-fn advisories)"
```

---

# Phase 2 — Medium: security hardening

### Task 12: Open redirect after login

**Files:**
- Create: `app/lib/utils/safe-redirect.ts`
- Modify: `app/components/pages/LoginPage.tsx:58-59,165`, `app/components/pages/GlobalLoginPage.tsx:40-41,77`

- [ ] **Step 1: Add the helper**

```ts
// app/lib/utils/safe-redirect.ts
/** Accept only same-origin relative paths: "/x" but not "//x", "/\x" or schemes. */
export const safeRedirectPath = (raw: string | null, fallback: string): string => {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return fallback;
  }
  return raw;
};
```

- [ ] **Step 2: Use it in both login pages**

```ts
import { safeRedirectPath } from "@/lib/utils/safe-redirect";
const redirectUrl = safeRedirectPath(
  searchParams.get("redirect"),
  ABSOLUTE_ROUTES.PROFILE
);
```

(Keep the router push through `useVariantRouter` as-is.)

- [ ] **Step 3: Verify**

Run: `npm run type-check && npm run lint` → pass.
Manual: `/login?redirect=https://example.org` → lands on `/profile` after login; `/login?redirect=/cart` still goes to `/cart`.

- [ ] **Step 4: Commit**

```bash
git add app/lib/utils/safe-redirect.ts app/components/pages/LoginPage.tsx app/components/pages/GlobalLoginPage.tsx
git commit -m "fix(security): reject non-relative login redirect targets"
```

---

### Task 13: JSON-LD injection — `</script>` in backend fields breaks out of structured data

**Files:**
- Modify: `app/lib/utils/seo.utils.tsx:395-401` (`renderStructuredData`)

- [ ] **Step 1: Escape the serialized JSON**

```tsx
const jsonLd = JSON.stringify(data)
  .replace(/</g, "\\u003c")
  .replace(/>/g, "\\u003e")
  .replace(/&/g, "\\u0026")
  .replace(/ /g, "\\u2028")
  .replace(/ /g, "\\u2029");

return (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: jsonLd }}
  />
);
```

- [ ] **Step 2: Verify**

Run: `npm run type-check && npm run lint` → pass. View-source of a product page: the JSON-LD block contains `<` where product text had `<`; Google's Rich Results test still parses it (escaped JSON is valid JSON).

- [ ] **Step 3: Commit**

```bash
git add app/lib/utils/seo.utils.tsx
git commit -m "fix(security): escape angle brackets in JSON-LD to prevent script breakout"
```

---

### Task 14: Stored XSS via `product.description` (`dangerouslySetInnerHTML`)

**Files:**
- Modify: `app/components/product/product-details/ProductDetailsTabs.tsx:61-66`
- Modify: `package.json` (add `isomorphic-dompurify`)

- [ ] **Step 1: Sanitize before rendering**

```bash
npm install isomorphic-dompurify --legacy-peer-deps
```

```tsx
import DOMPurify from "isomorphic-dompurify";
// ...
<div
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(product.description ?? ""),
  }}
/>
```

Grep for other `dangerouslySetInnerHTML` uses of backend HTML (`grep -rn dangerouslySetInnerHTML app/ | grep -v seo.utils | grep -v ld+json`) and sanitize those too (the templates' PDP components — `BazarProductDetails`, `GlobalProductDetails` — likely render the same field).

- [ ] **Step 2: Verify**

Run: `npm run type-check && npm run lint` → pass.
Manual: a product whose description contains `<img src=x onerror=alert(1)>` renders the image tag stripped of the handler; normal rich descriptions still render.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json app/components/product/product-details/ProductDetailsTabs.tsx
git commit -m "fix(security): sanitize backend product HTML before dangerouslySetInnerHTML"
```

---

### Task 15: `/api/meta-capi` is an unauthenticated open relay to Facebook

**Files:**
- Modify: `app/api/meta-capi/route.ts`

- [ ] **Step 1: Constrain the endpoint**

Add, in order: (1) same-origin check — reject when the `origin`/`referer` host doesn't match `NEXT_PUBLIC_SITE_URL`'s host (405-style 403 JSON response); (2) `eventName` allowlist — only the events the frontend actually sends (grep call sites of `/api/meta-capi` for the literal names, e.g. `Purchase`, `AddToCart`, `ViewContent`, `InitiateCheckout`) — reject others with 400; (3) basic in-memory rate limit per IP (e.g. sliding window, 30 req/min) — acknowledge in a comment that per-instance memory is a partial control behind a load balancer.

- [ ] **Step 2: Verify**

Run: `npm run type-check && npm run lint` → pass.
Manual: `curl -X POST http://localhost:3000/api/meta-capi -H "Origin: https://evil.example" -d '{"eventName":"Purchase"}'` → 403; a real page-triggered event still returns 200.

- [ ] **Step 3: Commit**

```bash
git add app/api/meta-capi/route.ts
git commit -m "fix(security): origin check, event allowlist, and rate limit on meta-capi relay"
```

---

### Task 16: Wildcard image `remotePatterns` (SSRF/DoS amplification via `/_next/image`) (Q5)

**Files:**
- Modify: `next.config.js:4-8`

- [ ] **Step 1: Pin hostnames**

Replace `remotePatterns: [{ hostname: "*" }]` with the allowlist from Q5 (backend host from `API_BASE_URL`, CDN, demo-image hosts actually used — grep rendered image URLs or check the backend). Include each as `{ protocol: "https", hostname: "<host>" }`. If Q5 is unanswered, at minimum restrict `protocol: "https"` and exclude private-range hosts, and leave a `TODO(Q5)` comment.

- [ ] **Step 2: Verify**

`npm run build && npm start`; browse home/product/combo pages — no broken images. An image URL on a non-allowlisted host returns 400 from `/_next/image`.

- [ ] **Step 3: Commit**

```bash
git add next.config.js
git commit -m "fix(security): replace wildcard image remotePatterns with explicit host allowlist"
```

---

# Phase 2b — Medium: pricing/display and state correctness

### Task 17: Tax math — three related defects

**Files:**
- Modify: `app/components/cart/OrderSummary.tsx:35-37`
- Modify: `app/components/pages/CheckoutPage.tsx:215-235`
- Modify: `app/(app-routes)/checkout/model.ts:7-12` (add `tax_type` to `CheckoutDataProduct` if the API returns it — check a real checkout-data response)

**Defects:** (a) dead ternaries make `/cart` show the ex-tax subtotal as "Total" for tax-inclusive carts; (b) checkout fallback treats `item.tax` (a percent) as an absolute per-unit amount; (c) checkout always adds tax on top even for `tax_type: "include"` products, double-charging.

- [ ] **Step 1: Fix `/cart` totals (a)**

In `app/components/cart/OrderSummary.tsx:35-37` replace the dead ternaries: for `taxType === "include"`, subtotal displayed = `subtotal` (ex-tax, as reverse-calculated by `calculateCartTax`), tax displayed = `tax`, and **total displayed = `total`** (not `subtotal`). For `"exclude"` keep current behavior. Cross-check the semantics against `app/lib/utils/tax-calculator.ts` before editing — the reducer's `total` is the authoritative charge amount in both modes.

- [ ] **Step 2: Fix the percent-as-amount fallback (b)**

`app/components/pages/CheckoutPage.tsx:226`:

```ts
return total + (item.price * item.quantity * (item.tax || 0)) / 100;
```

- [ ] **Step 3: Stop double-adding inclusive tax (c)**

The cart line already carries `tax_type` (the reducer reads it). Thread it into the checkout tax memo: when the matching cart item has `tax_type === "include"`, the tax is already inside `discount_price` — compute it for display via reverse calculation (mirror `tax-calculator.ts`'s include branch: `price - price / (1 + pct / 100)`) and do **not** add it again into `calculatedTotal` (i.e., for include-mode items, `calculatedTotal` contribution is just `price × qty` + shipping). Add `tax_type` to `CheckoutDataProduct` only if the API actually returns it; otherwise key off the cart item's `tax_type`.

- [ ] **Step 4: Verify**

Run: `npm run type-check && npm run lint` → pass.
Manual: with a 15% include-tax product at ৳1,130: `/cart` shows Total ৳1,130; checkout shows the same total (not ৳1,299.50); with checkout-data blocked in devtools, the fallback tax for a ৳2,000 15% item shows ৳300, not ৳15.

- [ ] **Step 5: Commit**

```bash
git add app/components/cart/OrderSummary.tsx app/components/pages/CheckoutPage.tsx "app/(app-routes)/checkout/model.ts"
git commit -m "fix(pricing): correct tax-inclusive totals, percent fallback, and double-added tax at checkout"
```

---

### Task 18: Shipping cost of 0 renders "Select city" instead of "Free"

**Files:**
- Modify: `app/(app-routes)/checkout/components/OrderSummary.tsx:166-172`

- [ ] **Step 1: Distinguish "unknown" from "free"**

The component needs to know *why* shipping is 0. Pass an explicit `shippingKnown: boolean` prop from `CheckoutPage.tsx` (true when: global template, OR a BD city is selected, OR a bundle-only order has `bundleShippingReady`). Render: `!shippingKnown` → the existing "select city" hint; `shippingKnown && shippingCost === 0` → `t("checkout.freeShipping")` (key exists for the badge — reuse it, else add en `"Free"` / bn `"ফ্রি"`); otherwise `<Price value={shippingCost} />`.

- [ ] **Step 2: Verify**

Run: `npm run type-check && npm run lint` → pass.
Manual: global-template checkout over the free threshold shows "Free"; BD checkout before choosing a city still shows the hint.

- [ ] **Step 3: Commit**

```bash
git add "app/(app-routes)/checkout/components/OrderSummary.tsx" app/components/pages/CheckoutPage.tsx app/i18n/locales/en.json app/i18n/locales/bn.json
git commit -m "fix(checkout): render zero shipping as Free instead of the select-city hint"
```

---

### Task 19: Wishlist — hydration mismatch on product cards; guest wishlist wiped on every load

**Files:**
- Modify: `app/components/product/ProductCardItem.tsx:32-35`, `app/components/pages/ProductDetails.tsx:44`, `app/templates/bazar/product/BazarProductCard.tsx:34`, `app/templates/global/product/GlobalProductCard.tsx:34`
- Modify: `app/hooks/use-wishlist-sync.tsx:28-31`

- [ ] **Step 1: Gate heart state on hydration**

Copy the existing header pattern (`app/templates/bazar/chrome/BazarHeader.tsx:38-45`): add an `isHydrated` state set in a mount effect; render the filled-heart styling only when `isHydrated && isWishlisted`. Apply identically in all four components. (Alternative if the codebase has a shared `useHydrated` hook — grep first; if not, create `app/hooks/use-hydrated.ts` with the 5-line hook and use it in all four.)

- [ ] **Step 2: Stop wiping guests' wishlists**

In `use-wishlist-sync.tsx:28-31`: only clear on a *confirmed logged-out transition*, not "profile is null on mount". Track the previous profile value (`useRef`); run `setWishlistIds([])` only when the previous value was a profile and the new value is null AND the null came from an explicit logout (the logout paths already clear `mini-profile` — if distinguishing transient failure from logout isn't possible here, simply delete the `else` clear: local wishlist persisting for guests is the lesser evil; note this in the commit message).

- [ ] **Step 3: Verify**

Run: `npm run type-check && npm run lint` → pass.
Manual: wishlist a product as a guest, hard-reload → heart stays filled, no hydration error in the console; log in and out → wishlist behaves per the chosen rule.

- [ ] **Step 4: Commit**

```bash
git add app/components/product/ProductCardItem.tsx app/components/pages/ProductDetails.tsx app/templates/bazar/product/BazarProductCard.tsx app/templates/global/product/GlobalProductCard.tsx app/hooks/use-wishlist-sync.tsx app/hooks/use-hydrated.ts
git commit -m "fix(wishlist): hydration-safe heart state; stop erasing guest wishlists on mount"
```

---

### Task 20: Cart line identity — name-keyed list, bundle lines navigate to wrong product, bundle/product id collision

**Files:**
- Modify: `app/components/pages/CartPage.tsx:67-80,111`
- Modify: `app/components/product/bundle/use-bundle-cart.ts:26-27`
- Modify: `app/contexts/CartContext.tsx` (merge predicate)

- [ ] **Step 1: Key rows by identity, not name**

`CartPage.tsx:111`: `key={`${item.id}-${item.variant_id ?? 0}`}` (matches checkout's convention). Also stop dropping `stock` in the `CartItemData` mapping at lines 67-76 so the stock-cap `disabled` check engages.

- [ ] **Step 2: Bundle line click → combo page, not product page**

Store the combo slug on the line: in `use-bundle-cart.ts` add `bundle_slug: bundle.slug` to the cart payload (add the optional field to the `CartItem` type in `CartContext.tsx`). In `CartPage.tsx:78-80`: if `item.bundle_slug`, `router.push(ABSOLUTE_ROUTES.COMBO(item.bundle_slug))` (add the route constant if missing: `` COMBO: (slug: string) => `/combo/${slug}` ``); else current behavior.

- [ ] **Step 3: Remove the id-collision hazard**

Bundle lines share the product id keyspace (`id: bundle.id`). Namespace them: in the reducer's three match predicates (ADD/REMOVE/UPDATE), a line matches only if `id`, `variant_id`, **and `bundle_tier_id`** all agree (treat `undefined` as "not a bundle"). This keeps existing persisted carts valid (no id rewrite) while making a product with a colliding id a distinct line.

- [ ] **Step 4: Verify**

Run: `npm run type-check && npm run lint` → pass.
Manual: cart with a combo + a normal product: clicking the combo line opens `/combo/<slug>`; removing the normal product does not touch the combo line.

- [ ] **Step 5: Commit**

```bash
git add app/components/pages/CartPage.tsx app/components/product/bundle/use-bundle-cart.ts app/contexts/CartContext.tsx app/lib/... # route constants file
git commit -m "fix(cart): identity-keyed rows, combo-line navigation, bundle/product id namespace in reducer"
```

---

### Task 21: `i18n.changeLanguage()` mutates a shared singleton during SSR (cross-request language bleed)

**Files:**
- Modify: `app/components/shared/providers/i18n-provider.tsx:20-22`, `app/i18n/index.ts`

- [ ] **Step 1: Per-request instance on the server**

In `i18n-provider.tsx`, build the instance with `createInstance()` from `i18next` inside the provider (memoized with `useMemo` on the server-resolved `language` prop), `.use(initReactI18next).init({...same options as app/i18n/index.ts, lng: language})`, and pass it via `<I18nextProvider i18n={instance}>`. Extract the shared init options from `app/i18n/index.ts` into an exported `i18nOptions` object so both paths stay in sync; keep the module-level singleton export for any non-provider imports (grep consumers of `@/i18n` first — update the stale comment at `app/i18n/index.ts:16-18` while there).

- [ ] **Step 2: Verify**

Run: `npm run type-check && npm run lint` → pass.
Manual: two browsers, one with `language=en` cookie, one `bn`; load the home page repeatedly/concurrently — each consistently renders its own language with no hydration warnings.

- [ ] **Step 3: Commit**

```bash
git add app/components/shared/providers/i18n-provider.tsx app/i18n/index.ts
git commit -m "fix(i18n): per-request i18next instance to stop SSR singleton language bleed"
```

---

### Task 22: Cart reducer edge-case hardening (defense in depth)

**Files:**
- Modify: `app/contexts/CartContext.tsx` (`ADD_TO_CART`, `UPDATE_QUANTITY`, `LOAD_CART`)

- [ ] **Step 1: Guard quantities and loaded data**

- `UPDATE_QUANTITY`: `if (action.payload.quantity < 1)` treat as REMOVE (filter the line out) instead of storing ≤0. Fix the stock cap so `stock === 0` still caps: `item.stock != null ? Math.min(action.payload.quantity, Math.max(item.stock, 0)) : action.payload.quantity` — but preserve the "stock unknown → uncapped" behavior.
- `ADD_TO_CART`: clamp `quantityToAdd = Math.max(1, Math.floor(action.payload.quantity || 1))`; cap the merged quantity against `existingItem.stock` when known.
- `LOAD_CART`: validate shape — keep only entries where `typeof id === "number" && typeof price === "number" && Number.isFinite(price) && quantity >= 1`; drop the rest.

- [ ] **Step 2: Verify**

Run: `npm run type-check && npm run lint` → pass.
Manual: in devtools set `localStorage.cart` to `[{"id":"x"},{"id":1,"price":100,"quantity":-2,"name":"t"}]`, reload → cart is empty (both entries invalid), no negative totals anywhere.

- [ ] **Step 3: Commit**

```bash
git add app/contexts/CartContext.tsx
git commit -m "fix(cart): clamp quantities, cap merges against stock, validate localStorage cart shape"
```

---

### Task 23: Error and loading boundaries

**Files:**
- Create: `app/error.tsx`, `app/global-error.tsx`, `app/(app-routes)/combo/[slug]/loading.tsx`

- [ ] **Step 1: Add boundaries**

`app/error.tsx`: `"use client"` component with the standard `({ error, reset })` signature — branded card (reuse existing card/button components), `t("common.somethingWentWrong")` + retry button calling `reset()`. Add keys en `"Something went wrong"`/`"Try again"`, bn `"কিছু একটা সমস্যা হয়েছে"`/`"আবার চেষ্টা করুন"`. `app/global-error.tsx`: same UI but self-contained (must render its own `<html><body>`, no providers available — hardcode both languages stacked, since i18n isn't mounted). `combo/[slug]/loading.tsx`: skeleton mirroring the combo hero + tier list (copy the pattern from `app/(app-routes)/products/[id]/loading.tsx`).

- [ ] **Step 2: Verify**

Run: `npm run type-check && npm run lint` → pass. Throw temporarily in a page to see `app/error.tsx` render; remove the throw. Combo page shows the skeleton on a throttled connection.

- [ ] **Step 3: Commit**

```bash
git add app/error.tsx app/global-error.tsx "app/(app-routes)/combo/[slug]/loading.tsx" app/i18n/locales/en.json app/i18n/locales/bn.json
git commit -m "feat(app): route error boundaries and combo loading skeleton"
```

---

### Task 24: Server-side input validation on server actions (zod)

**Files:**
- Modify: `app/(app-routes)/(auth)/action.ts` (`registerUser` — `RegisterUserSchema` exists but is unused server-side)
- Modify: `app/(app-routes)/checkout/action.ts` (`createPurchaseOrder`)
- Modify: review/profile/newsletter actions (grep `"use server"` files that forward client objects)

- [ ] **Step 1: Parse before forwarding**

Pattern for each action (zod v4):

```ts
const parsed = SomeSchema.safeParse(input);
if (!parsed.success) {
  return { success: false, error: "Invalid input" };
}
// use parsed.data from here on
```

For `createPurchaseOrder`, define `PurchaseOrderSchema` in `app/(app-routes)/checkout/model.ts` covering the `PurchaseOrderRequest` shape with hard constraints: `order_items` non-empty array, `quantity` int ≥ 1, `price`/`total_price`/`shipping_cost`/`total_vat_amount` finite numbers ≥ 0, address strings max-length (e.g. 500), phone regex for the BD flow. For `registerUser`, apply the existing `RegisterUserSchema`. Keep return shapes identical to today's error returns.

**Flag (matches audit H2):** true price integrity requires the .NET backend to re-price orders server-side; frontend zod checks stop malformed payloads, not tampered-but-well-formed prices. Raise with the backend team — the frontend cannot close this alone.

- [ ] **Step 2: Verify**

Run: `npm run type-check && npm run lint` → pass. Manual: normal register + checkout flows still succeed; calling `createPurchaseOrder` with `order_items: []` (temporary test snippet) returns `success: false`.

- [ ] **Step 3: Commit**

```bash
git add "app/(app-routes)/(auth)/action.ts" "app/(app-routes)/checkout/action.ts" "app/(app-routes)/checkout/model.ts"
git commit -m "fix(actions): zod-validate server action inputs before forwarding to backend"
```

---

### Task 25: 16 missing Bengali translation keys (review dialog renders raw keys)

**Files:**
- Modify: `app/i18n/locales/bn.json`

- [ ] **Step 1: Add the missing keys**

Translate and add: `header.logout`, `common.submitting`, `common.characters`, `review.writeReview`, `review.reviewFor`, `review.rating`, `review.message`, `review.placeholder`, `review.submit`, `review.success`, `review.error`, `review.ratingRequired`, `review.reviewMinLength`, `review.reviewMaxLength`, `review.addReview`, `review.deliveredOnly` — copy each English value from `en.json` and translate to natural Bengali (e.g. `header.logout` → `"লগআউট"`, `review.writeReview` → `"রিভিউ লিখুন"`, `review.submit` → `"রিভিউ জমা দিন"`). Keep interpolation placeholders (`{{...}}`) byte-identical.

- [ ] **Step 2: Verify parity**

```bash
node -e "const en=require('./app/i18n/locales/en.json'),bn=require('./app/i18n/locales/bn.json');const f=(o,p='')=>Object.entries(o).flatMap(([k,v])=>typeof v==='object'&&v?f(v,p+k+'.'):p+k);const e=new Set(f(en)),b=new Set(f(bn));console.log('en-only:',[...e].filter(k=>!b.has(k)));console.log('bn-only:',[...b].filter(k=>!e.has(k)));"
```

Expected: both arrays empty. Then `npm run type-check && npm run lint`.

- [ ] **Step 3: Commit**

```bash
git add app/i18n/locales/bn.json
git commit -m "fix(i18n): add 16 missing Bengali keys (review dialog, logout, submitting)"
```

---

### Task 26: Bundle correctness leftovers from PR #2

**Files:**
- Modify: `app/(app-routes)/checkout/helpers/checkout-helpers.ts:102` (all-optional tier degrades to bogus normal line)
- Modify: `app/components/product/bundle/ComboLanding.tsx:78-80,110,117-123,183-192`
- Modify: `app/components/product/bundle/BundleTierList.tsx:35-41`
- Modify: `app/components/home/ComboPromo.tsx:36`
- Modify: `app/i18n/locales/{en,bn}.json` (`bundle.save` hardcodes ৳)

- [ ] **Step 1: Guard the bundle branch on `bundle_tier_id` alone**

`checkout-helpers.ts:102`: change `if (item.bundle_tier_id && item.bundle_components?.length)` to `if (item.bundle_tier_id)` and inside, iterate `item.bundle_components ?? []` — an empty composition then produces zero order items for that line but never a fake `product_id: bundle.id` normal line. Additionally skip such degenerate lines with a `console.warn` so they can't silently produce an empty order (combine with Task 24's non-empty `order_items` check).

- [ ] **Step 2: Server-authoritative savings + honest content**

`ComboLanding.tsx:78-80`: derive the hero ribbon from the selected tier's `savings` field (as `BundleTierList` already does), not `compare_at_price - price`; hide the ribbon when `savings <= 0`. Delete the fabricated social-proof block at lines 183-192 ("10,000+ happy customers / 4.8/5") — replace with nothing (or real perks already in the data). Compliance note: fabricated claims on a customer-facing storefront are the kind of content that must not ship, even in demos.

- [ ] **Step 3: Image guards**

Wrap `combo.banner` (`ComboLanding.tsx:110`), tier `thumbnail_image` (`BundleTierList.tsx:35-41`), and the promo image (`ComboPromo.tsx:36`) with the existing `CartLineImage`-style guard: render `<Image>` only when the URL is a non-empty string; otherwise the existing placeholder pattern (see `app/components/shared/CartLineImage.tsx` for the fallback UI to reuse or extract into a shared `SafeImage`).

- [ ] **Step 4: Currency-safe savings string**

Change `bundle.save` in both locales from `"Save ৳{{amount}}"` to `"Save {{amount}}"` (bn: `"{{amount}} সাশ্রয় করুন"`) and render the amount through the `Price` component at the call site (grep `bundle.save` for consumers); pass the formatted price as the interpolation value.

- [ ] **Step 5: Verify + commit**

Run: `npm run type-check && npm run lint` → pass. Manual: combo page hero shows savings only when the tier's `savings > 0`; combos with missing images render placeholders.

```bash
git add "app/(app-routes)/checkout/helpers/checkout-helpers.ts" app/components/product/bundle/ComboLanding.tsx app/components/product/bundle/BundleTierList.tsx app/components/home/ComboPromo.tsx app/i18n/locales/en.json app/i18n/locales/bn.json
git commit -m "fix(bundle): server-authoritative savings, image guards, currency-safe strings, degenerate-tier guard"
```

---

# Phase 3 — Low: cleanup, docs, polish (batchable)

### Task 27: Delete dead/dangerous dead code

**Files:**
- Delete: `app/components/pages/ProductsPageClient.tsx` (zero importers; the exact anti-pattern CLAUDE.md bans)
- Delete: `app/lib/services/cart-service.ts` (zero consumers; fetches nonexistent `/api/cart/*`; throws, violating the ApiResponse contract)
- Delete: `app/lib/api.ts` (legacy client that stores JWT in localStorage — dangerous pattern waiting to be wired up)

- [ ] **Step 1:** Verify zero importers before each delete: `grep -rn "ProductsPageClient\|lib/services/cart-service\|from \"@/lib/api\"" app/ --include=*.ts --include=*.tsx` (note: match `@/lib/api"` exactly — do not confuse with `@/lib/api-client`). Delete the three files.
- [ ] **Step 2:** `npm run type-check && npm run lint && npm run build` → pass.
- [ ] **Step 3:** `git add -A && git commit -m "chore: remove dead ProductsPageClient, cart-service, and legacy localStorage API client"`

### Task 28: Lint warnings + small a11y/i18n polish

**Files:**
- Modify: `app/components/layout/NavigationClient.tsx:297` (unused `props`), `app/components/product/ProductFilters.tsx:39,222` (unused `isPending`, `handleSearchKeyDown` — delete or wire up; check git blame for intent before deleting `handleSearchKeyDown`)
- Modify: `app/components/cart/CartItem.tsx:64-181` — add `aria-label={t(...)}` to the trash/plus/minus icon buttons in both layouts (keys: `cart.removeItem`, `cart.increaseQuantity`, `cart.decreaseQuantity` — add en+bn)
- Modify: `app/components/shared/BackToTopButton.tsx:68` — `aria-label={t("common.backToTop")}` (add en `"Back to top"` / bn `"উপরে ফিরে যান"`)
- Modify: `app/lib/utils/seo.utils.tsx:233` — `sku: product.sku || String(product.id)` (stable, not `Date.now()`)

- [ ] **Step 1:** Apply all; `npm run lint` → zero warnings.
- [ ] **Step 2:** Commit: `git commit -m "chore: clear lint warnings, label icon-only buttons, stable JSON-LD sku"`

### Task 29: Combo route polish

**Files:**
- Modify: `app/(app-routes)/combo/action.ts`, `app/(app-routes)/combo/[slug]/page.tsx`

- [ ] **Step 1:** Deduplicate the double fetch: wrap `getCombo` in React `cache()` (`import { cache } from "react"`) so `generateMetadata` and the page share one request per render. Add the `bundles` feature-flag gate to `generateMetadata` (mirror the page's `getActiveVariant()` check). Distinguish outage from missing: in `getCombo`, return `null` only for a well-formed not-found response; on `success: false` transport/5xx errors return a sentinel (`"error"`) and have the page `throw new Error("combo fetch failed")` so the Task 23 error boundary renders instead of a 404.
- [ ] **Step 2:** `npm run type-check && npm run lint` → pass. Commit: `git commit -m "fix(combo): dedupe fetch, gate metadata by feature flag, surface backend outages as errors not 404"`

### Task 30: Buy Now merge semantics

**Files:**
- Modify: `app/components/pages/ProductDetails.tsx` (`handleBuyNow`) and the buy-now helpers (`app/lib/utils/buy-now.ts`)

**Defect:** Buy Now on a product already in the cart (qty 3) merges to qty 4, charges the merged line, then removes it — the customer buys 4 while intending 1, and loses their saved cart line.

- [ ] **Step 1:** Decide + implement: Buy Now should snapshot the pre-existing line (if any), add the buy-now quantity, and after order completion restore the snapshot instead of removing the whole line. Simpler alternative if snapshot/restore is too stateful: when the product already exists in the cart, Buy Now checks out the *existing line + new quantity* but the confirmation UI must show that quantity — pick the snapshot approach unless it fights the `?only=&ov=` scoping in `buy-now.ts`; read that file first.
- [ ] **Step 2:** Manual: product in cart at qty 3 → Buy Now (qty 1) → checkout shows qty 1, and after ordering, the cart still holds qty 3. `npm run type-check && npm run lint` → pass. Commit: `git commit -m "fix(checkout): Buy Now no longer merges with and consumes the saved cart line"`

### Task 31: Token refresh single-flight

**Files:**
- Modify: `app/lib/api-client.ts:147-159`

- [ ] **Step 1:** Module-level `let refreshInFlight: Promise<...> | null = null;` — in `execute()`, when refresh is needed: `refreshInFlight ??= refreshToken(...).finally(() => { refreshInFlight = null; }); await refreshInFlight;`. Preserve the existing expiry-check semantics and error handling (a failed refresh must still fall through exactly as today).
- [ ] **Step 2:** `npm run type-check && npm run lint` → pass. Commit: `git commit -m "fix(auth): single-flight token refresh to prevent concurrent-refresh races"`

### Task 32: Checkout re-validate race guard

**Files:**
- Modify: `app/components/pages/CheckoutPage.tsx:154-192`

- [ ] **Step 1:** Add a request-sequence guard to the `fetchCheckoutData` effect: capture `const seq = ++seqRef.current` at start (a `useRef(0)`), and before each `setServerPrices`/`setBundleValidations`, bail if `seq !== seqRef.current`. (Last-writer-wins by sequence, no AbortController needed since server actions aren't abortable.)
- [ ] **Step 2:** `npm run type-check && npm run lint` → pass. Commit: `git commit -m "fix(checkout): drop stale price/validation responses on rapid quantity changes"`

### Task 33: Template/branding consistency

**Files:**
- Modify: `app/templates/global/chrome/GlobalTopBar.tsx:17` (`|| "USD"` → derive from variant branding: read the currency the same way `Price`/business-settings does; fall back to the variant's `branding.currency`, never a hardcoded literal)
- Modify: `app/templates/bazar/product/BazarProductDetails.tsx:42`, `app/templates/global/product/GlobalProductDetails.tsx:41` — accept and render the `bundle` prop (render `ProductBundleSelector` exactly as `app/components/pages/ProductDetails.tsx:376-377` does), so enabling `bundles` for bn-02/intl-01 later doesn't silently no-op

- [ ] **Step 1:** Apply; `npm run type-check && npm run lint` → pass.
- [ ] **Step 2:** Commit: `git commit -m "fix(templates): branding-derived currency in GlobalTopBar; bundle prop honored by bazar/global PDPs"`

### Task 34: Update CLAUDE.md to match reality

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1:** Three corrections: (1) `TemplateId = "classic" | "bazar" | "global"`; (2) categories caching — replace the `unstable_cache`/1h/`revalidateCategories()` paragraph with the actual mechanism (`.withCache(["categories"], CACHE_TIMES.SHORT_TIME)` = 10 s in `app/components/shared/actions/categories.ts:24`) — **and decide**: if 1h was the intent, instead change the code to `CACHE_TIMES.LONG_TIME`-equivalent (3600) and keep the doc; pick one, don't leave them disagreeing; (3) cart math — replace "10% tax, ৳100 shipping (free over ৳1000)" with the real rules (per-item percent tax via `tax-calculator.ts`; BD shipping ৳80/৳130 by Dhaka zone; free over business-settings threshold after Task 9; intl flat 10, free over 100).
- [ ] **Step 2:** Commit: `git commit -m "docs: sync CLAUDE.md with actual template union, category caching, and cart math"`

### Task 35: Import hygiene sweep (mechanical)

**Files:**
- Modify: ~15 files with multi-level `../../` imports (worst offenders): `app/components/pages/CheckoutPage.tsx:36-42`, `app/(app-routes)/profile/components/profile-overview.tsx:5`, `personal-info.tsx:12`, `app/(app-routes)/profile/orders/[orderId]/components/*.tsx` (5 files), `app/templates/{bazar,global}/{home,product}/*.tsx` (8 files with `"../../types"`)

- [ ] **Step 1:** Convert each `../../...` import to the `@/...` equivalent (pure path rewrites, no logic changes). Leave single-parent `"../types"`-style imports alone this pass (pervasive, low risk).
- [ ] **Step 2:** `npm run type-check && npm run lint && npm run build` → pass. Commit: `git commit -m "refactor: replace multi-level relative imports with @/ alias"`

---

## Deliberately NOT fixed (documented decisions)

- **JWT claims decoded without signature verification** (`security.utils.ts`) — acceptable: frontend only uses `exp` for refresh timing; backend enforces validity.
- **PII (name/email/phone) in `localStorage` mini-profile** — logout paths already clear it; revisit only if the profile grows more PII (GDPR minimization). Consider trimming to `name` only when convenient.
- **`Price` component locale-aware separators** — org convention says locale-driven number formatting; worthwhile, but BDT-only today and cosmetic. Defer until intl variants are real client work.
- **Single-parent relative imports (`"../types"`)** — pervasive and low-risk; batch into a future mechanical PR.

## Suggested execution order & branching

- Branch per phase: `fix/p0-critical`, `fix/p1-checkout`, `fix/p2-hardening`, `chore/p3-cleanup`. Phase 0 → PR immediately.
- Tasks 5-7 and 9 change checkout money math — review them together in the Phase 1 PR and manually test the four cart shapes: normal-only, bundle-only, mixed, buy-now.
- Risks/counterarguments: the one-bundle-per-order rule (Task 6) and the free-shipping-at-checkout rule (Task 9) are product decisions that change customer-visible pricing — get Q1-Q3 confirmed before merging Phase 1; the Next.js upgrade (Task 11) is low-risk within 15.5.x but middleware rewrites should be smoke-tested in showcase mode.
