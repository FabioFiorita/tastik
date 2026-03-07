---
name: stripe-subscription
description: Add Stripe subscriptions to a Convex + TanStack Start + Better Auth app. Use when implementing paywall, checkout, billing portal, or subscription gating. Documents the full flow: @convex-dev/stripe, webhooks, plan config, permissions, and UI.
---

# Stripe Subscription (Tastik-style)

Use this skill when adding paid subscriptions to a Convex app with TanStack Start and Better Auth. It documents the complete implementation: component setup, checkout, billing portal, subscription gating, and tests.

## Workflow overview

1. **Install & config** — Add `@convex-dev/stripe`, register component, HTTP webhook route
2. **Env vars** — Stripe keys, product IDs, webhook secret, `SITE_URL`
3. **Backend** — Plan constant, Stripe actions, subscription query, `requireSubscription` helper
4. **Gate mutations** — Call `requireSubscription` in lists, items, listEditors
5. **Frontend** — Subscription hooks, subscription page, route guards, error handling
6. **Nav & legal** — Billing portal link, trial card, Stripe in third-party services
7. **Tests** — Register stripe component, `seedSubscription` helper

For detailed step-by-step instructions with code patterns, see [references/implementation.md](references/implementation.md).
