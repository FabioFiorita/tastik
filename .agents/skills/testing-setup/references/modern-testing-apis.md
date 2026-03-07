# Modern Testing APIs

## Core Principles

1. **Use `userEvent` instead of `fireEvent`** - More realistic user interactions
2. **Always use `async/await` with user interactions** - They are asynchronous
3. **Use `renderWithUser()` from `@/test-utils`** - Automatically sets up userEvent
4. **Prefer `findBy*` queries over `waitFor` + `getBy*`** - Built-in waiting
5. **Never manually wrap with `act()`** - React Testing Library handles this
6. **Mock external dependencies at module level** - Use `vi.mock()`

## renderWithUser()

Import from `@/test-utils`, not `@testing-library/react`:

```typescript
import { renderWithUser, screen } from "@/test-utils";

it("interacts with component", async () => {
  const { user } = renderWithUser(<MyComponent />);
  await user.click(screen.getByRole("button"));
  expect(screen.getByText("Clicked")).toBeInTheDocument();
});
```

### ❌ BAD - Manual setup

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

it("interacts with button", async () => {
  const user = userEvent.setup();  // Manual setup
  render(<MyComponent />);         // Separate render
  await user.click(screen.getByRole("button"));
});
```

### ✅ GOOD - Using renderWithUser

```typescript
import { renderWithUser, screen } from "@/test-utils";

it("interacts with button", async () => {
  const { user } = renderWithUser(<MyComponent />);  // All in one
  await user.click(screen.getByRole("button"));
});
```

## userEvent vs fireEvent

### ❌ DEPRECATED - Using fireEvent

```typescript
import { fireEvent, render, screen } from "@testing-library/react";

it("clicks button", () => {
  render(<Button />);
  fireEvent.click(screen.getByRole("button"));  // Don't use fireEvent
});
```

**Problems with fireEvent:**
- Not asynchronous (misses real user behavior)
- Doesn't trigger all events (e.g., hover, focus)
- Bypasses validation
- Can cause act() warnings

### ✅ CORRECT - Using userEvent

```typescript
import { renderWithUser, screen } from "@/test-utils";

it("clicks button", async () => {
  const { user } = renderWithUser(<Button />);
  await user.click(screen.getByRole("button"));  // Use userEvent
});
```

**Benefits of userEvent:**
- Asynchronous (matches real behavior)
- Triggers all related events
- Respects disabled state
- More realistic testing

## User Interactions

### Click

```typescript
it("handles click", async () => {
  const { user } = renderWithUser(<Button />);
  await user.click(screen.getByRole("button"));
});
```

### Type

```typescript
it("handles typing", async () => {
  const { user } = renderWithUser(<Input />);
  await user.type(screen.getByRole("textbox"), "Hello World");
  expect(screen.getByRole("textbox")).toHaveValue("Hello World");
});
```

### Clear

```typescript
it("clears input", async () => {
  const { user } = renderWithUser(<Input defaultValue="Test" />);
  const input = screen.getByRole("textbox");

  await user.clear(input);
  expect(input).toHaveValue("");
});
```

### Tab

```typescript
it("handles tab navigation", async () => {
  const { user } = renderWithUser(<Form />);

  await user.tab();  // Move to next element
  await user.tab({ shift: true });  // Move to previous element
});
```

### Keyboard

```typescript
it("handles keyboard shortcuts", async () => {
  const { user } = renderWithUser(<Editor />);

  await user.keyboard("{Control>}s{/Control}");  // Ctrl+S
  await user.keyboard("{Escape}");                // Escape key
});
```

### Hover

```typescript
it("shows tooltip on hover", async () => {
  const { user } = renderWithUser(<TooltipButton />);

  await user.hover(screen.getByRole("button"));
  expect(await screen.findByRole("tooltip")).toBeInTheDocument();
});
```

### Select

```typescript
it("selects option", async () => {
  const { user } = renderWithUser(<Select />);

  await user.selectOptions(screen.getByRole("combobox"), "option1");
  expect(screen.getByRole("combobox")).toHaveValue("option1");
});
```

## Queries: findBy vs waitFor + getBy

### ❌ AVOID - waitFor + getBy

```typescript
import { waitFor } from "@testing-library/react";

