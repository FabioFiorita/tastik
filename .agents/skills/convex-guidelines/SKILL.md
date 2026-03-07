---
name: convex-guidelines
description: Comprehensive Convex framework guidelines covering function syntax, validators, queries, mutations, actions, schema design, TypeScript patterns, pagination, and file storage. Use when writing or modifying Convex functions, defining schemas, or working with the Convex backend.
---

# Convex Guidelines

Comprehensive reference for working with the Convex backend framework.

## Quick Start

Convex functions use a specific syntax and conventions:

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getItem = query({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createItem = mutation({
  args: { name: v.string(), description: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("items", args);
    return null;
  },
});
```

## Core Principles

1. **Always include argument validators** - Every function must validate its inputs
2. **Use indexes, not filters** - Define indexes for all queries
3. **Don't return from mutations** - Rely on reactive queries
4. **Use proper TypeScript types** - `Id<'table'>`, `as const`, typed arrays/records

## Reference Documentation

For detailed information on specific topics, see:

- **[Function Syntax](references/function-syntax.md)** - Function registration, public vs internal, HTTP endpoints
- **[Validators](references/validators.md)** - Argument/return validators, v.null(), v.int64(), v.record()
- **[Queries & Mutations](references/queries-mutations.md)** - Query patterns, mutation patterns, reactive updates
- **[Schema & Indexes](references/schema-indexes.md)** - Schema definition, index naming, field order
- **[TypeScript](references/typescript.md)** - Id<'table'>, as const, Array<T>, Record<K,V>
- **[Scheduling & Storage](references/scheduling-storage.md)** - Cron patterns, file storage API

## Common Patterns

### Calling Other Functions

```typescript
import { api, internal } from "./_generated/api";

// In a mutation, call a query
const data = await ctx.runQuery(api.items.getItem, { id });

// In an action, call an internal mutation
const result = await ctx.runMutation(internal.items.updateInternal, { id });
```

### Pagination

```typescript
import { paginationOptsValidator } from "convex/server";

export const listItems = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

### Using Indexes

```typescript
// Define in schema.ts
defineTable("items")
  .index("by_user_and_created", ["userId", "_creationTime"])

// Use in query
export const getUserItems = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .withIndex("by_user_and_created", (q) => q.eq("userId", args.userId))
      .collect();
  },
});
```

## When to Use This Skill

Use this skill when:
- Writing new Convex functions (queries, mutations, actions)
- Defining or modifying schemas
- Working with indexes or pagination
- Handling file storage or scheduling cron jobs
- Debugging TypeScript type errors in Convex code
- Unsure about validator syntax or patterns
