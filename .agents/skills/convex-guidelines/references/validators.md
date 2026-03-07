# Validators and Returns

## Argument Validators

**Every function must include argument validators**, even if empty:

```typescript
export const noArgs = query({
  args: {}, // Required even with no arguments
  handler: async (ctx) => {
    // ...
  },
});
```

## Return Validators

Include `returns` validator based on function type and return shape:

### When to Include Returns

1. **Mutations/actions/internal functions returning nothing** - Use `v.null()`:

```typescript
export const createItem = mutation({
  args: { name: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("items", args);
    return null; // Must return null, not undefined
  },
});
```

2. **Functions that substantially change shape** - Include validator:

```typescript
export const getItemSummary = query({
  args: { id: v.id("items") },
  returns: v.object({
    id: v.id("items"),
    summary: v.string(),
    count: v.number(),
  }),
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) return null;

    return {
      id: item._id,
      summary: `${item.name}: ${item.description}`,
      count: item.items?.length ?? 0,
    };
  },
});
```

### When to Omit Returns

For queries returning raw documents or trivial transforms (e.g., spread + one field), omit to avoid duplicating schema:

```typescript
export const getItem = query({
  args: { id: v.id("items") },
  // No returns - shape matches schema
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) return null;

    return {
      ...item,
      isOwner: item.userId === (await ctx.auth.getUserIdentity())?.subject,
    };
  },
});
```

## Validator Types

### Primitives

```typescript
v.string()
v.number()
v.boolean()
v.int64()  // Use instead of deprecated v.bigint()
v.null()   // For null values (never use undefined)
v.bytes()
```

### IDs

```typescript
v.id("tableName")  // Document ID for specific table
```

### Objects

```typescript
v.object({
  name: v.string(),
  age: v.number(),
  tags: v.array(v.string()),
})
```

### Arrays

```typescript
v.array(v.string())
v.array(v.object({ id: v.id("items"), name: v.string() }))
```

### Optional Fields

```typescript
v.object({
  required: v.string(),
  optional: v.optional(v.string()),
})
```

### Unions

```typescript
v.union(
  v.object({ type: v.literal("simple"), value: v.string() }),
  v.object({ type: v.literal("complex"), data: v.array(v.number()) }),
)
```

### Records

Use `v.record()` for key-value objects:

```typescript
v.record(v.string(), v.number())  // { [key: string]: number }
```

**Note:** `v.map()` and `v.set()` are not supported. Use `v.record()` and `v.array()` instead.

### Any

```typescript
v.any()  // Use sparingly - loses type safety
```

## Common Patterns

### Nullable Fields

```typescript
// For optional fields that can be null
v.union(v.string(), v.null())

// Or using optional
v.optional(v.string())
```

### Discriminated Unions

Use `v.literal()` with `as const` in TypeScript:

```typescript
// Validator
args: {
  item: v.union(
    v.object({ type: v.literal("task"), completed: v.boolean() }),
    v.object({ type: v.literal("note"), content: v.string() }),
  ),
}

// TypeScript usage
type Item =
  | { type: "task" as const; completed: boolean }
  | { type: "note" as const; content: string };
```

### Nested Objects

```typescript
v.object({
  user: v.object({
    id: v.id("users"),
    profile: v.object({
      name: v.string(),
      avatar: v.optional(v.string()),
    }),
  }),
  metadata: v.record(v.string(), v.any()),
})
```

## Deprecated Validators

### ❌ v.bigint()

Use `v.int64()` instead:

```typescript
// ❌ DEPRECATED
args: { timestamp: v.bigint() }

// ✅ CORRECT
args: { timestamp: v.int64() }
```

## Validator Best Practices

1. **Always validate** - Never skip argument validators
2. **Use v.null()** - Never use `undefined`, always `v.null()` for null values
3. **Return null from mutations** - Include `returns: v.null()` and return `null`
4. **Use specific types** - Prefer `v.id("table")` over `v.string()` for IDs
5. **Document complex validators** - Add comments for unions and nested structures
6. **Match schema types** - Ensure validators align with schema definitions
