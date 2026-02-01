# Common components refactor and project rules

## Overview

Refactor `src/components/common/` to fix deprecations, enforce Tailwind/shadcn and mobile-first practices, one component per file, and remove duplication; add `src/lib/constants.ts` for shared constants; add a Cursor rule that applies these standards project-wide.

---

## Shared constants: `src/lib/constants.ts`

- **Create** [src/lib/constants.ts](src/lib/constants.ts) to centralize shared constants.
- **Pricing**: Move the `Plan` type and `plans` array from pricing-plans into constants (e.g. export `PLANS` and `type Plan` from constants, or a `PRICING_PLANS` object). Pricing components then import from `@/lib/constants`.
- **Other constants**: Use this file for any other app-wide constants (e.g. feature lists, links, copy) so they stay in one place instead of living next to components.

---

## 1. not-found.tsx

- **FormEvent**: Use `React.FormEvent<HTMLFormElement>` (namespace) and drop `import type { FormEvent } from "react"` to clear the deprecation.
- **text-[10px]**: Replace with `text-xs` or a theme-backed size; avoid arbitrary `text-[10px]`.

---

## 2. pricing-plans.tsx → one component per file

- **Data**: Move `Plan` type and `plans` (and optionally the features list) to [src/lib/constants.ts](src/lib/constants.ts). Export `Plan`, `PLANS`, and any feature list used by pricing.
- **Split components** into separate files (e.g. under `src/components/common/pricing/` or flat in `common/`):
  - `pricing-features.tsx` – `PricingFeatures` (imports features from `@/lib/constants` if moved)
  - `plan-card.tsx` – `PlanCard`
  - `plan-cards.tsx` – `PlanCards` (imports `PlanCard` and `PLANS` from constants)
  - `pricing-footer.tsx` – `PricingFooter`
  - `plan-action-link.tsx` – `PlanActionLink`
- **Tailwind**: Mobile-first grids (e.g. `grid-cols-1 md:grid-cols-2`, `md:grid-cols-3`); use design tokens, no arbitrary values.
- **Imports**: Update all consumers of `pricing-plans.tsx` to use the new files and `@/lib/constants`.

---

## 3. public-footer.tsx

- Extract repeated `div space-y-4` + heading + nav into a `FooterSection` component; use it for Product, Support, Legal (and optionally the first column).
- Prefer mobile-first padding (e.g. `px-4 py-12 md:px-6 lg:px-8`).

---

## 4. public-header.tsx

- Remove `useAuth`; show only “Sign in” link on the public header.
- Move `ModeToggle` to `src/components/common/mode-toggle.tsx`.
- Replace `h-[1.2rem] w-[1.2rem]` with a token (e.g. `size-5`); use mobile-first breakpoints (`px-4 md:px-6 lg:px-8`, `hidden md:flex`).

---

## 5. error-state.tsx and loading-state.tsx

- Replace `min-h-[60vh]` with a theme variable or shared `EmptyStateLayout` component.
- error-state: use mobile-first `flex flex-col gap-2 md:flex-row md:justify-center`.

---

## 6. Cursor rule (always apply)

Add `.cursor/rules/frontend-standards.mdc` with `alwaysApply: true`:

- No deprecated APIs (e.g. use `React.FormEvent<...>`).
- Tailwind/shadcn: design tokens (primary, muted, etc.); standard scale (text-xs, text-sm); avoid arbitrary values unless behind theme.
- Mobile-first: base = mobile; use `md:`/`lg:`; avoid `sm:` for layout.
- One component per file; no duplication—extract repeated structure into a component.

---

## Files to create/change (summary)

| Action | Path |
|--------|------|
| Create | `src/lib/constants.ts` (Plan type, PLANS, and any shared constants) |
| Create | `.cursor/rules/frontend-standards.mdc` |
| Edit | `src/components/common/not-found.tsx` |
| Create | `src/components/common/mode-toggle.tsx` |
| Edit | `src/components/common/public-header.tsx` |
| Edit | `src/components/common/public-footer.tsx` |
| Edit | `src/components/common/error-state.tsx` |
| Edit | `src/components/common/loading-state.tsx` |
| Create | pricing component files (pricing-features, plan-card, plan-cards, pricing-footer, plan-action-link) |
| Remove | `src/components/common/pricing-plans.tsx` after migration |
| Edit | All imports from `pricing-plans` and any direct use of plans/features to use `@/lib/constants` and new components |
