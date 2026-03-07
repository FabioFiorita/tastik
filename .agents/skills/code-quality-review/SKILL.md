---
name: code-quality-review
description: |
  Tech-lead-level code quality review for the Tastik codebase. Performs systematic audits targeting SOLID principles, DRY, clean code, testability, and framework best practices (TanStack Query, TanStack Start SSR, Convex, React memoization). Use when asked to:
  - "Review this component/hook/file for quality"
  - "Refactor this to be more maintainable"
  - "Do a code quality pass on [folder/feature]"
  - "Find code smells in [area]"
  - "Audit the codebase for best practices"
  - Running automated quality sweeps on the full codebase
---

# Code Quality Review

A systematic audit framework for the Tastik codebase. Approach every review as a tech lead who owns long-term maintainability — not as a feature developer shipping fast.

## Audit Process

1. **Scope** — Identify what to review (single file, folder, feature, or full sweep)
2. **Explore** — Read the code before forming any opinion (never suggest changes to unread files)
3. **Classify** — Tag each finding with a severity and category (see below)
4. **Prioritize** — Fix high-severity issues first; low-severity can be a backlog item
5. **Fix** — Apply changes one logical unit at a time; run `bun typecheck && bun check:write` after each batch
6. **Verify** — Run affected tests; add missing tests for changed logic

---

## Severity Levels

| Level | Meaning |
|-------|---------|
| **P0** | Bug risk, data loss, security issue — fix immediately |
| **P1** | Maintainability blocker, violates project conventions — fix in this session |
| **P2** | Refactor opportunity, DRY violation, premature complexity — prioritize |
| **P3** | Style/naming/minor consistency — fix opportunistically |

---

## Review Checklist

### 1. Architecture & SOLID

- **Single Responsibility**: Each file/hook/function does one thing. Components only handle rendering; hooks handle logic.
- **Open/Closed**: Prefer composition over modifying existing components. Extend through props/slots.
- **Dependency Inversion**: Components depend on abstractions (hooks), not concrete implementations.
- **No business logic in components**: Derived state, formatting, error handling — all in hooks under `src/hooks/`.
- **Action hooks** under `src/hooks/actions/`: wrap `useMutation` with loading state, error handling, toast. Never return the raw mutation result.
- **Query hooks** under `src/hooks/queries/`: return only the data shape the UI needs; expose `queryOptions` for loader preloading.

### 2. DRY & Duplication

- Identical JSX structures appearing 3+ times → extract to a shared component
- Same logic duplicated across hooks → extract to a `src/lib/utils/` pure function
- Same validation in multiple places → single `src/lib/validation/` schema
- Inline constants that repeat → move to `src/lib/constants/`
- Inline types duplicating `convex/schema.ts` validators → use `Infer<typeof validator>` and place in `src/lib/types/`

### 3. Data Fetching — TanStack Query + Convex

**Correct pattern** (always prefer):
```ts
// hooks/queries/use-list-items.ts
export function listItemsQueryOptions(listId, includeCompleted, tagId?) {
  return convexQuery(api.items.getListItems, { listId, includeCompleted, tagId });
}

export function useListItems(listId, includeCompleted, tagId?, opts?) {
  const { data } = useQuery({
    ...listItemsQueryOptions(listId, includeCompleted, tagId),
    enabled: opts?.enabled !== false,
  });
  return data; // never return the full useQuery result
}
```

**Anti-patterns to find and fix**:
- `useState` + `useEffect` for fetching — replace with `useQuery(convexQuery(...))`
- Direct `useQuery` calls in components — move to a hook in `src/hooks/queries/`
- Returning raw `useQuery` result from a hook — return only `.data`
- `useSuspenseQuery` inside non-Suspense boundary without an error boundary
- Missing `queryOptions` export (needed for route loaders and SSR prefetch)
- Route loaders not calling `context.queryClient.prefetchQuery(...)` for secondary data

### 4. SSR & Route Loaders (TanStack Start)

- Critical data (the entity the page renders) → `ensureQueryData` in the loader (blocks navigation, shows `pendingComponent`)
- Secondary data (collaborators, tags) → fire-and-forget `prefetchQuery` (non-blocking)
- Never `await` non-critical prefetches in loaders — it blocks navigation unnecessarily
- Route params validation with `parseConvexId` before hitting the database
- Invalid params → `throw redirect({ to: "/" })` immediately in the loader

```ts
loader: async ({ context, params }) => {
  const listId = parseConvexId<"lists">(params.listId);
  if (!listId) throw redirect({ to: "/" });

  const entity = await context.queryClient.ensureQueryData(entityQueryOptions(listId));
  if (!entity) throw redirect({ to: "/" });

  // fire-and-forget secondary data
  context.queryClient.prefetchQuery(secondaryQueryOptions(listId));

  return { listId };
},
```

### 5. React Memoization — Avoid Over-Engineering

Apply the `react-memoization-guide` skill rules. Key rules for Tastik:

- **Do NOT** memoize values that are cheap to recompute (primitives, simple derives)
- **Do NOT** memoize because "it might be slow" — measure first
- **Do** `useCallback` for stable references passed to child components with `React.memo`
- **Do** `useMemo` for expensive computations (sorting large arrays, complex filtering) — benchmark first
- **Remove** gratuitous `useMemo` wrapping simple object literals or array maps

