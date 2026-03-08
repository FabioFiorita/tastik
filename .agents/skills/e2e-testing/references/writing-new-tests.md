# Writing New E2E Tests

## Authenticated Test Template

Place in `e2e/authenticated/<feature>.spec.ts`.

```typescript
import { expect, test } from "@playwright/test";
import {
  addItem,
  cleanupListByName,
  createList,
  itemRowByName,
  openListByName,
  uniqueName,
} from "../helpers/list-helpers";

test.describe("<feature name>", () => {
  test("<what it does>", async ({ page }) => {
    const listName = uniqueName("e2e-<feature>");

    try {
      // Setup: create a list and navigate to it
      await createList(page, { name: listName, type: "simple" });
      await openListByName(page, listName);

      // Add items using the helper
      await addItem(page, { name: "My item" });
      await expect(itemRowByName(page, "My item")).toBeVisible();

      // ... your assertions ...
    } finally {
      await cleanupListByName(page, listName);
    }
  });
});
```

## Public Test Template

Place in `e2e/public/<feature>.spec.ts`. No auth, no cleanup needed.

```typescript
import { expect, test } from "@playwright/test";

test.describe("<feature name>", () => {
  test("<what it does>", async ({ page }) => {
    await page.goto("/some-page");

    // ... your assertions ...
    await expect(page.getByTestId("some-element")).toBeVisible();
  });
});
```

## Checklist

- [ ] File placed in correct directory (`authenticated/` or `public/`)
- [ ] Test wrapped in `test.describe()` block
- [ ] All entity names use `uniqueName("e2e-...")`
- [ ] `try/finally` with `cleanupListByName()` for authenticated tests
- [ ] Using helpers (`addItem`, `deleteItem`, `selectOptionByTestId`) instead of inline patterns
- [ ] Locators use `data-testid` attributes
- [ ] Assertions use `await expect(...)` (not raw `expect`)
- [ ] No hardcoded waits (`page.waitForTimeout`)—use `toBeVisible()`, `toHaveURL()`, etc.

## Tips

- **Multiple lists**: If a test creates multiple lists (e.g. duplicate test), clean up all of them in `finally`.
- **Stepper/Calculator items**: Pass the type-specific fields to `addItem()`.
- **Selecting options**: Use `selectOptionByTestId()` for any shadcn select trigger.
- **Item row actions**: Access via `itemRowByName(page, name).locator("[data-testid^='item-actions-']")`.
- **Timeouts**: The config sets 60s (local) / 90s (CI). Add explicit timeouts to `toBeVisible()` or `toHaveURL()` only when waiting for slow operations (e.g. list creation: `{ timeout: 15000 }`).
