# Test Organization

## Core Rules

1. **All tests must be organized within `describe` blocks**
2. **Every test file must have a parent `describe` block that wraps all tests**
3. **The parent `describe` block should contain all `let` variable declarations and `beforeEach` hooks**
4. **Use nested `describe` blocks only when grouping multiple functions or features**
5. **Use descriptive names for `describe` blocks that clearly indicate what is being tested**

## Basic Structure

### Single Component/Function

When testing a single component or function, use a single parent `describe`:

```typescript
describe("my-component", () => {
  let mockData: any;

  beforeEach(() => {
    mockData = { name: "Test" };
  });

  it("renders correctly", () => {
    renderWithUser(<MyComponent data={mockData} />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("handles user interaction", async () => {
    const { user } = renderWithUser(<MyComponent data={mockData} />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Clicked")).toBeInTheDocument();
  });
});
```

### Multiple Functions/Features

When testing multiple functions or features, use nested `describe` blocks:

```typescript
describe("items", () => {
  let asAlice: TestIdentity;
  let listId: Id<"lists">;

  beforeEach(async () => {
    asAlice = await testIdentity();
    listId = await asAlice.run(async (ctx) => {
      return await ctx.db.insert("lists", { name: "Test List" });
    });
  });

  describe("items.createItem", () => {
    it("creates item and it appears in getListItems", async () => {
      const itemId = await asAlice.run(async (ctx) => {
        return await ctx.runMutation(api.items.createItem, {
          listId,
          name: "Test Item",
        });
      });

      const items = await asAlice.run(async (ctx) => {
        return await ctx.runQuery(api.items.getListItems, { listId });
      });

      expect(items).toHaveLength(1);
      expect(items[0].name).toBe("Test Item");
    });
  });

  describe("items.updateItem", () => {
    it("updates item name", async () => {
      const itemId = await asAlice.run(async (ctx) => {
        return await ctx.db.insert("items", {
          listId,
          name: "Original Name",
        });
      });

      await asAlice.run(async (ctx) => {
        await ctx.runMutation(api.items.updateItem, {
          itemId,
          name: "Updated Name",
        });
      });

      const item = await asAlice.run(async (ctx) => {
        return await ctx.db.get(itemId);
      });

      expect(item?.name).toBe("Updated Name");
    });
  });
});
```

## Examples

### ❌ BAD - Tests without parent describe block

```typescript
let asAlice: TestIdentity;

beforeEach(async () => {
  asAlice = await testIdentity();
});

describe("items.createItem", () => {
  it("creates item", async () => {
    // Test code...
  });
});

describe("items.updateItem", () => {
  it("updates item", async () => {
    // Test code...
  });
});
```

**Problems:**
- No parent `describe` block wrapping all tests
- Variable declarations and hooks are at file level
- Harder to understand test scope

### ✅ GOOD - Parent describe wraps everything

```typescript
describe("items", () => {
  let asAlice: TestIdentity;
  let listId: Id<"lists">;

  beforeEach(async () => {
    asAlice = await testIdentity();
    listId = await asAlice.run(async (ctx) => {
      return await ctx.db.insert("lists", { name: "Test List" });
    });
  });

  describe("items.createItem", () => {
    it("creates item and it appears in getListItems", async () => {
      // Test code...
    });
  });

  describe("items.updateItem", () => {
    it("updates item name", async () => {
      // Test code...
    });
  });
});
```

**Benefits:**
- Clear test scope with parent `describe`
- All variables and hooks in one place
- Nested describes group related functionality
- Test output shows clear hierarchy

## Naming Conventions

### Parent Describe

Name after the component/module being tested:

```typescript
// Component tests
describe("auth-button", () => { /* ... */ });
describe("plan-card", () => { /* ... */ });
describe("error-state", () => { /* ... */ });

// Backend tests
describe("items", () => { /* ... */ });
describe("lists", () => { /* ... */ });
describe("users", () => { /* ... */ });
```

### Nested Describe

Name after the function or feature being tested:

```typescript
describe("items", () => {
  describe("items.createItem", () => { /* ... */ });
  describe("items.updateItem", () => { /* ... */ });
  describe("items.deleteItem", () => { /* ... */ });
});
```

Or group by feature:

