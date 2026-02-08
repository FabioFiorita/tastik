---
name: tastik-knowledge
description: Tastik app domain knowledge - a non-deadline task companion with multi-type lists (simple checkbox, stepper, calculator, kanban, multi), list sharing with privacy-first nicknames, tags, and subscription-based access. Use when working on Tastik codebase, implementing features, fixing bugs, understanding the data model, or planning new functionality. Covers product vision, business model, Convex backend architecture, subscription flow, and feature specifications.
---

# Tastik Knowledge

## Scope
- Use this skill for product/domain decisions, feature behavior, and data-model reasoning.
- If any detail is uncertain, verify against the codebase before implementing.
- Do not duplicate schema details or file-level instructions here; always read the source of truth.

## Quick Facts
- Non-deadline task companion; not competing with iOS Reminders, Todoist, or TickTick.
- Freemium model with Clerk billing for Pro at $1.99/month or $19.92/year (7-day trial).
- Passwordless auth: email OTP, Google OAuth, Apple Sign In.

## Hard Constraints
- 500 items per list (Pro).
- 50 tags per list (Pro).
- 10 editors per list (Pro).
- Free plan limits: 5 lists, 50 items/list, simple and calculator list types only.
- Free features: simple lists, calculator lists, keyboard shortcuts, flexible preferences.
- Pro-only features: tags, sharing/editors, and advanced list types (stepper, kanban, multi).

## References
- Product and positioning: `references/product.md`
- Auth and subscription: `references/auth-subscription.md`
- Feature behavior: `references/features.md`
- Permissions: `references/permissions.md`
- Account deletion: `references/account-deletion.md`
- Source of truth and verification: `references/source-of-truth.md`

## Last Verified
- 2026-02-08
