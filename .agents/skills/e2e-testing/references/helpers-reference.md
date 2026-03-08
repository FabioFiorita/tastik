# E2E Helpers API Reference

All helpers are exported from `e2e/helpers/list-helpers.ts`.

## `uniqueName(prefix: string): string`

Generates a unique name by appending a timestamp and random suffix.

```typescript
const listName = uniqueName("e2e-my-test"); // "e2e-my-test-1709827200000-x7k2m9"
```

## `escapeRegExp(value: string): string`

Escapes regex special characters for safe use in `new RegExp()`.

## `listLinkByName(page: Page, listName: string): Locator`

Returns a locator for the first link matching the list name on the home page.

## `itemRowByName(page: Page, itemName: string): Locator`

Returns a locator for an item row (`[data-item-row]`) filtered by text content.

```typescript
const row = itemRowByName(page, "My Item");
await expect(row).toBeVisible();
```

## `gotoHome(page: Page): Promise<void>`

Navigates to `/home`. If redirected to sign-in (e.g. expired session), re-authenticates using `E2E_TEST_EMAIL` and `E2E_TEST_PASSWORD`.

## `selectOptionByTestId(page: Page, testId: string, optionLabel: string): Promise<void>`

Clicks a select trigger identified by `data-testid`, then selects an option from the dropdown by label. Works with shadcn `data-slot='select-content'` / `data-slot='select-item'`.

```typescript
await selectOptionByTestId(page, "item-type-select", "Calculator");
await selectOptionByTestId(page, "item-tag-select", "Groceries");
```

## `createList(page: Page, args: { name: string; type?: ListType }): Promise<void>`

Creates a new list from the home page. Navigates home, opens the create dialog, fills the name, optionally selects a type, and submits. Waits for the new list to appear in the sidebar.

**`ListType`**: `"simple" | "calculator" | "stepper" | "kanban" | "multi"`

```typescript
await createList(page, { name: listName, type: "stepper" });
```

## `openListByName(page: Page, listName: string): Promise<void>`

Navigates home, clicks the list link, and waits for the list detail view (URL matches `/lists/` and heading shows the list name).

## `openListActions(page: Page): Promise<void>`

Clicks the list actions trigger (`data-testid="list-actions-trigger"`).

## `deleteCurrentList(page: Page): Promise<void>`

Deletes the currently open list via the actions menu. Asserts redirect to `/home`.

## `cleanupListByName(page: Page, listName: string): Promise<void>`

Safely deletes a list by name. Designed for `finally` blocks:
- Returns early if the page is closed.
- Returns early if the list or delete action is not found.
- Swallows all errors so it never masks test assertion failures.

## `addItem(page: Page, args: { name: string; step?: string; currentValue?: string; calculatorValue?: string; itemType?: string }): Promise<void>`

Adds an item to the currently open list. Clicks the add button, fills the name, optionally fills type-specific fields, and submits.

| Field | When to use |
|-------|-------------|
| `step` | Stepper lists — fills `item-step-input` |
| `currentValue` | Stepper lists — fills `item-current-value-input` |
| `calculatorValue` | Calculator lists — fills `item-calculator-value-input` |
| `itemType` | Multi lists — selects type via `item-type-select` |

```typescript
// Simple item
await addItem(page, { name: "Buy milk" });

// Stepper item
await addItem(page, { name: "Counter", step: "2", currentValue: "3" });

// Calculator item
await addItem(page, { name: "Rent", calculatorValue: "1200" });

// Multi list item with type
await addItem(page, { name: "Task", itemType: "Calculator", calculatorValue: "42" });
```

## `deleteItem(page: Page, itemName: string): Promise<void>`

Deletes an item by opening its actions menu, clicking Delete, and confirming. Waits for the item row to disappear.

```typescript
await deleteItem(page, "My Item");
```
