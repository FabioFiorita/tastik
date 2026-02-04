# Agent Instructions (Always Read)

These instructions apply to any assistant working in this repository. Keep rules here concise and universally applicable. Put broader domain knowledge in skills.

## Skills Usage
- Use a skill when the task matches its description or the user names it.
- Prefer skills for product/domain knowledge and deeper context (example: `tastik-knowledge`).
- Keep this file focused on stable rules, project conventions, and must-follow constraints.

## Workflow

- Plan before coding for non-trivial tasks; explore the codebase during planning.
- Keep scope focused; if context grows large, summarize progress and ask before continuing.

## Learning from Mistakes

When you make a mistake and the developer corrects you:

1. Acknowledge the mistake and apply the correct approach
2. After fixing the issue, **proactively ask**: "Should I run `/capture-mistake` to add this correction to INSTRUCTIONS.md so I don't repeat this mistake?"
3. If the developer agrees, run the command to capture the learning

This helps build institutional knowledge and prevents repeated errors.

Available commands:
- `/capture-mistake` - Document a correction to prevent future mistakes

## Frontend Standards
- Do not use `void` on function calls; it is unnecessary.
- No deprecated APIs. Example: use `React.SyntheticEvent<HTMLFormElement>` for form submits (not `FormEvent`).
- Tailwind/shadcn: prefer design tokens (`primary`, `muted`, `muted-foreground`, `foreground`) and standard scales (`text-xs`, `text-sm`, `size-5`). Avoid arbitrary values unless behind a theme variable or a shared component.
- Mobile-first: base styles for mobile; use `md:` or `lg:` for larger breakpoints. Avoid `sm:` for layout.
- One component per file. Split multiple components into separate files.
- No duplication. Extract repeated layout/structure into a reusable component.

## Component Files
- Component files should contain only the component and small, component-specific helpers.
- Static data (arrays, copy, config) belongs in `src/lib/constants.ts` or a focused constants file in `src/lib/constants/`.
- Pure helpers belong in `src/lib/utils.ts` or a focused util file in `src/lib/utils/`.

## Constants and Utils
- Pure helpers (no React, no side effects) used in more than one place live in `src/lib/utils/`.
- Constants live in `src/lib/constants/`.
- Do not use barrel files in `src/lib/constants/` or `src/lib/utils/`.
- Import directly from the concrete module path (example: `@/lib/utils/get-package-id`).

## Exports
- Prefer named exports. Use default exports only when a framework requires them.

## Convex Queries in Hooks
- Do not call Convex queries directly in components.
- Create hooks under `src/hooks/queries/`.
- Hooks should return the data the UI needs (not the full query result object).
- One query (or related set) per hook file. Name hooks after the data they expose.

## Convex Guidelines

### Function Syntax and Registration
- Use the new function syntax with `query`, `mutation`, `action`, `internalQuery`, `internalMutation`, `internalAction` from `./_generated/server`.
- HTTP endpoints live in `convex/http.ts` and must use `httpAction`.
- Use `query`/`mutation`/`action` for public functions; `internalQuery`/`internalMutation`/`internalAction` for private functions.
- Do not register functions through the `api` or `internal` objects.

### Validators and Returns
- Always include argument validators for every function.
- **Return validators**:
  - For queries returning raw documents or a trivial transform (example: spread doc + `isOwner`), omit `returns` to avoid duplicating schema.
  - For queries that substantially change shape, include a `returns` validator.
  - For mutations/actions/internal functions that return nothing, include `returns: v.null()` and return `null`.
- Use `v.null()` for null values (never `undefined`).
- `v.bigint()` is deprecated. Use `v.int64()`.
- Use `v.record()` for records. `v.map()` and `v.set()` are not supported.

### Function Calls and References
- Use `ctx.runQuery`, `ctx.runMutation`, `ctx.runAction` to call other functions.
- Do not call actions from actions unless you need to cross runtimes; prefer shared helpers.
- Use `api` for public functions and `internal` for private functions from `convex/_generated/api.ts`.
- When calling a function in the same file via `ctx.runQuery`/`ctx.runMutation`/`ctx.runAction`, add a return type annotation to avoid TS circularity issues.

### Pagination
- Use `paginationOptsValidator` and `.paginate()` with `numItems` and `cursor`.
- Paginated results return `page`, `isDone`, and `continueCursor`.

### Schema and Indexes
- Define schema in `convex/schema.ts` using imports from `convex/server`.
- System fields `_id` and `_creationTime` exist on all documents.
- Index names must include all index fields (example: `by_field1_and_field2`).
- Index field order matters; queries must use the same order as defined.

### TypeScript
- Use `Id<'table'>` from `./_generated/dataModel` for document IDs instead of `string`.
- Use `as const` for string literals in discriminated unions.
- Define arrays as `const array: Array<T> = [...]`.
- Define records as `const record: Record<KeyType, ValueType> = { ... }`.
- Add `@types/node` when using Node.js built-ins.

