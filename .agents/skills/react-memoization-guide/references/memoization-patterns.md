# React Memoization Patterns

## Core Principles

### Re-renders are Normal

A component re-renders when:
- Its state changes
- Its props change
- Its parent renders again

**Key insight**: A re-render means React runs your component function again. That's all.

- It does NOT mean the DOM updates
- It does NOT mean something is slow
- Most re-renders are cheap and expected

**The goal is NOT to stop re-renders.** The goal is to:
1. Avoid expensive work
2. Avoid useless re-renders in expensive children

## useMemo

### What It Does

`useMemo` keeps a value between renders. The value can be anything: number, string, array, object.

### What It Does NOT Do

- Does NOT reduce renders - your component still re-renders when state or props change
- Only helps in two specific cases

### When useMemo Actually Helps

1. **The calculation is expensive**
2. **You need reference stability** so other components can skip work (React.memo, effect dependencies)

### Common Misuse

❌ Memoizing cheap work:

```tsx
const fullName = useMemo(
  () => `${user.firstName} ${user.lastName}`,
  [user]
);
```

✅ Better:

```tsx
const fullName = `${user.firstName} ${user.lastName}`;
```

Small `.map()` calls with simple UI - memoizing is often just noise.

### Valid Use Case: Reference Stability

❌ This pattern fails:

```tsx
const Child = React.memo(function Child({
  options,
}: {
  options: { compact: boolean };
}) {
  return <div>{options.compact ? "compact" : "spacious"}</div>;
});

export function Parent() {
  const [count, setCount] = useState(0);
  const options = { compact: true }; // new object every render

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>
        {count}
      </button>
      <Child options={options} />
    </>
  );
}
```

Child is memoized but still re-renders because `options` is a new object every render.

✅ Fix with useMemo:

```tsx
const options = useMemo(() => ({ compact: true }), []);
```

Now the reference is stable and React.memo can skip renders.

## useCallback

### What It Does

`useCallback` keeps the same function reference between renders until dependencies change.

### What It Does NOT Do

- Does NOT prevent re-renders - the component still runs again as usual
- Only matters when React or your code checks if a function changed to decide if other work should run

### Common Misuse

❌ Unnecessary useCallback:

```tsx
const onClick = useCallback(() => setOpen(true), []);
```

If used on a button, this changes nothing and makes code harder to read.

❌ Frozen dependencies causing bugs:

```tsx
const onSave = useCallback(() => {
  api.save(formState);
}, []); // WRONG - captures first formState forever
```

Later formState updates are ignored.

**Red flag**: If you need an empty dependency array, the code structure is often wrong.

### When useCallback is Actually Useful

#### Case 1: Passing to Memoized Children

Only when children are expensive enough that avoiding re-renders matters:

```tsx
const ComplexHeavyComponent = React.memo(
  function ComplexHeavyComponent({ onAction }: { onAction: () => void }) {
    // heavy layout work, large lists, expensive calculations
    return <div onClick={onAction}>Heavy content</div>;
  }
);

function Parent() {
  const [count, setCount] = useState(0);

  const onAction = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  return <ComplexHeavyComponent onAction={onAction} />;
}
```

If this were a simple button instead, the benefit would be negligible.

#### Case 2: Effect Dependencies

When a callback is part of an effect dependency:

```tsx
function Search({ query }: { query: string }) {
  const fetchResults = useCallback(async () => {
    const res = await fetch(
      `/api/search?q=${encodeURIComponent(query)}`
    );
    return res.json();
  }, [query]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return null;
}
```

The callback groups logic and dependencies in one place. The effect only re-runs when query actually changes.

## Code Review Heuristic

When reviewing `useMemo` or `useCallback`:

**Rare but good**: Usage that avoids expensive work or prevents reference changes causing extra work

**Common problem**: Useless guardrail that:
- Adds mental overhead
- Requires maintaining dependency arrays
- Sometimes hides bugs when used carelessly

## Decision Framework

**Remember: Clarity comes first. Optimize only when you justify the need.**

Ask these questions:

1. **Is this calculation/work expensive?** If no, skip memoization
2. **Does reference stability matter here?** (React.memo, effect deps) If no, skip memoization
3. **Would removing this make the code clearer?** If yes, remove it
4. **Are the dependencies correct?** If uncertain, it's probably wrong
