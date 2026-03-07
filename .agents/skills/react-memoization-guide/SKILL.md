---
name: react-memoization-guide
description: Guidelines for proper React memoization (useMemo, useCallback, React.memo) usage. Use when writing React components, reviewing code with useMemo/useCallback, refactoring performance optimizations, or when asked about React performance patterns. Helps identify common misuse patterns and apply the "clarity first, optimize when justified" principle.
---

# React Memoization Guide

Apply these guidelines when working with `useMemo`, `useCallback`, and `React.memo` in React code.

## Core Principle

**Clarity comes first. Optimize only when you justify the need.**

When reviewing or writing code with memoization hooks, default to questioning whether they're necessary.

## Decision Framework

Before adding memoization, ask:

1. **Is this calculation/work expensive?** If no → skip memoization
2. **Does reference stability matter here?** (React.memo, effect deps) If no → skip memoization
3. **Would removing this make code clearer?** If yes → remove it
4. **Are the dependencies correct?** If uncertain → it's probably wrong

## Quick Reference

### useMemo

**Only use when:**
- The calculation is genuinely expensive (not string concatenation or small maps)
- Reference stability is needed for `React.memo` optimization
- The value is a dependency in `useEffect` or other hooks

**Common misuse:**
```tsx
// ❌ Memoizing cheap work
const fullName = useMemo(
  () => `${user.firstName} ${user.lastName}`,
  [user]
);

// ✅ Just compute it
const fullName = `${user.firstName} ${user.lastName}`;
```

### useCallback

**Only use when:**
- Passing callbacks to memoized children (and children are actually expensive)
- The function is a dependency in `useEffect`

**Common misuse:**
```tsx
// ❌ Unnecessary for simple button clicks
const onClick = useCallback(() => setOpen(true), []);

// ❌ Frozen dependencies cause bugs
const onSave = useCallback(() => {
  api.save(formState); // captures first formState forever
}, []);

// ✅ Correct dependencies or don't use it
const onSave = () => api.save(formState);
```

**Red flag**: Empty dependency array `[]` often signals incorrect code structure.

### React.memo

Only wrap components that:
- Are expensive to render (complex layouts, large lists, heavy calculations)
- Receive stable props (or props wrapped in useMemo/useCallback)

Wrapping cheap components adds overhead without benefit.

## Detailed Patterns

For comprehensive examples and anti-patterns, see [references/memoization-patterns.md](references/memoization-patterns.md).

## Implementation Approach

When writing React code:

1. **Start without memoization** - write clear, straightforward code
2. **Profile if needed** - only if there's an actual performance problem
3. **Add targeted memoization** - only where profiling shows benefit
4. **Document why** - if memoization stays, add a comment explaining the justification

When reviewing code:

1. **Question every useMemo/useCallback** - assume it's not needed until proven otherwise
2. **Check dependencies** - ensure they're correct and complete
3. **Verify benefit** - does the memoization actually prevent expensive work?
4. **Suggest removal** - if the benefit is unclear, remove it
