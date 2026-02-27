## Context

TanStack Router shows `defaultPendingComponent` only when route loaders take **longer than `defaultPendingMs`** (default 1000ms). Fast navigations (300–800ms) complete before the threshold, so no pending UI appears—users see a freeze until the destination renders. The app uses:

- **Root beforeLoad**: `fetchAuthState()` (server fn) + `ensureQueryData(currentUser)` on every navigation
- **_protected loader**: `prefetchQuery(userLists)` + `prefetchQuery(userPreferences)` in parallel
- **lists.$listId loader**: `ensureQueryData(list)` then items, tags, collaborators

Current `defaultPendingComponent` is `LoadingState` (centered spinner). Protected layout wraps `<Outlet />` in `Suspense` with `LoadingState` fallback. The router config has `defaultPreload: "intent"` and `defaultPendingComponent: LoadingState`, but no `defaultPendingMs` override.

## Goals / Non-Goals

**Goals:**
- Lower pending threshold so skeletons appear within ~150–200ms of navigation start
- Layout-matching skeletons (dashboard shell, list detail shell) instead of a generic spinner
- Spinner only as fallback for unusually long loads (or kept for non-route Suspense)

**Non-Goals:** None

## Decisions

### 1. Lower `defaultPendingMs` to 150ms

**Choice:** Set `defaultPendingMs: 150` on the router so pending UI shows quickly during client-side navigation.

**Rationale:** Default 1000ms means most navigations (300–800ms) never trigger pending. 150ms gives users feedback within one frame of perceived delay without causing flash on very fast transitions.

**Alternative considered:** 0ms would show pending immediately, but could cause flashing on sub-100ms transitions (e.g. cached/preloaded routes).

### 2. Set `defaultPendingMinMs` to 200ms

**Choice:** Set `defaultPendingMinMs: 200` so once the skeleton appears, it stays visible for at least 200ms, avoiding jarring flash when data resolves quickly.

**Rationale:** TanStack Router defaults to 500ms to avoid flash. 200ms is a balance: enough to be perceived, short enough to not feel sluggish when data arrives in 250ms.

### 3. Create layout-specific skeleton pending components

**Choice:** Two new pending components:
- `DashboardPendingSkeleton` – mirrors DashboardLayout: sidebar placeholder + header + content area with card-like skeleton blocks
- `ListDetailPendingSkeleton` – mirrors list detail: header row + item rows (5–6 skeleton rows)

**Rationale:** Skeletons that match the destination layout feel faster than a centered spinner and communicate "loading the thing you clicked on."

**Alternative considered:** Single generic skeleton. Rejected because list detail vs home/cards view have different layout shapes; matching layout improves perceived continuity.

### 4. Route-level `pendingComponent` overrides

**Choice:** Set `pendingComponent: DashboardPendingSkeleton` on `_protected` and `pendingComponent: ListDetailPendingSkeleton` on `lists.$listId`. Use `DashboardPendingSkeleton` as router `defaultPendingComponent` for public→protected transitions.

**Rationale:** Route-level override ensures the correct skeleton for each destination. Child routes inherit parent pending unless they specify their own. `lists.$listId` needs a different skeleton than the home/archive card grid.

### 5. Keep `LoadingState` for non-route contexts

**Choice:** Do not change `LoadingState`. Continue using it for `Suspense` fallbacks (e.g. ProtectedLayout) and error/loading states inside components.

**Rationale:** Route pending and component-level Suspense serve different purposes. Suspense catches async component rendering; route pending catches loader delay. Both can coexist.

### 6. Cache fetchAuthState via React Query (client-side nav)

**Choice:** Create `authStateQueryOptions` that wraps `fetchAuthState` as the queryFn, with `staleTime: 60_000` (60 seconds). In root `beforeLoad`, use `ensureQueryData(authStateQueryOptions())` instead of calling `fetchAuthState()` directly.

**Rationale:** `fetchAuthState` is a `createServerFn`; every call triggers a server roundtrip. On client-side navigation within the same session, the token rarely changes. Caching for 60s avoids repeated server calls when the user navigates list A → list B → home. React Query's `ensureQueryData` returns cached data immediately when fresh.

**Alternative considered:** In-memory module-level cache. Rejected because React Query already provides cache, invalidation, and consistency with the rest of the data layer.

**Edge case:** If user signs out in another tab, we may serve stale auth for up to 60s. Acceptable; auth will correct on next full load or after TTL.

### 7. Do NOT add staleTime to Convex queries

**Choice:** Do not add `staleTime` to any Convex query options (currentUser, userLists, userPreferences, list, listItems, listTags, listCollaborators).

**Rationale:** Convex uses WebSocket subscriptions—data is pushed in real time and is never stale. The TanStack Query adapter treats Convex data as always fresh; `refetch` and `staleTime` are irrelevant. Adding `staleTime` could interfere with subscription behavior or cause stale UI when Convex pushes updates. Back-navigation cache comes from `gcTime` (default 5 min): the subscription stays active after unmount, so returning within gcTime reuses cached data without a new subscription.

**Alternative considered:** Adding staleTime to Convex queries. Rejected; Convex docs indicate data is never stale and refetch options are ignored.

### 8. Better Auth cookieCache (already added)

**Choice:** Keep `cookieCache: { enabled: true, maxAge: 5 * 60 }` in `convex/auth.ts`. Optionally increase `maxAge` to 10 minutes if session validation latency is still noticeable on the server side.

**Rationale:** cookieCache caches the parsed session cookie on the server, reducing repeated cookie parsing and validation. 5 min is a reasonable balance. Can tune based on observed server-side latency.

## Data Flow (with caching)

```
User clicks Link → Router starts transition
  → Router enters pending (after defaultPendingMs)
  → pendingComponent (skeleton) renders
  → Root beforeLoad:
      → ensureQueryData(authStateQueryOptions) — uses cached fetchAuthState if fresh (< 60s)
      → ensureQueryData(currentUserQueryOptions) — uses cached currentUser if fresh (< 60s)
  → _protected loader (prefetch userLists, userPreferences — Convex returns cached from active subscription if within gcTime)
  → lists.$listId loader (ensureQueryData list, items, tags, collaborators — same)
  → Router resolves → destination component renders
```

Auth state uses React Query cache (staleTime). Convex queries use WebSocket subscriptions; when within gcTime, the subscription may still be active and data is returned immediately.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Skeleton flashes briefly on very fast nav | defaultPendingMinMs = 200ms; acceptable trade-off for faster feedback on normal loads |
| Skeleton doesn't match future layout changes | Skeletons live in one file; update when layout changes |
| Public routes (sign-in, etc.) show Dashboard skeleton | Public routes use minimal layout; default pending can be a lighter skeleton or keep spinner for non-protected |
| Increased bundle size from new skeleton components | Minimal; Skeleton is already used; new components are small |
| Stale auth for up to 60s if user signs out elsewhere | Acceptable; rare; corrects on next load |

## Migration Plan

1. Add `authStateQueryOptions` and update root beforeLoad to use `ensureQueryData(authStateQueryOptions())`
2. Do not add staleTime to Convex queries; rely on default gcTime for subscription-based cache
3. Add `DashboardPendingSkeleton` and `ListDetailPendingSkeleton` components
4. Update router: `defaultPendingMs: 150`, `defaultPendingMinMs: 200`, `defaultPendingComponent: DashboardPendingSkeleton`
5. Add `pendingComponent` to `_protected` and `lists.$listId` routes
6. Optionally tune `cookieCache.maxAge` in convex/auth.ts if server-side latency persists
7. Deploy; no data migration or feature flags. Rollback: revert all changes.
