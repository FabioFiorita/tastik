# Source Of Truth

Always verify schema, field names, validators, and indexes against the current codebase.

## Backend
- Schema: `convex/schema.ts`
- Access checks: `convex/lib/permissions.ts` (`requireAuth`, `requireListAccess`, `requireListOwner`, `requireSubscription`)
- Limits: `convex/lib/limits.ts` (MAX_LISTS_PER_USER, MAX_ITEMS_PER_LIST, MAX_TAGS_PER_LIST, MAX_EDITORS_PER_LIST)
- Subscription status: `convex/lib/subscription.ts` (`isComponentSubscriptionActive`, plan `tastik_pro`)
- Queries, mutations, actions: `convex/**`

## Frontend
- UI behavior and copy: `src/**`

## Verification Checklist
- Confirm table names and fields in `convex/schema.ts`.
- Confirm indexes and their field order in `convex/schema.ts`.
- Confirm access checks and permission flow in `convex/**`.
- Confirm limits in `convex/lib/limits.ts`.
- Confirm UI behaviors in `src/**`.
