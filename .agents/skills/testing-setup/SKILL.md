---
name: testing-setup
description: Guide for writing tests using the project's testing infrastructure. Use when writing tests, creating test files, or when the user asks about testing setup, test utilities, fixtures, or mocks.
---

# Testing Setup

## Quick Start

Import test utilities from `@/test-utils` instead of `@testing-library/react`:

```typescript
import { renderWithUser, screen } from "@/test-utils";

it("interacts with component", async () => {
  const { user } = renderWithUser(<MyComponent />);
  await user.click(screen.getByRole("button"));
  expect(screen.getByText("Clicked")).toBeInTheDocument();
});
```

## Test Utilities

### `renderWithUser()`

Combines `render()` and `userEvent.setup()` automatically. Use this instead of the regular `render` from `@testing-library/react`.

```typescript
import { renderWithUser, screen } from "@/test-utils";

it("handles user interaction", async () => {
  const { user } = renderWithUser(<MyComponent />);
  await user.click(screen.getByTestId("my-button"));
  expect(await screen.findByText("Clicked")).toBeInTheDocument();
});
```

### Re-exports

`@/test-utils` re-exports all utilities from `@testing-library/react` and `userEvent`, so you can import everything from one place.

## Test Helpers

### Fixtures (`src/__tests__/helpers/fixtures.ts`)

Use predefined test data to avoid duplication:

```typescript
import { mockUser, mockList } from "@/__tests__/helpers/fixtures";

it("uses fixture data", () => {
  expect(mockUser.email).toBe("test@example.com");
});
```

### Mocks (`src/lib/helpers/mocks.ts`)

Use reusable mocks for common dependencies:

```typescript
import { useTheme } from "next-themes";
import { mockNextThemes } from "@/lib/helpers/mocks";
import { renderWithUser, screen } from "@/test-utils";

const { mockSetTheme } = mockNextThemes();

it("calls setTheme when theme button is clicked", async () => {
  function ThemeButton() {
    const { setTheme } = useTheme();
    return (
      <button data-testid="theme-dark" type="button" onClick={() => setTheme("dark")}>
        Dark
      </button>
    );
  }
  const { user } = renderWithUser(<ThemeButton />);
  await user.click(screen.getByTestId("theme-dark"));
  expect(mockSetTheme).toHaveBeenCalledWith("dark");
});
```

## Test Structure

All tests must be organized within `describe` blocks:

```typescript
describe("my-component", () => {
  let asAlice: TestIdentity;
  
  beforeEach(async () => {
    // setup code
  });

  it("renders correctly", () => {
    renderWithUser(<MyComponent />);
    expect(screen.getByTestId("my-element")).toBeInTheDocument();
  });

  it("handles user interaction", async () => {
    const { user } = renderWithUser(<MyComponent />);
    await user.click(screen.getByTestId("my-button"));
    expect(await screen.findByText("Clicked")).toBeInTheDocument();
  });
});
```

## Best Practices

1. **Use `renderWithUser`** - Automatically sets up userEvent for cleaner tests
2. **Add `data-testid`** - Use on interactive components and key UI elements
3. **Organize in `describe` blocks** - Every test file must have a parent `describe` block
4. **Use `findBy*` queries** - For async content instead of `waitFor` + `getBy*`
5. **Never manually call `cleanup()`** - Automatic cleanup is handled globally
6. **Never manually wrap with `act()`** - React Testing Library handles this automatically
7. **Use `userEvent`** - Always use `userEvent` instead of `fireEvent` for interactions
8. **Always use `async/await`** - User interactions are asynchronous
9. **Reuse mocks and fixtures** - Add common mocks/fixtures to helpers when used in multiple tests

## Advanced Topics

For detailed information on specific testing patterns, see:

- **[Environment-Dependent Tests](references/environment-dependent-tests.md)** - How to test components that depend on environment variables
- **[Test Organization](references/test-organization.md)** - Complete guide to organizing tests with describe blocks, examples, and best practices
- **[Modern Testing APIs](references/modern-testing-apis.md)** - Comprehensive guide to userEvent, async queries, and modern testing patterns

## Testing Commands

- `bun test` - Run tests in watch mode
- `bun test:once` - Run all tests once
- `bun test:ui` - Open Vitest UI
- `bun test:coverage` - Generate coverage report
- `bun test:unit` - Run only unit tests (not convex)
- `bun test:convex` - Run only convex backend tests
- `bun test:debug` - Debug mode

## Coverage

Coverage thresholds are set to 70% for:
- Lines
- Functions
- Branches
- Statements

Run `bun test:coverage` to generate a coverage report.

## Global Setup

The project includes automatic test setup (`src/test-setup.ts`):
- Automatic cleanup after each test
- jest-dom matchers globally available
- No need for manual cleanup in individual test files

## Test Environments

Two test projects configured:
- **convex** - Backend tests (edge-runtime)
- **unit** - Frontend components & utilities (happy-dom)
