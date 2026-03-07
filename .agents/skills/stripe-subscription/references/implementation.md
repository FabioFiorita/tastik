# Stripe Subscription Implementation Guide

Step-by-step guide to add Stripe subscriptions to a Convex + TanStack Start + Better Auth app. Follow in order.

---

## 1. Install & config

**Packages:**
```bash
bun add @convex-dev/stripe stripe
```

**convex/convex.config.ts** — Add stripe after other components:
```ts
import stripe from "@convex-dev/stripe/convex.config.js";

const app = defineApp();
app.use(betterAuth);
app.use(rateLimiter);
app.use(resend);
app.use(stripe);
export default app;
```

**convex/http.ts** — Register webhook routes:
```ts
import { registerRoutes } from "@convex-dev/stripe";
import { components } from "./_generated/api";

const http = httpRouter();
registerRoutes(http, components.stripe, {
  webhookPath: "/stripe/webhook",
});
```

---

## 2. Environment variables

**Convex dashboard / .env.local:**
- `STRIPE_SECRET_KEY` — Stripe secret key
- `STRIPE_MONTHLY_PRODUCT_ID` — Stripe product ID for monthly plan (product, not price)
- `STRIPE_YEARLY_PRODUCT_ID` — Stripe product ID for yearly plan
- `SITE_URL` — App origin (e.g. `https://app.example.com`) for callback URL validation

**Stripe Dashboard:**
- Create products with default prices
- Webhooks → Add endpoint: `https://<convex-url>/stripe/webhook`
- Subscribe to: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
- Set webhook signing secret in Convex env if required by component

---

## 3. Plan constant & subscription helper

**convex/lib/subscription.ts:**
```ts
export const TASTIK_PRO_PLAN_SLUG = "tastik_pro";

export function isComponentSubscriptionActive(
  sub: {
    status: string;
    currentPeriodEnd: number;
    metadata?: Record<string, string>;
    priceId?: string;
  },
  nowSeconds: number = Math.floor(Date.now() / 1000),
): boolean {
  if (sub.status !== "active" && sub.status !== "trialing") return false;
  if (sub.currentPeriodEnd <= nowSeconds) return false;
  const planSlug = sub.metadata?.plan_slug ?? TASTIK_PRO_PLAN_SLUG;
  return planSlug === TASTIK_PRO_PLAN_SLUG;
}
```

---

## 4. Stripe actions

**convex/stripe.ts:**
- Import `StripeSubscriptions` from `@convex-dev/stripe`, `Stripe` from `stripe`, `components` from `./_generated/api`
- Create: `const stripeClient = new StripeSubscriptions(components.stripe, {});`
- Add `validateCallbackUrl(url, paramName)` — parse URL, compare origin to `process.env.SITE_URL`; throw if different (skip when SITE_URL unset in dev)
- `PLAN_CONFIG`: `{ Monthly: { productIdEnv: "STRIPE_MONTHLY_PRODUCT_ID", trialPeriodDays: 7 }, Yearly: { productIdEnv: "STRIPE_YEARLY_PRODUCT_ID", trialPeriodDays: 14 } }`
- **createCheckoutSession** (action): args `plan`, `successUrl`, `cancelUrl`. Get identity, validate URLs, get product ID from env, `stripeClient.getOrCreateCustomer(ctx, { userId, email, name })`, create Stripe checkout session with `mode: "subscription"`, `subscription_data: { trial_period_days`, `metadata: { userId, plan_slug: "tastik_pro" }`, `trial_settings.end_behavior.missing_payment_method: "pause"`. Return session URL
- **createBillingPortalSession** (action): args `returnUrl`. Validate URL, get/create customer, `stripeClient.createCustomerPortalSession(ctx, { customerId, returnUrl })`, return URL

**Product retrieval:** Use `stripe.products.retrieve(productId)` and `product.default_price` for the price ID. Products must have a default price in Stripe.

---

## 5. Subscription query

**convex/subscriptions.ts:**
- Query `getSubscription` with no args
- If no identity → return `{ isSubscribed: false, isTrialing: false, currentPeriodEnd: undefined }`
- Run `components.stripe.public.listSubscriptionsByUserId({ userId: identity.subject })`
- Filter with `isComponentSubscriptionActive(sub, now)`, sort by `currentPeriodEnd` desc, take first
- Return `{ isSubscribed: true, isTrialing: activeSub.status === "trialing", currentPeriodEnd: activeSub.currentPeriodEnd * 1000 }` or unsubscribed shape

---

## 6. Permission helper

**convex/lib/permissions.ts** — Add:
```ts
import { isComponentSubscriptionActive } from "./subscription";

export async function requireSubscription(
  ctx: MutationCtx,
  userId: string,
): Promise<void> {
  const subs = await ctx.runQuery(
    components.stripe.public.listSubscriptionsByUserId,
    { userId },
  );
  const nowSeconds = Math.floor(Date.now() / 1000);
  const hasActive = subs.some((sub) =>
    isComponentSubscriptionActive(sub, nowSeconds),
  );
  if (!hasActive) {
    throw new ConvexError(
      appError("NOT_SUBSCRIBED", "Active subscription required"),
    );
  }
}
```

**convex/lib/errors.ts** — Add `NOT_SUBSCRIBED` to `ERROR_CODES`.

