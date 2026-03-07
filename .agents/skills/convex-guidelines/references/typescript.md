# TypeScript Patterns

## Document IDs

Use `Id<'table'>` from `./_generated/dataModel` instead of `string`:

```typescript
import { Id } from "./_generated/dataModel";

// ✅ CORRECT - Type-safe IDs
export const getItem = query({
  args: { id: v.id("items") },
  handler: async (ctx, args: { id: Id<"items"> }) => {
    return await ctx.db.get(args.id);
  },
});

// ❌ INCORRECT - Loses type safety
export const getItem = query({
  args: { id: v.id("items") },
  handler: async (ctx, args: { id: string }) => {  // Don't use string
    return await ctx.db.get(args.id);
  },
});
```

### Why Use Id<'table'>?

1. **Type safety** - Prevents mixing IDs from different tables
2. **Autocomplete** - Better IDE support
3. **Runtime validation** - Convex validates ID format and table match

```typescript
// Type error - can't pass user ID to item query
const userId: Id<"users"> = "...";
await ctx.db.get(userId);  // Type error if expecting Id<"items">
```

## String Literals with as const

Use `as const` for string literals in discriminated unions:

```typescript
// Validator
const itemValidator = v.union(
  v.object({ type: v.literal("task"), completed: v.boolean() }),
  v.object({ type: v.literal("note"), content: v.string() }),
);

// TypeScript type
type Item =
  | { type: "task" as const; completed: boolean }
  | { type: "note" as const; content: string };

// Usage
const item: Item = {
  type: "task" as const,
  completed: false,
};

// Pattern matching
function handleItem(item: Item) {
  if (item.type === "task") {
    console.log(item.completed);  // TypeScript knows this is a task
  } else {
    console.log(item.content);    // TypeScript knows this is a note
  }
}
```

### Why as const?

Without `as const`, TypeScript infers `type: string` instead of `type: "task"`:

```typescript
// ❌ INCORRECT - type is inferred as string
const item = { type: "task", completed: false };
// item.type has type: string

// ✅ CORRECT - type is inferred as "task"
const item = { type: "task" as const, completed: false };
// item.type has type: "task"
```

## Arrays

Define arrays with explicit type annotation:

```typescript
// ✅ CORRECT - Explicit type
const tags: Array<string> = ["typescript", "convex", "react"];

const items: Array<{ id: Id<"items">; name: string }> = [
  { id: itemId1, name: "Item 1" },
  { id: itemId2, name: "Item 2" },
];

// ❌ AVOID - Implicit type (less clear)
const tags = ["typescript", "convex", "react"];
```

### Why Explicit Array Types?

1. **Clarity** - Immediately clear what type of data the array holds
2. **Type errors** - Catch mistakes when adding items
3. **Consistency** - Matches Convex validator style

```typescript
const tags: Array<string> = ["one", "two"];
tags.push(123);  // Type error - number not assignable to string
```

## Records

Define records with explicit key and value types:

```typescript
// ✅ CORRECT - Explicit types
const settings: Record<string, boolean> = {
  darkMode: true,
  notifications: false,
  analytics: true,
};

const userScores: Record<Id<"users">, number> = {
  [userId1]: 100,
  [userId2]: 250,
};

// ❌ AVOID - Implicit type
const settings = {
  darkMode: true,
  notifications: false,
};
```

### Record vs Object

Use `Record` for dynamic keys, `object` for fixed keys:

```typescript
// Dynamic keys - use Record
const metadata: Record<string, any> = {};
metadata[dynamicKey] = value;

// Fixed keys - use object type
const config: { apiUrl: string; timeout: number } = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
};
```

## Node.js Built-ins

Add `@types/node` when using Node.js built-ins in actions:

```bash
npm install --save-dev @types/node
```

```typescript
"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import crypto from "crypto";  // Node.js built-in

export const hashPassword = action({
  args: { password: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    return crypto
      .createHash("sha256")
      .update(args.password)
      .digest("hex");
  },
});
```

## Type Inference from Schema

Convex automatically generates types from your schema:

```typescript
import { Doc } from "./_generated/dataModel";

// Type for a complete document
type Item = Doc<"items">;

// Use in function signatures
function processItem(item: Doc<"items">) {
  console.log(item._id);           // Id<"items">
  console.log(item._creationTime); // number
  console.log(item.name);          // string (from schema)
}
```

## Type Utilities

### Partial Document Updates

```typescript
// For patch operations
type ItemUpdate = Partial<Doc<"items">>;

async function updateItem(ctx: any, id: Id<"items">, update: ItemUpdate) {
  await ctx.db.patch(id, update);
}
```

### Omit System Fields

```typescript
// For insert operations
type NewItem = Omit<Doc<"items">, "_id" | "_creationTime">;

async function createItem(ctx: any, item: NewItem) {
  return await ctx.db.insert("items", item);
}
```

## Common Type Patterns

### Function Return Type

Infer return type from handler:

```typescript
export const getItem = query({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) return null;

    return {
      ...item,
      displayName: `${item.name} (#${item._id})`,
    };
  },
});

// Type is inferred: Doc<"items"> & { displayName: string } | null
type GetItemResult = Awaited<ReturnType<typeof getItem>>;
```

### Validator to Type

Convert validator to TypeScript type:

```typescript
import { Infer } from "convex/values";

const itemValidator = v.object({
  name: v.string(),
  tags: v.array(v.string()),
  metadata: v.record(v.string(), v.any()),
});

type Item = Infer<typeof itemValidator>;
// Equivalent to: { name: string; tags: string[]; metadata: Record<string, any> }
```

## Best Practices

1. **Use Id<'table'>** - Always use typed IDs instead of string
2. **Use as const** - For literal types in discriminated unions
3. **Explicit array types** - Use `Array<T>` syntax
4. **Explicit record types** - Use `Record<K, V>` syntax
5. **Add @types/node** - When using Node.js built-ins in actions
6. **Leverage generated types** - Use `Doc<>`, `Id<>` from `./_generated/dataModel`
7. **Type function returns** - Use `Awaited<ReturnType<>>` to extract return types
8. **Avoid any** - Use specific types or unknown when type is truly unknown

## Common Type Errors and Fixes

### Error: Type 'string' is not assignable to type 'Id<"items">'

```typescript
// ❌ Problem
const id: string = "...";
await ctx.db.get(id);

// ✅ Fix
const id: Id<"items"> = "..." as Id<"items">;
await ctx.db.get(id);

// ✅ Better - Use validator
args: { id: v.id("items") }  // Convex validates and types correctly
```

### Error: Circular reference in type annotation

```typescript
// ❌ Problem - calling same-file function without return type
export const helper = query({
  handler: async (ctx) => { /* ... */ },
});

export const main = query({
  handler: async (ctx) => {
    return await ctx.runQuery(internal.items.helper);  // Circular reference error
  },
});

// ✅ Fix - add explicit return type
export const helper = query({
  handler: async (ctx): Promise<string> => { /* ... */ },
});
```

### Error: Type inferred as string instead of literal

```typescript
// ❌ Problem
const item = { type: "task", completed: false };
// item.type is string, not "task"

// ✅ Fix - use as const
const item = { type: "task" as const, completed: false };
// item.type is "task"
```
