---
name: tastik-knowledge
description: Tastik app domain knowledge — a "lists without deadlines" companion app with 5 list types (simple, stepper, calculator, kanban, multi), list sharing with privacy-first nicknames, and tags. Stack: TanStack Start + Convex + Better Auth. Free app. Use when working on the Tastik codebase: implementing features, fixing bugs, understanding the data model, or planning new functionality.
---

# Tastik Knowledge

## Scope
Use this skill for product/domain decisions, feature behavior, and data-model reasoning.
When in doubt, verify against the codebase — never assume.

## Quick Facts
- "Lists without deadlines" — quiet companion to iOS Reminders, Todoist, etc. Not a competitor.
- Side project: technical showcase for TanStack Start + Convex for a solo web dev.
- Stack: TanStack Start (frontend), Convex (backend), Better Auth.
- Free app. No subscription required.
- Auth: email OTP via Resend, Google OAuth, Apple Sign In.

## Hard Limits (source: `convex/lib/limits.ts`)
- 50 lists per user
- 500 items per list
- 50 tags per list
- 10 editors per list

## References
- Product, positioning, list types, features: `references/product.md`
- Technical: schema, auth, permissions, routes, file map: `references/technical.md`

## Last Verified
- 2026-02-25
