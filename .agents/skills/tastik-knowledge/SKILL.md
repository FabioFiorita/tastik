---
name: tastik-knowledge
description: Tastik app domain knowledge - a non-deadline task companion with multi-type lists (simple checkbox, stepper, calculator, kanban, multi), list sharing with privacy-first nicknames, and tags. Uses Convex, Better Auth, and Stripe. Hard paywall ($1.99/month or $19.99/year). Use when working on Tastik codebase, implementing features, fixing bugs, understanding the data model, or planning new functionality. Covers product vision, business model, Convex backend architecture, subscription flow, and feature specifications.
---

# Tastik Knowledge

## Scope
- Use this skill for product/domain decisions, feature behavior, and data-model reasoning.
- If any detail is uncertain, verify against the codebase before implementing.
- Do not duplicate schema details or file-level instructions here; always read the source of truth.

## Quick Facts
- Non-deadline task companion; not competing with iOS Reminders, Todoist, or TickTick.
- Tech stack: Convex, Better Auth, Stripe.
- Hard paywall: $1.99/month or $19.99/year; pay or don't use it.
- Passwordless auth: email OTP, Google OAuth, Apple Sign In.

## Hard Constraints
- 50 lists per user.
- 500 items per list.
- 50 tags per list.
- 10 editors per list.
- All features require an active subscription (plan: `tastik_pro`).

## References
- Product and positioning: `references/product.md`
- Auth and subscription: `references/auth-subscription.md`
- Feature behavior: `references/features.md`
- Permissions: `references/permissions.md`
- Account deletion: `references/account-deletion.md`
- Source of truth and verification: `references/source-of-truth.md`

## Last Verified
- 2026-02-15
