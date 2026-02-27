## 1. Auth State Caching

- [x] 1.1 Extract `fetchAuthState` from `__root.tsx` to `src/lib/auth-state.ts` (or similar) so it can be imported by query options; update __root to import from there
- [x] 1.2 Create `authStateQueryOptions` in `src/hooks/queries/use-auth-state.ts` – `queryKey: ['authState']`, `queryFn: () => fetchAuthState()`, `staleTime: 60_000`
- [x] 1.3 Update `src/routes/__root.tsx` beforeLoad: use `ensureQueryData(authStateQueryOptions())` instead of `fetchAuthState()` directly; destructure `{ token }` from result

## 2. Pending Skeleton Components

- [x] 2.1 Create `DashboardPendingSkeleton` in `src/components/common/pending-skeletons.tsx` – skeleton that mirrors DashboardLayout: SidebarProvider + skeleton sidebar (brand area, 3 list placeholders) + SidebarInset with header row (breadcrumb placeholder, spacer) + main content with 6 card-like skeleton blocks in a responsive grid (2–3 columns)
- [x] 2.2 Create `ListDetailPendingSkeleton` in same file – skeleton for list detail: header row (back link placeholder, list title bar with 2–3 action placeholders) + 5–6 item row placeholders (icon, text line, controls) matching ItemRow structure

## 3. Router Configuration

- [x] 3.1 Update `src/router.tsx`: set `defaultPendingMs: 150`, `defaultPendingMinMs: 200`, `defaultPendingComponent: DashboardPendingSkeleton` in `createRouter` options

## 4. Route-Level Pending Components

- [x] 4.1 Add `pendingComponent: DashboardPendingSkeleton` to `src/routes/_protected.tsx`
- [x] 4.2 Add `pendingComponent: ListDetailPendingSkeleton` to `src/routes/_protected/lists.$listId.tsx`

## 5. Validation

- [x] 5.1 Run `bun typecheck` and fix any type errors
- [x] 5.2 Run `bun check:write` and fix any lint/format issues
- [ ] 5.3 Manually verify: navigate list A → list B, confirm skeleton appears within ~200ms; navigate /home → list, confirm dashboard skeleton; verify LoadingState still used in ProtectedLayout Suspense fallback
- [ ] 5.4 Manually verify auth caching: use Network tab to confirm no duplicate fetchAuthState on second navigation within 60s
