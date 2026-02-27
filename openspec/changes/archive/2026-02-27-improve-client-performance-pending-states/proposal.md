## Why

The app freezes for 300–800ms during client-side navigation (e.g. list → list) because TanStack Router only shows the pending component after loaders take **longer than 1 second**. Fast navigations complete before the threshold, so users see no feedback. Initial load, /home, and first list load feel slow; the LoadingState spinner appears only when loaders exceed ~1s. Users perceive unresponsiveness even when raw performance is adequate. Improving pending states ensures immediate visual feedback and a perceived responsive UI.

## What Changes

- Lower `defaultPendingMs` so pending UI shows during fast navigations (e.g. 100–200ms instead of 1000ms)
- Replace default pending component with layout-specific **skeletons** (skeleton first, spinner for longer waits)
- Add `_protected` and `lists.$listId` route-level pending components that mirror their destination layouts
- Set `defaultPendingMinMs` appropriately to avoid jarring skeleton flash when data arrives quickly
- **Cache auth state** (not Convex queries) to reduce blocking on client-side navigation:
  - Cache `fetchAuthState` result via React Query (staleTime ~60s) so client-side nav skips server roundtrip when fresh
  - **Do not add `staleTime` to Convex queries** – Convex uses WebSocket subscriptions; data is pushed in real time and is never stale. Use `gcTime` (default 5 min) for back-navigation cache; the subscription stays active after unmount
  - Document Better Auth `cookieCache` (already added in `convex/auth.ts`) and consider extending TTL if appropriate

## Capabilities

### New Capabilities

- `navigation-pending-states`: Immediate and consistent pending/loading feedback during TanStack Router navigation (skeleton-first, layout-matching, lower pending threshold)
- `loader-caching`: Cache auth state (fetchAuthState) to reduce server roundtrips; **avoid staleTime on Convex queries** (WebSocket pushes real-time data; gcTime governs subscription lifetime)

### Modified Capabilities

(Leave empty - no existing specs whose requirements are changing)

## Goals

- Immediate visual feedback (skeleton) during any navigation that takes >100–200ms
- Skeleton-first pending UI that matches destination layout (dashboard shell, list detail shell)
- Spinner as fallback for unusually long loads
- Perceived responsiveness for list-to-list and other client-side navigations
- Fewer server/Convex roundtrips on client-side navigation via caching (auth state, loader queries)
- SSR/streaming optimizations for initial page load
- Convex function logic or backend performance improvements where applicable
- Optimize or redesign loader/beforeLoad structure (timing, UI feedback, cache TTLs, and structural improvements)

## Non-Goals

None—scope includes pending states, caching, and performance optimizations.

## Success Criteria

- No visible freeze when navigating list A → list B; skeleton appears within ~200ms
- Pending UI matches layout shape (skeleton, not centered spinner) for protected and list routes
- Existing LoadingState remains for non-layout contexts (e.g. error boundaries, Suspense fallbacks)
- Client-side navigation within ~60s of previous load uses cached auth state (no fetchAuthState server call)
- Convex subscriptions remain active per gcTime (default 5 min) after unmount; back-navigation reuses existing subscription when within gcTime

## Impact

- `src/router.tsx` – `defaultPendingMs`, `defaultPendingMinMs`, `defaultPendingComponent`
- `src/routes/__root.tsx` – use cached auth state in beforeLoad (authStateQueryOptions)
- `src/routes/_protected.tsx` – `pendingComponent` (dashboard skeleton)
- `src/routes/_protected/lists.$listId.tsx` – `pendingComponent` (list detail skeleton)
- New: `src/components/common/pending-skeletons.tsx` – layout-matching skeletons
- New: `src/hooks/queries/use-auth-state.ts` (or similar) – authStateQueryOptions wrapping fetchAuthState with staleTime
- Do **not** add staleTime to Convex query options; rely on Convex WebSocket + gcTime for back-navigation cache
- `convex/auth.ts` – already has `cookieCache`; verify/fine-tune if needed