```typescript
describe("subscription-page", () => {
  describe("rendering", () => { /* ... */ });
  describe("plan selection", () => { /* ... */ });
  describe("URL building", () => { /* ... */ });
});
```

### Test Names (it)

Use descriptive, behavior-focused names:

```typescript
it("renders sign in button when user is not authenticated", () => {});
it("redirects to dashboard when user clicks sign in", () => {});
it("shows error message when login fails", () => {});
it("creates item and it appears in getListItems", () => {});
```

## Variable Scope

### Shared Variables

Declare in parent `describe`:

```typescript
describe("my-component", () => {
  let mockData: { name: string; id: string };
  let userId: string;

  beforeEach(() => {
    mockData = { name: "Test", id: "123" };
    userId = "user_123";
  });

  // All tests can access mockData and userId
});
```

### Test-Specific Variables

Declare within individual tests:

```typescript
describe("my-component", () => {
  it("handles specific case", () => {
    const specialData = { /* ... */ };  // Only for this test
    renderWithUser(<MyComponent data={specialData} />);
  });
});
```

## Setup and Teardown

### beforeEach

Run before each test:

```typescript
describe("items", () => {
  let asAlice: TestIdentity;

  beforeEach(async () => {
    asAlice = await testIdentity();
  });

  it("test 1", () => { /* Fresh asAlice */ });
  it("test 2", () => { /* Fresh asAlice */ });
});
```

### afterEach

Clean up after each test (usually not needed with automatic cleanup):

```typescript
describe("items", () => {
  afterEach(() => {
    // Manual cleanup if needed (rare)
  });
});
```

### beforeAll / afterAll

Run once per describe block:

```typescript
describe("items", () => {
  beforeAll(async () => {
    // Setup that runs once
  });

  afterAll(async () => {
    // Cleanup that runs once
  });
});
```

## Nested Setup

Inner `describe` blocks can have their own setup:

```typescript
describe("items", () => {
  let asAlice: TestIdentity;

  beforeEach(async () => {
    asAlice = await testIdentity();
  });

  describe("with existing items", () => {
    let itemId: Id<"items">;

    beforeEach(async () => {
      // Runs AFTER parent beforeEach
      itemId = await asAlice.run(async (ctx) => {
        return await ctx.db.insert("items", { name: "Test" });
      });
    });

    it("can update existing item", async () => {
      // Has access to both asAlice and itemId
    });
  });
});
```

## Complete Example

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { renderWithUser, screen } from "@/test-utils";
import { PlanCard } from "./plan-card";

describe("plan-card", () => {
  let mockPlan: { name: string; price: number; features: string[] };

  beforeEach(() => {
    mockPlan = {
      name: "Pro Plan",
      price: 9.99,
      features: ["Feature 1", "Feature 2", "Feature 3"],
    };
  });

  describe("rendering", () => {
    it("displays plan name", () => {
      renderWithUser(<PlanCard plan={mockPlan} />);
      expect(screen.getByText("Pro Plan")).toBeInTheDocument();
    });

    it("displays plan price", () => {
      renderWithUser(<PlanCard plan={mockPlan} />);
      expect(screen.getByText("$9.99")).toBeInTheDocument();
    });

    it("displays all features", () => {
      renderWithUser(<PlanCard plan={mockPlan} />);
      expect(screen.getByText("Feature 1")).toBeInTheDocument();
      expect(screen.getByText("Feature 2")).toBeInTheDocument();
      expect(screen.getByText("Feature 3")).toBeInTheDocument();
    });
  });

  describe("user interaction", () => {
    it("calls onClick when card is clicked", async () => {
      const onClick = vi.fn();
      const { user } = renderWithUser(
        <PlanCard plan={mockPlan} onClick={onClick} />
      );

      await user.click(screen.getByTestId("plan-card"));
      expect(onClick).toHaveBeenCalledWith(mockPlan);
    });
  });
});
```

## Best Practices

1. **Always use parent describe** - Every test file needs one
2. **Keep setup in beforeEach** - Not in individual tests
3. **Use nested describes sparingly** - Only for grouping related tests
4. **Name describes clearly** - Should describe what's being tested
5. **Declare variables in describe scope** - Not at file level
6. **Use descriptive test names** - Explain what behavior is tested
7. **One assertion focus per test** - Tests should be focused and clear
8. **Group related tests** - Use nested describes for logical grouping
