# Anti-Patterns: Before & After

Extended examples for the Tastik codebase. Each section shows the problematic pattern, why it's wrong, and the correct fix.

---

## Table of Contents

1. [useState + useEffect for data fetching](#1-usestate--useeffect-for-data-fetching)
2. [Raw mutation in component](#2-raw-mutation-in-component)
3. [Returning full useQuery result from hook](#3-returning-full-usequery-result-from-hook)
4. [Missing queryOptions export (breaks SSR loaders)](#4-missing-queryoptions-export-breaks-ssr-loaders)
5. [Business logic inside component](#5-business-logic-inside-component)
6. [Prop drilling > 2 levels](#6-prop-drilling--2-levels)
7. [Manual Convex type duplication](#7-manual-convex-type-duplication)
8. [Over-memoization](#8-over-memoization)
9. [Under-memoization (missing stable references)](#9-under-memoization-missing-stable-references)
10. [Unindexed Convex queries](#10-unindexed-convex-queries)
11. [window.location for navigation](#11-windowlocation-for-navigation)
12. [Repeated error handling pattern](#12-repeated-error-handling-pattern)
13. [Inline magic values](#13-inline-magic-values)
14. [Long component violating SRP](#14-long-component-violating-srp)
15. [Missing data-testid on interactive elements](#15-missing-data-testid-on-interactive-elements)

---

## 1. useState + useEffect for data fetching

**Bad**
```tsx
function MyComponent({ listId }: { listId: Id<"lists"> }) {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    // This won't work with Convex anyway — Convex is WebSocket-based,
    // not REST. But even for non-Convex data this pattern is wrong.
    fetchItems(listId).then(setItems);
  }, [listId]);

  if (!items) return <Skeleton />;
  return <ItemList items={items} />;
}
```

**Why it's wrong**: Convex delivers data via WebSocket subscriptions, not one-time fetches. `useEffect` fetches miss real-time updates, don't integrate with TanStack Query cache, and create race conditions.

**Good**
```ts
// src/hooks/queries/use-list-items.ts
export function listItemsQueryOptions(listId: Id<"lists">, includeCompleted: boolean) {
  return convexQuery(api.items.getListItems, { listId, includeCompleted });
}

export function useListItems(listId: Id<"lists">, includeCompleted: boolean) {
  const { data } = useQuery(listItemsQueryOptions(listId, includeCompleted));
  return data;
}
```
```tsx
function MyComponent({ listId }: { listId: Id<"lists"> }) {
  const items = useListItems(listId, false);
  if (!items) return <Skeleton />;
  return <ItemList items={items} />;
}
```

---

## 2. Raw mutation in component

**Bad**
```tsx
function DeleteButton({ itemId }: { itemId: Id<"items"> }) {
  const deleteItem = useMutation(api.items.deleteItem);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteItem({ itemId });
      toast.success("Item deleted");
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  return <button disabled={loading} onClick={handleDelete}>Delete</button>;
}
```

**Why it's wrong**: Business logic (loading state, error handling, toast) is in the component. Untestable without rendering. Pattern is not reusable.

**Good**
```ts
// src/hooks/actions/use-delete-item.ts
export function useDeleteItem() {
  const mutation = useMutation(api.items.deleteItem);
  const handleMutationError = useHandleMutationError();
  const { runAction, isPending } = useManagedAction();

  const deleteItem = (itemId: Id<"items">) =>
    runAction(() => mutation({ itemId }), {
      onSuccess: () => toast.success("Item deleted"),
      onError: (err) => handleMutationError(err, "Failed to delete item"),
    });

  return { deleteItem, isPending };
}
```
```tsx
function DeleteButton({ itemId }: { itemId: Id<"items"> }) {
  const { deleteItem, isPending } = useDeleteItem();
  return (
    <button disabled={isPending} onClick={() => deleteItem(itemId)}>
      Delete
    </button>
  );
}
```

---

## 3. Returning full useQuery result from hook

**Bad**
```ts
export function useList(listId: Id<"lists">) {
  return useQuery(listQueryOptions(listId)); // Returns { data, isPending, error, ... }
}
```

**Why it's wrong**: Callers now depend on the internal shape of `useQuery`. Tests must mock the full result object. Refactoring the data source requires changing all callers.

**Good**
```ts
export function useList(listId: Id<"lists">) {
  const { data } = useQuery(listQueryOptions(listId));
  return data; // Only the data the UI needs
}
```

---

## 4. Missing queryOptions export (breaks SSR loaders)

**Bad**
```ts
// No queryOptions export — can't be used in route loaders
export function useList(listId: Id<"lists">) {
  const { data } = useQuery(
    convexQuery(api.lists.getList, { listId })
  );
  return data;
}
```

**Why it's wrong**: Route loaders need `queryOptions` to call `context.queryClient.ensureQueryData(...)`. Without it, data isn't prefetched and the page has a loading flash.

**Good**
```ts
export function listQueryOptions(listId: Id<"lists"> | undefined) {
  return convexQuery(api.lists.getList, listId ? { listId } : "skip");
}

export function useList(listId: Id<"lists"> | undefined) {
  const { data } = useQuery(listQueryOptions(listId));
  return data;
}
```

---

## 5. Business logic inside component

**Bad**
```tsx
function ListCard({ list }: { list: List }) {
  // Derived state computed in component
  const isOwner = list.ownerId === currentUser?.id;
  const displayIcon = list.icon ?? "📝";
  const formattedType = list.type.charAt(0).toUpperCase() + list.type.slice(1);

  return (
    <Card>
      <CardTitle>{displayIcon} {list.name}</CardTitle>
      <CardDescription>{isOwner ? "Owned by you" : "Shared with you"}</CardDescription>
      <Badge>{formattedType}</Badge>
    </Card>
  );
}
```

**Why it's wrong**: Formatting logic (`formatListType`, `getListIcon`) isn't reusable. Can't test it without rendering. Clutters the component.

**Good**
```tsx
// src/lib/utils/format-list-type.ts (already exists)
// src/lib/utils/get-list-icon.ts (already exists)

function ListCard({ list }: { list: List }) {
  return (
    <Card>
      <CardTitle>{getListIcon(list.icon)} {list.name}</CardTitle>
      <CardDescription>{list.isOwner ? "Owned by you" : "Shared with you"}</CardDescription>
      <Badge>{formatListType(list.type)}</Badge>
    </Card>
  );
}
```

---

## 6. Prop drilling > 2 levels

**Bad**
```tsx
// Route → Page → List → ListHeader → EditButton needs `onEdit`
// Passing `onEdit` down 4 levels
<Page onEdit={onEdit}>
  <ListContainer onEdit={onEdit}>
    <ListHeader onEdit={onEdit}>
      <EditButton onClick={onEdit} />
    </ListHeader>
  </ListContainer>
</Page>
```

**Why it's wrong**: Every intermediate component is coupled to a prop it doesn't use. Adding a new consumer means threading the prop through every level.

**Good** — Use composition or a context-backed hook:
```ts
// src/hooks/ui/use-list-actions.ts
export function useListActions(listId: Id<"lists">) {
  const { updateList } = useUpdateList();
  const { deleteList } = useDeleteList();
  // ...
  return { onEdit, onDelete, onDuplicate };
}
```
```tsx
// Consumer calls the hook directly — no prop drilling
function EditButton({ listId }: { listId: Id<"lists"> }) {
  const { onEdit } = useListActions(listId);
  return <button onClick={onEdit}>Edit</button>;
}
```

---

## 7. Manual Convex type duplication

**Bad**
```ts
// src/lib/types/list-type.ts
type ListType = "simple" | "calculator" | "stepper" | "kanban" | "multi";
```

**Why it's wrong**: If `convex/schema.ts` adds a new list type, you must update two places. Types drift out of sync.

**Good**
```ts
// src/lib/types/list-type.ts
import type { Infer } from "convex/values";
import { listTypeValidator } from "../../../convex/schema";

export type ListType = Infer<typeof listTypeValidator>;
```

---

## 8. Over-memoization

**Bad**
```tsx
function ItemCount({ items }: { items: Item[] }) {
  // useMemo on a primitive derivation — the array.length is O(1)
  const count = useMemo(() => items.length, [items]);
  // useMemo on an object created in render — pointless, object is fresh every render anyway
  const style = useMemo(() => ({ color: "red" }), []);

  return <span style={style}>{count} items</span>;
}
```

**Why it's wrong**: `useMemo` has a cost (memory + comparison). Memoizing cheap operations adds overhead without benefit. Memoizing inline objects with no unstable deps is no-op.

**Good**
```tsx
const LABEL_STYLE = { color: "red" }; // stable reference outside component

function ItemCount({ items }: { items: Item[] }) {
  return <span style={LABEL_STYLE}>{items.length} items</span>;
}
```

---

## 9. Under-memoization (missing stable references)

**Bad**
```tsx
function ItemList({ listId }: { listId: Id<"lists"> }) {
  // New function reference every render — child with React.memo will re-render
  const handleDelete = (itemId: Id<"items">) => deleteItem(itemId);

  return items.map(item => (
    <ItemRow key={item._id} onDelete={handleDelete} />
  ));
}
```

**Why it's wrong**: `ItemRow` is wrapped in `React.memo` to prevent unnecessary re-renders, but `handleDelete` is recreated every render, making the memo ineffective.

**Good**
```tsx
function ItemList({ listId }: { listId: Id<"lists"> }) {
  const { deleteItem } = useDeleteItem();
  // useCallback only if ItemRow is React.memo'd and perf is measured to matter
  const handleDelete = useCallback((itemId: Id<"items">) => deleteItem(itemId), [deleteItem]);

  return items.map(item => (
    <ItemRow key={item._id} onDelete={handleDelete} />
  ));
}
```

---

## 10. Unindexed Convex queries

**Bad**
```ts
// convex/items.ts
export const getItemsByTag = query({
  args: { tagId: v.id("listTags") },
  handler: async (ctx, { tagId }) => {
    // Full table scan — O(n) on entire items table
    return ctx.db.query("items").filter(q => q.eq(q.field("tagId"), tagId)).collect();
  },
});
```

**Why it's wrong**: Full table scans are forbidden in Convex production. Performance degrades linearly with data size. Convex has strict limits on query execution time.

**Good** — ensure the index exists in schema and use it:
```ts
// In convex/schema.ts, items table already has:
// .index("by_list_and_tag", ["listId", "tagId"])

export const getItemsByTag = query({
  handler: async (ctx, { listId, tagId }) => {
    return ctx.db
      .query("items")
      .withIndex("by_list_and_tag", q => q.eq("listId", listId).eq("tagId", tagId))
      .collect();
  },
});
```

---

## 11. window.location for navigation

**Bad**
```tsx
function handleSuccess(listId: string) {
  window.location.href = `/lists/${listId}`; // Full page reload, loses state
}
```

**Why it's wrong**: Full page reload — loses React state, TanStack Query cache, and animation continuity. Bypasses TanStack Router's client-side navigation.

**Good**
```tsx
const navigate = useNavigate();

function handleSuccess(listId: Id<"lists">) {
  navigate({ to: "/lists/$listId", params: { listId } });
}
```

---

## 12. Repeated error handling pattern

**Bad**
```ts
// Repeated in use-create-list.ts, use-update-list.ts, use-delete-list.ts, ...
try {
  await mutation({ ... });
} catch (error) {
  if (error instanceof ConvexError) {
    toast.error(error.data as string);
  } else {
    toast.error("An unexpected error occurred");
    Sentry.captureException(error);
  }
}
```

**Why it's wrong**: Same try/catch block copy-pasted across every action hook. If the error handling strategy changes, you update N files.

**Good** — already extracted in Tastik:
```ts
// src/hooks/actions/use-handle-mutation-error.ts (exists)
const handleMutationError = useHandleMutationError();

// use-create-list.ts
onError: (error) => handleMutationError(error, "Failed to create list"),
```

Look for any hooks NOT using `useHandleMutationError` and migrate them.

---

## 13. Inline magic values

**Bad**
```tsx
// Scattered across multiple components
<div className="max-w-[768px]">
<Skeleton className="h-[32px] w-[128px]" />
const MAX_NAME_LENGTH = 100; // defined inline in 3 different files
```

**Why it's wrong**: Arbitrary Tailwind values break the design system. Duplicate constants drift out of sync.

**Good**
```ts
// src/lib/constants/limits.ts (or similar)
export const MAX_LIST_NAME_LENGTH = 100;
export const MAX_ITEM_NAME_LENGTH = 200;
```
```tsx
// Use design tokens for layout
<div className="max-w-3xl">  {/* Tailwind scale, not arbitrary px */}
<Skeleton className="h-8 w-32" />
```

---

## 14. Long component violating SRP

**Bad**
```tsx
// 350-line component doing: data fetching, filtering, sorting, rendering,
// item editing, delete confirmation, keyboard shortcuts, drag-and-drop
export function ListView() {
  const items = useQuery(...);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredItems = items?.filter(...).sort(...);
  // ... 300 more lines
}
```

**Why it's wrong**: Impossible to test in isolation. Any change risks breaking unrelated behavior. Cognitive load is high for new contributors.

**Good** — decompose:
```
ListView (orchestrates, ~80 lines)
  useListItems() — data
  useListFilter() — filter/sort state + derived filtered list
  ItemList — renders the list
    ItemRow — single item
      ItemActionsMenu — actions
  EditItemDialog — edit form
  DeleteItemConfirm — delete confirmation
```

---

## 15. Missing data-testid on interactive elements

**Bad**
```tsx
<button onClick={handleCreate}>Create List</button>
<input placeholder="Search..." onChange={handleSearch} />
<div role="button" onClick={handleSelect}>Select</div>
```

**Why it's wrong**: Tests must use brittle text selectors or role queries that break on copy changes. Playwright E2E tests can't reliably target elements.

**Good**
```tsx
<button data-testid="create-list-button" onClick={handleCreate}>Create List</button>
<input data-testid="search-input" placeholder="Search..." onChange={handleSearch} />
<div role="button" data-testid="select-button" onClick={handleSelect}>Select</div>
```

Convention: `data-testid` values use kebab-case, descriptive names. For lists of items, include the ID: `data-testid={`item-${item._id}`}`.
