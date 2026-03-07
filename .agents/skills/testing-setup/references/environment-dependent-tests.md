# Environment-Dependent Tests

## The Problem

When testing components that depend on environment variables or external modules that validate env vars at import time, you cannot directly mock `import.meta.env`.

**Why?** Environment validation happens at module load time via `import.meta.env`, which cannot be intercepted by test mocks.

## The Solution

**Mock the consumer module that uses the env vars, not the env vars themselves.**

## Example Pattern

### ❌ INCORRECT - Trying to mock env vars directly

```typescript
// This won't work - import.meta.env already parsed
vi.mock("@/lib/env", () => ({
  env: { VITE_API_KEY: "test" }
}));

it("uses API key", () => {
  renderWithUser(<SubscriptionPage />);
  // Test fails - real env validation already ran
});
```

### ✅ CORRECT - Mock the module that consumes env vars

```typescript
const mockBuildRevenueCatUrl = vi.fn();

vi.mock("@/lib/revenue-cat", () => ({
  buildRevenueCatUrl: (...args: any[]) => mockBuildRevenueCatUrl(...args),
}));

describe("subscription-page", () => {
  beforeEach(() => {
    mockBuildRevenueCatUrl.mockImplementation(
      ({ userId, packageId, email }) =>
        `https://revenuecat.com/${userId}?package=${packageId}&email=${email}`,
    );
  });

  it("builds correct URLs", () => {
    // Test can now run without real env vars
    renderWithUser(<SubscriptionPage />);
    expect(mockBuildRevenueCatUrl).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user_123" }),
    );
  });
});
```

## When to Use This Pattern

Use this pattern when testing:

1. **Components importing modules that validate `import.meta.env` at load time**

   ```typescript
   // lib/env.ts validates at import time
   export const env = {
     API_KEY: import.meta.env.VITE_API_KEY!,  // Throws if missing
   };
   ```

2. **Code that uses external APIs, third-party services, or other env-dependent modules**

   ```typescript
   // lib/stripe.ts
   const stripe = new Stripe(import.meta.env.VITE_STRIPE_KEY!);
   ```

3. **Any dependency that would fail in test environment without real configuration**

   ```typescript
   // lib/analytics.ts
   const analytics = new Analytics({
     apiKey: import.meta.env.VITE_ANALYTICS_KEY!,
   });
   ```

## Step-by-Step Process

### 1. Identify the Consumer Module

Find the module that actually uses the environment variables:

```typescript
// src/components/subscription-page.tsx imports:
import { buildRevenueCatUrl } from "@/lib/revenue-cat";

// src/lib/revenue-cat.ts uses env vars:
const API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY;
```

Consumer module is `@/lib/revenue-cat`.

### 2. Create Mock Function

Create a mock function with `vi.fn()`:

```typescript
const mockBuildRevenueCatUrl = vi.fn();
```

### 3. Mock the Consumer Module

Mock the module at the top level (before describe blocks):

```typescript
vi.mock("@/lib/revenue-cat", () => ({
  buildRevenueCatUrl: (...args: any[]) => mockBuildRevenueCatUrl(...args),
}));
```

### 4. Setup Mock Implementation

Configure the mock behavior in `beforeEach`:

```typescript
beforeEach(() => {
  mockBuildRevenueCatUrl.mockImplementation(
    ({ userId, packageId, email }) =>
      `https://revenuecat.com/${userId}?package=${packageId}&email=${email}`,
  );
});
```

### 5. Assert on Mock

Test that the mock was called correctly:

```typescript
it("calls buildRevenueCatUrl with correct params", () => {
  renderWithUser(<SubscriptionPage />);

  expect(mockBuildRevenueCatUrl).toHaveBeenCalledWith(
    expect.objectContaining({
      userId: "user_123",
      packageId: "annual",
      email: "test@example.com",
    }),
  );
});
```

## Complete Example

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithUser, screen } from "@/test-utils";
import { SubscriptionPage } from "./subscription-page";

// Mock the consumer module
const mockBuildRevenueCatUrl = vi.fn();

vi.mock("@/lib/revenue-cat", () => ({
  buildRevenueCatUrl: (...args: any[]) => mockBuildRevenueCatUrl(...args),
}));

describe("subscription-page", () => {
  beforeEach(() => {
    // Setup mock behavior
    mockBuildRevenueCatUrl.mockImplementation(
      ({ userId, packageId, email }) =>
        `https://revenuecat.com/${userId}?package=${packageId}&email=${email}`,
    );
  });

  it("renders subscription options", () => {
    renderWithUser(<SubscriptionPage />);

    expect(screen.getByText("Monthly Plan")).toBeInTheDocument();
    expect(screen.getByText("Annual Plan")).toBeInTheDocument();
  });

  it("builds correct URL for monthly plan", async () => {
    const { user } = renderWithUser(<SubscriptionPage />);

    await user.click(screen.getByTestId("plan-action-link-monthly"));

    expect(mockBuildRevenueCatUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        packageId: "monthly",
      }),
    );
  });

  it("builds correct URL for annual plan", async () => {
    const { user } = renderWithUser(<SubscriptionPage />);

    await user.click(screen.getByTestId("plan-action-link-annual"));

    expect(mockBuildRevenueCatUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        packageId: "annual",
      }),
    );
  });
});
```

## Mock Reset

If needed, reset mocks between tests:

```typescript
beforeEach(() => {
  mockBuildRevenueCatUrl.mockReset();
  mockBuildRevenueCatUrl.mockImplementation(/* ... */);
});
```

Or clear calls without resetting implementation:

```typescript
beforeEach(() => {
  mockBuildRevenueCatUrl.mockClear();
});
```

## Testing Multiple Modules

If component uses multiple env-dependent modules, mock all of them:

```typescript
const mockBuildRevenueCatUrl = vi.fn();
const mockTrackEvent = vi.fn();

vi.mock("@/lib/revenue-cat", () => ({
  buildRevenueCatUrl: (...args: any[]) => mockBuildRevenueCatUrl(...args),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: (...args: any[]) => mockTrackEvent(...args),
}));

describe("subscription-page", () => {
  beforeEach(() => {
    mockBuildRevenueCatUrl.mockImplementation(/* ... */);
    mockTrackEvent.mockImplementation(() => {});
  });

  // Tests...
});
```

## Common Pitfalls

### 1. Mocking After Import

```typescript
// ❌ WRONG - mock must be at top level
describe("my-test", () => {
  vi.mock("@/lib/env", () => ({ /* ... */ }));  // Too late
});

// ✅ CORRECT - mock at top level
vi.mock("@/lib/env", () => ({ /* ... */ }));

describe("my-test", () => {
  // Tests...
});
```

### 2. Forgetting to Call Mock Function

```typescript
// ❌ WRONG - returns undefined
vi.mock("@/lib/revenue-cat", () => ({
  buildRevenueCatUrl: mockBuildRevenueCatUrl,  // Missing function call
}));

// ✅ CORRECT - call the mock
vi.mock("@/lib/revenue-cat", () => ({
  buildRevenueCatUrl: (...args: any[]) => mockBuildRevenueCatUrl(...args),
}));
```

### 3. Not Using beforeEach

```typescript
// ❌ RISKY - mock state persists between tests
it("test 1", () => {
  mockFn.mockReturnValue("value1");
  // ...
});

it("test 2", () => {
  // Still has "value1" from test 1!
});

// ✅ CORRECT - reset in beforeEach
beforeEach(() => {
  mockFn.mockReset();
  mockFn.mockReturnValue("default");
});
```
