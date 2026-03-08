# E2E Testing — Tastik

Guides writing and maintaining Playwright E2E tests for Tastik.

## Philosophy

- **Real dev environment**: Tests run against the actual dev deployment—no mocking Convex (WebSocket-based, can't intercept with `page.route()`).
- **Dedicated test account**: A single account (`E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD`) authenticates once in setup, reused across all authenticated tests.
- **`e2e-` prefix**: Every test-created entity uses `uniqueName("e2e-...")` so stale artifacts are identifiable and cleaned up automatically in `auth.setup.ts`.
- **Isolation via try/finally**: Each test creates its own list, runs assertions, then deletes it in a `finally` block using `cleanupListByName()`.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `PLAYWRIGHT_TEST_BASE_URL` | Dev URL (e.g. `https://tastik-dev.xxx.workers.dev`) |
| `E2E_TEST_EMAIL` | Test account email |
| `E2E_TEST_PASSWORD` | Test account password |

Set in `.env.local` (loaded by `playwright.config.ts` via `dotenv`).

## Config Overview (`playwright.config.ts`)

Three Playwright projects run sequentially:

1. **setup** — Authenticates the test account, cleans stale `e2e-` lists, saves `storageState` to `playwright/.auth/user.json`.
2. **chromium-auth** — Authenticated tests in `e2e/authenticated/`. Uses saved `storageState`. Depends on `setup`.
3. **chromium-public** — Unauthenticated tests in `e2e/public/`. Uses empty `storageState`. Depends on `chromium-auth`.

Workers: `1` (serial execution to avoid conflicts on the shared test account).

## Test Organization

```
e2e/
├── auth.setup.ts              # Setup project: login + cleanup
├── helpers/
│   └── list-helpers.ts        # Shared helpers (navigation, CRUD, locators)
├── authenticated/             # Tests requiring auth (chromium-auth project)
│   ├── app-shell.spec.ts
│   ├── item-types.spec.ts
│   ├── list-lifecycle.spec.ts
│   └── tags-and-preferences.spec.ts
└── public/                    # Tests without auth (chromium-public project)
    ├── auth-guards.spec.ts
    └── public-navigation.spec.ts
```

## The Isolation Pattern

Every authenticated test follows this structure:

```typescript
test("does something", async ({ page }) => {
  const listName = uniqueName("e2e-descriptive-name");
  try {
    await createList(page, { name: listName, type: "simple" });
    await openListByName(page, listName);
    // ... assertions ...
  } finally {
    await cleanupListByName(page, listName);
  }
});
```

- `uniqueName()` appends timestamp + random suffix to avoid collisions.
- `cleanupListByName()` is safe to call even if the test failed mid-flow (swallows errors, checks if page is closed).

## Available Helpers (`e2e/helpers/list-helpers.ts`)

| Helper | Purpose |
|--------|---------|
| `uniqueName(prefix)` | Generate unique name with timestamp + random suffix |
| `escapeRegExp(value)` | Escape regex special chars for safe matching |
| `listLinkByName(page, name)` | Locator for a list link on the home page |
| `itemRowByName(page, name)` | Locator for an item row by `[data-item-row]` |
| `gotoHome(page)` | Navigate to `/home`, re-authenticate if needed |
| `selectOptionByTestId(page, testId, label)` | Click a `data-testid` select trigger, pick an option |
| `createList(page, { name, type? })` | Create a list from the home page |
| `openListByName(page, name)` | Navigate home, click into a list, verify URL + heading |
| `openListActions(page)` | Click the list actions trigger |
| `deleteCurrentList(page)` | Delete the currently open list |
| `cleanupListByName(page, name)` | Safely delete a list (for `finally` blocks) |
| `addItem(page, { name, ...fields })` | Add an item to the current list |
| `deleteItem(page, itemName)` | Delete an item via its actions menu |

See [helpers-reference.md](references/helpers-reference.md) for full API docs.

## Locator Patterns

- **`data-testid`**: Primary locator strategy. Examples: `add-item-button`, `item-name-input`, `create-item-submit`.
- **`data-item-row`**: Attribute on every item row. Use `itemRowByName()` to find by text.
- **`data-testid^='prefix-'`**: Dynamic test IDs include item/list IDs. Use prefix matching: `[data-testid^='item-checkbox-']`.
- **`data-slot`**: shadcn select internals. Use `selectOptionByTestId()` instead of manual locators.

## Running Tests

```bash
# All tests
bun test:e2e

# Single file
bunx playwright test e2e/authenticated/list-lifecycle.spec.ts

# Headed mode (see the browser)
bunx playwright test --headed

# With UI mode
bunx playwright test --ui
```

## Adding New Tests

See [writing-new-tests.md](references/writing-new-tests.md) for step-by-step templates.

**Quick checklist:**
1. Place in `e2e/authenticated/` or `e2e/public/` based on auth needs.
2. Wrap in a `test.describe()` block.
3. Use `uniqueName("e2e-...")` for all created entities.
4. Use `try/finally` with `cleanupListByName()` for authenticated tests.
5. Use helpers from `list-helpers.ts`—don't inline CRUD patterns.
6. Prefer `data-testid` locators over text/role selectors.