### 6. Component Design

- One exported component per file; small helpers (<30 lines) can be unexported in the same file
- Components should not contain `async/await` logic directly — delegate to hooks
- Props interfaces: prefer explicit named types over `React.FC<{...}>` inline objects
- Avoid prop drilling > 2 levels — use composition or a context hook
- `data-testid` on all interactive elements and key UI landmarks (required)
- Use `cn()` from `@/lib/utils/cn` for conditional classes; never string concatenation
- Design tokens only: `primary`, `muted`, `muted-foreground`, `foreground`, `background`. No arbitrary Tailwind values.

### 7. Testability

Untestable code smells:
- Business logic inside components (can't test without rendering)
- Side effects mixed with pure computation
- Direct `import` of singletons without injection points
- Hooks that do too many things (single responsibility applies to hooks too)

For every non-trivial hook or util, check:
- Does a test file exist?
- Does it cover the happy path, error path, and edge cases?
- Are Convex mutations mocked using `vi.fn()` returned from the hook file's `__mocks` export?
- Are `useNavigate`, `useCurrentUser`, and other framework hooks mocked via `src/lib/helpers/mocks`?

See `testing-setup` skill for test infrastructure details.

### 8. Convex Backend Quality

Apply `convex-guidelines` skill. Key checks:
- Validators on all public function args and return types
- `requireAuth` / `requireListAccess` called at the top of every authenticated function
- No `ctx.db.query` without an index (full table scans forbidden in production)
- `internalMutation` / `internalQuery` for functions not meant to be called from client
- Error messages use `ConvexError` for user-facing errors, not generic throws
- Tests exist in `convex/tests/` for all non-trivial mutations and queries

### 9. TypeScript Hygiene

- No `any` — use `unknown` and narrow, or use the correct generated Convex types
- No `as` casts without a comment explaining why it's safe
- No `// @ts-ignore` without justification
- Types inferred from schema validators via `Infer<typeof validator>` — no manual duplication
- Prefer `type` over `interface` for local types (consistency with project style)

### 10. Code Smells Catalogue

| Smell | Fix |
|-------|-----|
| `useState(false)` + `useEffect` fetching | Replace with `useQuery(convexQuery(...))` |
| Long component (>200 lines) | Extract sub-components or move logic to hooks |
| Deeply nested ternaries in JSX | Extract to a variable or helper function |
| Magic numbers/strings inline | Move to `src/lib/constants/` |
| `console.log` left in code | Remove or replace with proper error tracking |
| Repeated `try/catch` blocks with same pattern | Extract to `useHandleMutationError` or `useManagedAction` |
| `window.location.href` for navigation | Replace with `useNavigate()` from TanStack Router |
| `Promise` ignored without error handling | Use `useManagedAction` or proper `.catch()` |
| Mutation called directly in component | Move to an action hook in `src/hooks/actions/` |
| Unused imports/variables | Remove |
| Optional chaining on things that can't be null | Remove unnecessary `?.` |

---

## Full Codebase Sweep Workflow

When asked to do a full sweep (automation-friendly):

1. **Map the surface area**
   ```
   Glob src/components/**/*.tsx → list all components
   Glob src/hooks/**/*.ts → list all hooks
   Glob convex/*.ts → list all Convex functions
   ```

2. **Prioritize by risk** — start with hooks/actions (most business logic), then routes (SSR/loader), then components

3. **Per-file audit loop**:
   - Read the file
   - Apply the checklist above
   - Classify findings with P0–P3
   - Apply P0/P1 fixes immediately
   - Log P2/P3 findings for a follow-up pass

4. **After each batch of changes**: `bun typecheck && bun check:write`

5. **Test coverage check**:
   ```
   Glob src/hooks/actions/*.ts → check each has a matching *.test.ts
   Glob convex/tests/*.test.ts → verify coverage of backend mutations
   ```

6. **Summarize findings** in a structured report:
   - Files changed
   - P0/P1 issues fixed
   - P2/P3 backlog items (with file:line references)
   - Test coverage gaps identified

---

## Quick Reference: Tastik Stack Conventions

| Concern | Where |
|---------|-------|
| Convex data types | `Infer<typeof ...Validator>` from `convex/schema.ts` |
| Query hooks | `src/hooks/queries/` — export hook + `queryOptions` |
| Action hooks | `src/hooks/actions/` — wrap mutation, return `{ action, isPending }` |
| UI state hooks | `src/hooks/ui/` |
| Pure utils | `src/lib/utils/` (no React, no side effects) |
| Constants & static data | `src/lib/constants/` |
| Form validation schemas | `src/lib/validation/` |
| Domain types | `src/lib/types/` |
| Route loaders | `src/routes/` — use `ensureQueryData` for critical, `prefetchQuery` for secondary |
| Backend logic | `convex/` — lib helpers in `convex/lib/` |
| Tests (frontend) | Co-located `*.test.ts(x)` or in `src/hooks/.../*.test.ts` |
| Tests (Convex) | `convex/tests/` |

---

## References

- `references/anti-patterns.md` — extended examples of each anti-pattern with before/after code
- Use `convex-guidelines` skill when auditing Convex backend files
- Use `testing-setup` skill when writing missing tests
- Use `react-memoization-guide` skill for memoization decisions
