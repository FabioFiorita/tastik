# Agent Instructions (Always Read)

These instructions apply to any assistant working in this repository. Keep rules here concise and universally applicable. Put broader domain knowledge in skills.

## Skills Usage
- Use a skill when the task matches its description or the user names it.
- Prefer skills for product/domain knowledge and deeper context (example: `tastik-knowledge`).
- Use `convex-guidelines` skill when writing or modifying Convex backend code.
- Use `testing-setup` skill when writing tests or working with test utilities.
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

## Instructions vs Skills

When a developer asks to add content to INSTRUCTIONS.md or create/update a skill, **always verify it belongs in the right place**:

**INSTRUCTIONS.md is for:**
- Must-follow rules and constraints that prevent mistakes
- Project conventions that apply to every interaction
- Short, actionable directives (< 2-3 lines each)
- Things that should be checked on every call

**Skills are for:**
- Framework knowledge and reference material
- Detailed examples and code patterns
- How-to guides and step-by-step instructions
- Domain knowledge that's needed on-demand

**When in doubt, ask the developer:**
- "This seems like [knowledge/a rule]. Should it go in [a skill/INSTRUCTIONS.md] instead?"
- "Should I add this to the existing `[skill-name]` skill or create a new one?"
- "This would make INSTRUCTIONS.md longer. Could this be a skill instead?"

**Examples:**
- "Always use `data-testid` on interactive components" → INSTRUCTIONS.md (rule)
- "How to mock environment-dependent modules" → skill (knowledge)
- "Do not use barrel files in utils/" → INSTRUCTIONS.md (constraint)
- "Complete guide to Convex validators" → skill (reference)

## Frontend Standards
- Do not use `void` on function calls; it is unnecessary.
- No deprecated APIs. Example: use `React.SyntheticEvent<HTMLFormElement>` for form submits (not `FormEvent`).
- Tailwind/shadcn: prefer design tokens (`primary`, `muted`, `muted-foreground`, `foreground`) and standard scales (`text-xs`, `text-sm`, `size-5`). Avoid arbitrary values unless behind a theme variable or a shared component.
- Mobile-first: base styles for mobile; use `md:` or `lg:` for larger breakpoints. Avoid `sm:` for layout.
- One *exported* component per file. Small helper components (<30 lines, used only by the file's main component) may live in the same file as unexported functions.
- No duplication. Extract repeated layout/structure into a reusable component.
- Navigation: Use TanStack Router's `useNavigate()` hook for navigation. Never use `window.location.href` or `window.location` for navigation. Use `navigate({ to: "/path" })` or `navigate({ to: "/path", replace: true })` as needed.

## Component Files
- One *exported* component per file. Small helper components (<30 lines, used only by the file's main component) may live in the same file as unexported functions.
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

## Convex Types
- Infer domain types (enums, unions) from `convex/schema.ts` validators. Do not duplicate literal unions or enum-like types in `src/`; create a type in `src/lib/types/` using `Infer<typeof someValidator>` and import from the schema.

## Convex Queries in Hooks
- Do not call Convex queries directly in components.
- Create hooks under `src/hooks/queries/`.
- Hooks must return only the data (or values) the UI needs—never the raw `useQuery`/`useSuspenseQuery` result. Returning the full result defeats the wrapper (e.g. simple mocks in tests).
- One query (or related set) per hook file. Name hooks after the data they expose.

## Business Logic in Hooks
- Keep business logic out of UI components. Derived state (e.g. isTrialing, trialDaysLeft from subscription) belongs in dedicated hooks under `src/hooks/`. Components consume the hook result, not raw context plus local computation.
- Action handlers (create, update, delete operations) belong in hooks under `src/hooks/actions/`, not in components. Components should only handle presentation and delegate business logic to hooks.
- Mutation hooks must wrap `useMutation` with business logic (loading state, error handling, toast notifications). Never return the raw `useMutation` result—this makes hooks easier to mock and test. Example: return `{ createItem, isPending }` not `useMutation(api.items.createItem)`.

## Testing
- Import from `@/test-utils` instead of `@testing-library/react` for component tests.
- Use `renderWithUser()` to automatically set up `userEvent`.
- Always use `data-testid` attributes on interactive components and key UI elements.
- Use `userEvent` instead of `fireEvent` for all user interactions (always with `async/await`).
- Organize all tests within `describe` blocks; every test file must have a parent `describe` block.
- For environment-dependent tests, mock the consumer module that uses env vars (see `testing-setup` skill).

## Test Helpers
- Use helpers from `@/lib/helpers/mocks` instead of manually mocking common modules.
- `mockReactRouterLink()` - Mocks TanStack Router Link component (use when rendering Link components).
- `mockReactRouter()` - Mocks navigation hooks (useNavigate, useLocation, useParams).
- `mockUseCurrentUser()` - Returns controllable mock for `useCurrentUser` hook (use `mockReturnValue` in tests).
- `mockNextThemes()` - Mocks next-themes (use `returnFunction: true` if you need controllable `useTheme`).
- Never manually mock these modules - always use the helpers to avoid duplication.

## Testing (best practices)
- Do not use `vi.hoisted`. Define mocks inside the `vi.mock()` factory and expose them via a dedicated export (e.g. `__mocks` or `__mockX`) so tests can obtain references after importing the mocked module.
- Use `vi.mocked(mockFn)` when calling mock methods (e.g. `mockResolvedValue`, `mockReturnValue`) or when TypeScript needs to treat the value as a mock; this keeps assertions type-safe.

## Post-Change Checks
After any code change, run:
- `bun typecheck`
- `bun check:write`
