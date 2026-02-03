# Source Of Truth

Always verify schema, field names, validators, and indexes against the current codebase.

## Backend
- Schema: `convex/schema.ts`
- Access checks, queries, mutations, actions: `convex/**`

## Frontend
- UI behavior and copy: `src/**`

## Verification Checklist
- Confirm table names and fields in `convex/schema.ts`.
- Confirm indexes and their field order in `convex/schema.ts`.
- Confirm access checks and permission flow in `convex/**`.
- Confirm UI behaviors in `src/**`.
