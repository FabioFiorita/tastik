# Schema and Indexes

## Schema Definition

Define schema in `convex/schema.ts` using imports from `convex/server`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  items: defineTable({
    name: v.string(),
    description: v.string(),
    userId: v.id("users"),
    completed: v.boolean(),
    tags: v.array(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_completed", ["userId", "completed"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["userId", "completed"],
    }),

  users: defineTable({
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
  })
    .index("by_email", ["email"]),
});
```

## System Fields

All documents automatically have:

- **`_id`** - Unique document identifier (`Id<"tableName">`)
- **`_creationTime`** - Timestamp when document was created (number)

These fields don't need to be defined in schema but are always available:

```typescript
const item = await ctx.db.get(itemId);
console.log(item._id);           // Id<"items">
console.log(item._creationTime); // number (milliseconds since epoch)
```

## Indexes

### Index Naming

Index names must include all indexed fields:

```typescript
// ✅ CORRECT - Name describes all fields
.index("by_user_and_completed", ["userId", "completed"])
.index("by_email", ["email"])
.index("by_created_at", ["_creationTime"])

// ❌ INCORRECT - Name doesn't match fields
.index("by_user", ["userId", "completed"])  // Name should include "completed"
```

### Index Field Order

**Field order matters.** Queries must use fields in the same order as the index:

```typescript
// Index definition
.index("by_user_and_created", ["userId", "_creationTime"])

// ✅ CORRECT - Matches index order
ctx.db
  .query("items")
  .withIndex("by_user_and_created", (q) =>
    q.eq("userId", userId).eq("_creationTime", timestamp)
  )

// ✅ CORRECT - Prefix matching (using only first field)
ctx.db
  .query("items")
  .withIndex("by_user_and_created", (q) => q.eq("userId", userId))

// ❌ INCORRECT - Wrong field order
ctx.db
  .query("items")
  .withIndex("by_user_and_created", (q) =>
    q.eq("_creationTime", timestamp).eq("userId", userId)
  )
```

### Common Index Patterns

#### Single Field

```typescript
.index("by_user", ["userId"])
.index("by_email", ["email"])
.index("by_status", ["status"])
```

#### Multiple Fields (Compound Index)

```typescript
// For filtering by user and sorting by creation time
.index("by_user_and_created", ["userId", "_creationTime"])

// For filtering by user and status
.index("by_user_and_status", ["userId", "status"])
```

#### Creation Time (Default Sort)

Many queries need to sort by creation time:

```typescript
.index("by_created", ["_creationTime"])
.index("by_user_and_created", ["userId", "_creationTime"])
```

### Search Indexes

For full-text search:

```typescript
.searchIndex("search_name", {
  searchField: "name",
  filterFields: ["userId", "completed"],
})
```

Usage:

```typescript
export const searchItems = query({
  args: { searchText: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .withSearchIndex("search_name", (q) =>
        q.search("name", args.searchText)
         .eq("userId", args.userId)
      )
      .collect();
  },
});
```

## Field Types in Schema

### Primitives

```typescript
name: v.string(),
age: v.number(),
active: v.boolean(),
timestamp: v.int64(),
data: v.bytes(),
```

### References (IDs)

```typescript
userId: v.id("users"),        // Reference to users table
parentId: v.id("items"),      // Self-reference
```

### Optional Fields

```typescript
description: v.optional(v.string()),
metadata: v.optional(v.record(v.string(), v.any())),
```

### Arrays

```typescript
tags: v.array(v.string()),
items: v.array(v.id("items")),
coordinates: v.array(v.number()),
```

### Objects

```typescript
profile: v.object({
  name: v.string(),
  avatar: v.optional(v.string()),
  settings: v.record(v.string(), v.boolean()),
}),
```

### Unions

```typescript
content: v.union(
  v.object({ type: v.literal("text"), text: v.string() }),
  v.object({ type: v.literal("image"), url: v.string() }),
),
```

### Records

```typescript
metadata: v.record(v.string(), v.any()),
settings: v.record(v.string(), v.boolean()),
```

## Schema Design Best Practices

### 1. Index for Common Queries

Create indexes for every query pattern:

```typescript
// If you query by userId frequently
.index("by_user", ["userId"])

// If you query by userId and need sorting
.index("by_user_and_created", ["userId", "_creationTime"])

// If you query by status
.index("by_status", ["status"])
```

### 2. Use Optional for Non-Required Fields

```typescript
defineTable({
  // Required
  name: v.string(),
  userId: v.id("users"),

  // Optional
  description: v.optional(v.string()),
  avatar: v.optional(v.string()),
})
```

### 3. Use Appropriate Types

```typescript
// ✅ CORRECT - Specific types
userId: v.id("users"),
timestamp: v.int64(),
tags: v.array(v.string()),

// ❌ AVOID - Too generic
userId: v.string(),        // Use v.id("users")
timestamp: v.number(),     // Use v.int64() for timestamps
tags: v.any(),            // Use v.array(v.string())
```

### 4. Consider Denormalization

For frequently accessed data, denormalize instead of joining:

```typescript
// Instead of just storing userId
items: defineTable({
  userId: v.id("users"),
  // Denormalize frequently accessed user data
  userName: v.string(),
  userEmail: v.string(),
})
```

### 5. Plan for Pagination

Include `_creationTime` in compound indexes for paginated queries:

```typescript
.index("by_user_and_created", ["userId", "_creationTime"])
```

## Example: Complete Table Definition

```typescript
items: defineTable({
  // Required fields
  name: v.string(),
  userId: v.id("users"),
  status: v.union(
    v.literal("pending"),
    v.literal("active"),
    v.literal("completed"),
  ),

  // Optional fields
  description: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  metadata: v.optional(v.record(v.string(), v.any())),

  // Timestamps (use system _creationTime when possible)
  completedAt: v.optional(v.int64()),
})
  // Common queries
  .index("by_user", ["userId"])
  .index("by_user_and_status", ["userId", "status"])
  .index("by_user_and_created", ["userId", "_creationTime"])
  .index("by_status", ["status"])

  // Search
  .searchIndex("search_name", {
    searchField: "name",
    filterFields: ["userId", "status"],
  }),
```

## Schema Migration

When modifying schema:

1. **Add optional fields** - Safe, no data migration needed
2. **Add indexes** - Safe, Convex builds them automatically
3. **Remove optional fields** - Safe if no code depends on them
4. **Change required fields** - Requires data migration via mutation
5. **Remove indexes** - Safe if no queries use them

For complex migrations, write a migration mutation to update existing data.