---

## 7. Gate mutations

Call `requireSubscription(ctx, userId)` in mutations that create or modify protected resources:
- **lists.ts**: `createList`, `duplicateList` (and any other create/write that should require subscription)
- **items.ts**: `createItem`, `updateItem`, `deleteItem`, etc.
- **listEditors.ts**: `addEditor`, etc.

Pattern: `const userId = await requireAuth(ctx);` then `await requireSubscription(ctx, userId);` before business logic.

---

## 8. Frontend hooks

**src/hooks/queries/use-subscription.ts:**
- `SubscriptionQueryData`: `{ isSubscribed: boolean; isTrialing: boolean; currentPeriodEnd?: number }`
- `subscriptionQueryOptions()` → `convexQuery(api.subscriptions.getSubscription, {})`
- `useSubscriptionQuery()` → `useSuspenseQuery(subscriptionQueryOptions())` returning `data`

**src/hooks/actions/use-stripe-checkout.ts:**
- `useAction(api.stripe.createCheckoutSession)`, `useHandleMutationError`
- `checkout(plan)` calls action with `successUrl: window.location.origin + "/"`, `cancelUrl: window.location.origin + "/subscription"`, then `window.location.href = url`

**src/hooks/actions/use-manage-subscription.ts:**
- `useAction(api.stripe.createBillingPortalSession)`
- `openBillingPortal()` calls action with `returnUrl: window.location.href`, then `window.location.href = url`

---

## 9. Subscription UI

**src/lib/constants/plans.ts:**
- `Plan` type: `name`, `price`, `period`, `trial`, `cta`, `badge?`, `subtitle?`, `popular`
- `PLANS` array with Monthly and Yearly entries (e.g. $1.99/month, 7-day trial; $19.99/year, 14-day trial, badge "Save 16%")
- `PRICING_FEATURES` — icon, title, description for feature list

**Components:**
- `PlanCard` — displays plan, `renderAction(plan)` slot
- `PlanCards` — maps `PLANS` to `PlanCard`
- `PricingFeatures` — lists `PRICING_FEATURES`
- **subscription-page.tsx** — heading, subheading, `PricingFeatures`, `PlanCards` with `renderAction` that renders a Button calling `checkout(plan.name)` for Monthly/Yearly

---

## 10. Route guards

**src/routes/_protected.tsx** — In `beforeLoad`:
- If not authenticated → redirect to `/sign-in`
- If `location.pathname === "/subscription"` → allow (return)
- Else: `ensureQueryData(subscriptionQueryOptions())`; if `!subscription.isSubscribed` → redirect to `/subscription`

**src/routes/index.tsx** — In `beforeLoad`:
- If authenticated: same subscription check; if !isSubscribed → redirect to `/subscription`

**src/routes/_protected/subscription.tsx** — New route:
- `loader`: ensure subscription; if `subscription.isSubscribed` → redirect to `/`
- `component`: if subscribed → `<Navigate to="/" replace />`, else `<SubscriptionPage />`

---

## 11. Error handling

**src/hooks/use-handle-mutation-error.ts:**
- When `data.code === ERROR_CODES.NOT_SUBSCRIBED` → `navigate({ to: "/subscription", replace: true })`

**src/components/layout/route-error-component.tsx** (or equivalent):
- When error code is NOT_SUBSCRIBED → redirect to `/subscription`

---

## 12. Nav & sidebar

- **NavUser dropdown**: Add "Subscription" item that calls `openBillingPortal`
- **SidebarTrialCard**: When `subscription.isTrialing`, show trial days remaining and "Subscribe Now" button calling `openBillingPortal`. Use `currentPeriodEnd` to compute days.

---

## 13. Legal

**src/lib/constants/legal.ts** — Add to `THIRD_PARTY_SERVICES`:
```ts
{
  name: "Stripe",
  purpose: "Payment processing and subscription billing",
  dataShared: "Email address and payment information",
  privacyPolicyUrl: "https://stripe.com/privacy",
}
```

---

## 14. Tests

**convex/tests/test.setup.ts:**
- Import `stripeSchema` from `node_modules/@convex-dev/stripe/dist/component/schema.js`
- Import stripe modules: `import.meta.glob("../../node_modules/@convex-dev/stripe/src/component/**/*.ts")`
- `t.registerComponent("stripe", stripeSchema, stripeModules)`

**convex/tests/helpers.ts:**
```ts
export async function seedSubscription(
  t: { run: (fn: (ctx: MutationCtx) => Promise<void>) => Promise<void> },
  userId: string,
): Promise<void> {
  await t.run(async (ctx) => {
    await ctx.runMutation(components.stripe.private.handleSubscriptionCreated, {
      stripeSubscriptionId: `test-sub-${userId}`,
      stripeCustomerId: `test-cus-${userId}`,
      status: "active",
      currentPeriodEnd: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      cancelAtPeriodEnd: false,
      priceId: "price_test",
      metadata: { userId },
    });
  });
}
```

`isComponentSubscriptionActive` defaults `plan_slug` to `TASTIK_PRO_PLAN_SLUG` when missing, so `metadata: { userId }` is sufficient for tests.

**In tests:** Call `await seedSubscription(t, userId)` (or `ownerId`) before mutations that require subscription.