### Queries
- Do not use `filter`; define an index and use `withIndex`.
- Queries do not support `.delete()`. Use `.collect()` then `ctx.db.delete`.
- Use `.unique()` when expecting a single result.
- For async iteration, use `for await (const row of query)` instead of `.collect()`/`.take()`.
- Default ordering is ascending `_creationTime`; use `.order('asc'|'desc')` when needed.

### Full Text Search
- Use `withSearchIndex` for full text search and combine with additional filters in the callback.

### Mutations
- Use `ctx.db.patch` for partial updates and `ctx.db.replace` for full replacement.
- Do not return created/updated documents or IDs from mutations; rely on reactive queries.

### Actions
- Add `"use node";` at the top of files using Node.js built-ins.
- Do not use `ctx.db` inside actions.

### Scheduling (Crons)
- Use `crons.interval` or `crons.cron` only (no `hourly`, `daily`, `weekly`).
- Cron methods require a `FunctionReference`; never pass the function directly.
- Export a default `crons` object with registered jobs.

### File Storage
- `ctx.storage.getUrl()` returns a signed URL or `null` if missing.
- Do not use deprecated `ctx.storage.getMetadata`; query `_storage` via `ctx.db.system.get` instead.
- Convert to/from `Blob` for storage operations.

## Testing

### Test Utilities
- **Import from `@/test-utils`** instead of `@testing-library/react` for component tests.
- **Use `renderWithUser()`** - automatically sets up `userEvent` for you.
- **Global cleanup is automatic** - no need to manually call `cleanup()` in tests.
- **Shared mocks** live in `src/__tests__/helpers/mocks.ts` - use them instead of duplicating mocks.
- **Shared fixtures** live in `src/__tests__/helpers/fixtures.ts` - reuse test data across tests.

```typescript
// ✅ GOOD - using test utilities
import { renderWithUser, screen } from "@/test-utils";

it("interacts with button", async () => {
  const { user } = renderWithUser(<MyComponent />);
  await user.click(screen.getByRole("button"));
  expect(screen.getByText("Clicked")).toBeInTheDocument();
});

// ❌ BAD - manual setup
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

it("interacts with button", async () => {
  const user = userEvent.setup();
  render(<MyComponent />);
  await user.click(screen.getByRole("button"));
});
```

### Test Selectors
- Always use `data-testid` attributes on interactive components and key UI elements that need to be tested.
- Prefer `getByTestId` or `queryByTestId` over role-based queries when components are complex or have multiple similar elements.
- Use descriptive, kebab-case names for test IDs (e.g., `data-testid="mode-toggle-trigger"`).

### Modern Testing APIs
- Use `userEvent` instead of `fireEvent` for all user interactions.
- Always use `async/await` with user interactions - they are asynchronous.
- Use `renderWithUser()` from `@/test-utils` to get userEvent set up automatically.
- Prefer `findBy*` queries over `waitFor` + `getBy*` - they have built-in waiting.
- Never manually wrap with `act()` - React Testing Library handles this automatically.
- Mock external dependencies at module level using `vi.mock()`.

```typescript
// ❌ BAD - using deprecated fireEvent
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

it("clicks button", () => {
  render(<Button />);
  fireEvent.click(screen.getByRole("button"));
  await waitFor(() => {
    expect(screen.getByText("Clicked")).toBeInTheDocument();
  });
});

// ✅ GOOD - using renderWithUser from test-utils
import { renderWithUser, screen } from "@/test-utils";

it("clicks button", async () => {
  const { user } = renderWithUser(<Button />);
  await user.click(screen.getByRole("button"));
  expect(await screen.findByText("Clicked")).toBeInTheDocument();
});
```

### Test Organization
- All tests must be organized within `describe` blocks.
- Every test file must have a parent `describe` block that wraps all tests (e.g., `describe("items", () => { ... })`).
- The parent `describe` block should contain all `let` variable declarations and `beforeEach` hooks.
- Use nested `describe` blocks only when grouping multiple functions or features - if all tests are for a single function, the parent `describe` is sufficient.
- Use descriptive names for `describe` blocks that clearly indicate what is being tested.

```typescript
// ❌ BAD - tests without parent describe block
let asAlice: TestIdentity;
beforeEach(async () => { ... });

describe("items.createItem", () => {
  it("creates item", async () => { ... });
});

// ✅ GOOD - parent describe wraps everything
describe("items", () => {
  let asAlice: TestIdentity;
  let listId: Id<"lists">;

  beforeEach(async () => {
    // setup code
  });

  describe("items.createItem", () => {
    it("creates item and it appears in getListItems", async () => { ... });
  });
});
```

## Post-Change Checks
After any code change, run:
- `bun typecheck`
- `bun check:write`