it("shows message after delay", async () => {
  const { user } = renderWithUser(<DelayedMessage />);
  await user.click(screen.getByRole("button"));

  await waitFor(() => {
    expect(screen.getByText("Message")).toBeInTheDocument();
  });
});
```

### ✅ PREFER - findBy

```typescript
it("shows message after delay", async () => {
  const { user } = renderWithUser(<DelayedMessage />);
  await user.click(screen.getByRole("button"));

  expect(await screen.findByText("Message")).toBeInTheDocument();
});
```

**Benefits of findBy:**
- Built-in waiting (no need for waitFor)
- Cleaner syntax
- Automatic retry logic
- Better error messages

## Query Types

### getBy* - Element must exist now

```typescript
// Throws if not found
const button = screen.getByRole("button");
const heading = screen.getByText("Welcome");
```

### queryBy* - Element may not exist

```typescript
// Returns null if not found
const button = screen.queryByRole("button");
expect(button).not.toBeInTheDocument();
```

### findBy* - Element will appear soon

```typescript
// Waits for element (returns Promise)
const message = await screen.findByText("Success");
expect(message).toBeInTheDocument();
```

## Testing Async Operations

### ✅ CORRECT Pattern

```typescript
it("shows success message after form submit", async () => {
  const { user } = renderWithUser(<Form />);

  await user.type(screen.getByLabelText("Name"), "John");
  await user.click(screen.getByRole("button", { name: "Submit" }));

  // Wait for async result
  expect(await screen.findByText("Success!")).toBeInTheDocument();
});
```

### Complete Form Example

```typescript
describe("login-form", () => {
  it("submits form with valid data", async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithUser(<LoginForm onSubmit={onSubmit} />);

    // Fill form
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");

    // Submit
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    // Verify
    expect(onSubmit).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("shows validation error for invalid email", async () => {
    const { user } = renderWithUser(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "invalid-email");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Invalid email")).toBeInTheDocument();
  });
});
```

## Never Use act()

### ❌ WRONG - Manual act()

```typescript
import { act } from "react";

it("updates state", async () => {
  const { user } = renderWithUser(<Counter />);

  await act(async () => {
    await user.click(screen.getByRole("button"));
  });
});
```

### ✅ CORRECT - No manual act()

```typescript
it("updates state", async () => {
  const { user } = renderWithUser(<Counter />);

  await user.click(screen.getByRole("button"));  // act() handled automatically
});
```

React Testing Library and userEvent handle `act()` automatically. If you see act() warnings:

1. Make sure you're using `await` with user interactions
2. Make sure you're using `findBy*` for async content
3. Check that all promises are properly awaited

## Module Mocking

### Mock External Dependencies

```typescript
import { vi } from "vitest";

// Mock at module level (top of file)
vi.mock("@/lib/api", () => ({
  fetchUser: vi.fn(),
  updateUser: vi.fn(),
}));

describe("user-profile", () => {
  it("loads user data", async () => {
    const { fetchUser } = await import("@/lib/api");

    fetchUser.mockResolvedValue({ name: "John", email: "john@example.com" });

    renderWithUser(<UserProfile userId="123" />);

    expect(await screen.findByText("John")).toBeInTheDocument();
    expect(fetchUser).toHaveBeenCalledWith("123");
  });
});
```

### Mock React Hooks

```typescript
// Mock next-themes
const mockSetTheme = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "dark",
    setTheme: mockSetTheme,
  }),
}));

describe("theme-toggle", () => {
  it("changes theme", async () => {
    const { user } = renderWithUser(<ThemeToggle />);

    await user.click(screen.getByTestId("theme-toggle"));
    await user.click(screen.getByTestId("theme-light"));

    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });
});
```

## Common Patterns

### Testing Conditional Rendering

```typescript
it("shows login button when not authenticated", () => {
  renderWithUser(<Header isAuthenticated={false} />);

  expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Sign Out" })).not.toBeInTheDocument();
});

it("shows logout button when authenticated", () => {
  renderWithUser(<Header isAuthenticated={true} />);

  expect(screen.getByRole("button", { name: "Sign Out" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Sign In" })).not.toBeInTheDocument();
});
```

### Testing Error States

```typescript
it("displays error message when fetch fails", async () => {
  const { fetchData } = await import("@/lib/api");
  fetchData.mockRejectedValue(new Error("Network error"));

  renderWithUser(<DataComponent />);

  expect(await screen.findByText("Failed to load data")).toBeInTheDocument();
});
```

### Testing Loading States

```typescript
it("shows loading spinner while fetching", async () => {
  const { fetchData } = await import("@/lib/api");

  // Delay the resolution
  let resolve: any;
  fetchData.mockReturnValue(new Promise((r) => { resolve = r; }));

  renderWithUser(<DataComponent />);

  // Loading state
  expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

  // Resolve and check loaded state
  resolve({ data: "test" });
  expect(await screen.findByText("test")).toBeInTheDocument();
  expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
});
```

## Best Practices Summary

1. ✅ Use `renderWithUser()` from `@/test-utils`
2. ✅ Use `userEvent` for all interactions
3. ✅ Always `await` user interactions
4. ✅ Use `findBy*` for async content
5. ✅ Use `queryBy*` for elements that may not exist
6. ✅ Mock external dependencies at module level
7. ❌ Never use `fireEvent`
8. ❌ Never manually wrap with `act()`
9. ❌ Never use `waitFor` when `findBy*` works
10. ❌ Never import from `@testing-library/react` directly (use `@/test-utils`)
