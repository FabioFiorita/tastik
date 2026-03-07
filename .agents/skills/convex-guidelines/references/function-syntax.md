# Function Syntax and Registration

## Function Types

Convex provides several function types, each with specific use cases.

### Public Functions

Import from `./_generated/server`:

```typescript
import { query, mutation, action } from "./_generated/server";
```

- **`query`** - Read-only operations, cached and reactive
- **`mutation`** - Write operations, trigger reactive updates
- **`action`** - Can call external APIs, run Node.js code

### Internal Functions

For private functions not exposed to clients:

```typescript
import { internalQuery, internalMutation, internalAction } from "./_generated/server";
```

Use these for:
- Functions only called by other backend code
- Administrative operations
- Internal workflows

### HTTP Endpoints

Live in `convex/http.ts` and use `httpAction`:

```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    // Process webhook
    return new Response("OK", { status: 200 });
  }),
});

export default http;
```

## Function Definition Syntax

### Basic Structure

```typescript
export const functionName = query({
  args: { /* validators */ },
  returns: v.object({ /* shape */ }), // optional
  handler: async (ctx, args) => {
    // implementation
  },
});
```

### Components

1. **args** - Object with validator for each argument (required, even if empty: `args: {}`)
2. **returns** - Validator for return value (optional, see validators reference)
3. **handler** - Async function receiving `ctx` and `args`

## Registration Rules

### ✅ CORRECT - Export functions directly

```typescript
export const getItem = query({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

### ❌ INCORRECT - Don't register through api/internal objects

```typescript
// DON'T DO THIS
api.items.getItem = query({ /* ... */ });
```

## Context Object (ctx)

The `ctx` parameter provides access to:

### In Queries and Mutations
- `ctx.db` - Database operations
- `ctx.auth` - Authentication info
- `ctx.storage` - File storage
- `ctx.runQuery()` - Call other queries
- `ctx.runMutation()` - Call mutations
- `ctx.runAction()` - Call actions

### In Actions
- `ctx.auth` - Authentication info
- `ctx.storage` - File storage
- `ctx.runQuery()` - Call queries
- `ctx.runMutation()` - Call mutations
- `ctx.runAction()` - Call other actions
- `ctx.scheduler` - Schedule functions
- **NO `ctx.db`** - Actions cannot directly access database

## Calling Functions

Use `api` for public functions, `internal` for private:

```typescript
import { api, internal } from "./_generated/api";

// Call public query
const data = await ctx.runQuery(api.items.getItem, { id });

// Call internal mutation
await ctx.runMutation(internal.items.updateInternal, { id, data });
```

### Type Annotations for Same-File Calls

When calling a function in the same file, add return type annotation to avoid TypeScript circularity:

```typescript
export const helper = query({
  args: { id: v.id("items") },
  handler: async (ctx, args): Promise<{ name: string } | null> => {
    return await ctx.db.get(args.id);
  },
});

export const main = query({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    // Type annotation on helper prevents circular reference error
    return await ctx.runQuery(internal.items.helper, { id: args.id });
  },
});
```

## Actions-Specific Rules

### Node.js Built-ins

Add `"use node";` directive at top of file:

```typescript
"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import nodemailer from "nodemailer";

export const sendEmail = action({
  args: { to: v.string(), subject: v.string(), body: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Use Node.js libraries
    const transporter = nodemailer.createTransport(/* ... */);
    await transporter.sendMail({ /* ... */ });
    return null;
  },
});
```

### Action to Action Calls

Avoid calling actions from actions unless crossing runtimes. Prefer shared helpers:

```typescript
// ❌ AVOID - action calling action
export const actionA = action({
  handler: async (ctx, args) => {
    return await ctx.runAction(api.actionB, {});
  },
});

// ✅ PREFER - shared helper
async function helperLogic() {
  // shared implementation
}

export const actionA = action({
  handler: async () => helperLogic(),
});

export const actionB = action({
  handler: async () => helperLogic(),
});
```
