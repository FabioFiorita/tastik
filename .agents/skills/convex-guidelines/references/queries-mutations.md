# Queries and Mutations

## Queries

Queries are read-only operations that are cached and reactive. They automatically re-run when data changes.

### Basic Query Pattern

```typescript
export const getItem = query({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

### Query Operations

#### Get by ID

```typescript
const item = await ctx.db.get(itemId);  // Returns document | null
```

#### Query with Index

**Always use indexes, never use filter:**

```typescript
// ✅ CORRECT - Use withIndex
export const getUserItems = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// ❌ INCORRECT - Don't use filter
export const getUserItems = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("userId"), args.userId))  // DON'T DO THIS
      .collect();
  },
});
```

#### Ordering

Default order is ascending `_creationTime`. Use `.order()` to change:

```typescript
// Most recent first
return await ctx.db
  .query("items")
  .order("desc")
  .collect();

// Oldest first (default)
return await ctx.db
  .query("items")
  .order("asc")
  .collect();
```

#### Getting Results

```typescript
// Single result (returns null if not found)
const item = await ctx.db
  .query("items")
  .withIndex("by_name", (q) => q.eq("name", "example"))
  .unique();

// All results as array
const items = await ctx.db
  .query("items")
  .collect();

// First N results
const items = await ctx.db
  .query("items")
  .take(10);

// Async iteration (memory efficient for large datasets)
for await (const item of ctx.db.query("items")) {
  // Process item
}
```

### Full Text Search

Use `withSearchIndex` for full text search:

```typescript
export const searchItems = query({
  args: { searchText: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .withSearchIndex("search_items", (q) =>
        q.search("name", args.searchText)
         .eq("userId", args.userId)
      )
      .collect();
  },
});
```

### Pagination

Use `paginationOptsValidator` and `.paginate()`:

```typescript
import { paginationOptsValidator } from "convex/server";

export const listItems = query({
  args: {
    userId: v.id("users"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Returns: { page: Doc[], isDone: boolean, continueCursor: string }
```

### Query Limitations

#### No Delete from Queries

Queries are read-only. Use `.collect()` then delete in a mutation:

```typescript
// ❌ INCORRECT - Can't delete in query
export const cleanupItems = query({
  handler: async (ctx) => {
    await ctx.db.query("items").delete();  // NOT SUPPORTED
  },
});

// ✅ CORRECT - Use mutation
export const cleanupItems = mutation({
  returns: v.null(),
  handler: async (ctx) => {
    const items = await ctx.db.query("items").collect();
    for (const item of items) {
      await ctx.db.delete(item._id);
    }
    return null;
  },
});
```

## Mutations

Mutations modify data and trigger reactive updates to queries.

### Basic Mutation Pattern

```typescript
export const createItem = mutation({
  args: { name: v.string(), description: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("items", args);
    return null;
  },
});
```

### Mutation Operations

#### Insert

```typescript
const id = await ctx.db.insert("items", {
  name: "New Item",
  userId: user.subject,
  createdAt: Date.now(),
});
// Returns: Id<"items">
```

#### Update (Patch)

Use `patch` for partial updates:

```typescript
await ctx.db.patch(itemId, {
  name: "Updated Name",
  updatedAt: Date.now(),
});
```

#### Replace

Use `replace` for full replacement:

```typescript
await ctx.db.replace(itemId, {
  name: "New Name",
  description: "New Description",
  userId: user.subject,
  // Must include ALL required fields
});
```

#### Delete

```typescript
await ctx.db.delete(itemId);
```

### Return Values from Mutations

**Do not return created/updated documents or IDs from mutations.** Rely on reactive queries instead:

```typescript
// ❌ INCORRECT - Don't return ID
export const createItem = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("items", args);
    return id;  // DON'T DO THIS
  },
});

// ✅ CORRECT - Return null, let queries react
export const createItem = mutation({
  args: { name: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("items", args);
    return null;
  },
});
```

### Why Not Return from Mutations?

1. **Reactive updates** - Queries automatically re-run when data changes
2. **Consistency** - Clients always get latest data from queries
3. **Simpler code** - No need to merge mutation results with query results
4. **Better performance** - Avoid duplicate data fetching

### Client Usage Pattern

```typescript
// Client code
const createItem = useMutation(api.items.createItem);
const items = useQuery(api.items.listItems);

async function handleCreate() {
  await createItem({ name: "New Item" });
  // items automatically updates via reactive query
}
```

## Common Patterns

### Get with Default

```typescript
const item = await ctx.db.get(itemId);
if (!item) {
  throw new Error("Item not found");
}
return item;
```

### Conditional Updates

```typescript
const item = await ctx.db.get(itemId);
if (!item) {
  throw new Error("Item not found");
}

if (item.userId !== user.subject) {
  throw new Error("Unauthorized");
}

await ctx.db.patch(itemId, { name: args.name });
```

### Batch Operations

```typescript
const items = await ctx.db
  .query("items")
  .withIndex("by_user", (q) => q.eq("userId", userId))
  .collect();

for (const item of items) {
  await ctx.db.delete(item._id);
}
```

## Best Practices

1. **Use indexes** - Always define and use indexes, never use filter
2. **Order explicitly** - Specify `.order()` when order matters
3. **Use .unique()** - When expecting single result
4. **Paginate large datasets** - Use pagination for lists
5. **Don't return from mutations** - Rely on reactive queries
6. **Use patch for updates** - Prefer patch over replace for partial updates
7. **Validate in mutations** - Check permissions and data validity
8. **Use async iteration** - For memory-efficient processing of large datasets
