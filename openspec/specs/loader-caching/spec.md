## ADDED Requirements

### Requirement: Auth state is cached on client-side navigation

The root beforeLoad SHALL use a cached result of `fetchAuthState` when available and fresh (within configured staleTime), avoiding a server roundtrip on client-side navigation.

#### Scenario: Navigate within session

- **WHEN** user navigates (e.g. list A → list B) within 60 seconds of a previous navigation that fetched auth state
- **THEN** beforeLoad SHALL use cached auth state without calling the server
- **AND** the token SHALL be applied to Convex and currentUser ensured as before

#### Scenario: First navigation or cache expired

- **WHEN** user navigates and no cached auth state exists or it is stale (older than 60 seconds)
- **THEN** beforeLoad SHALL call `fetchAuthState` (server roundtrip)
- **AND** the result SHALL be cached for subsequent navigations

### Requirement: Convex queries SHALL NOT use staleTime

Convex query options used by route loaders SHALL NOT include `staleTime`. Convex uses WebSocket subscriptions; data is pushed in real time and is never stale. Back-navigation cache relies on `gcTime` (subscription remains active after unmount).

#### Scenario: No staleTime on Convex queries

- **WHEN** currentUser, userLists, userPreferences, list, listItems, listTags, or listCollaborators query options are configured
- **THEN** they SHALL NOT specify `staleTime`
- **AND** they SHALL rely on Convex's default gcTime (5 min) for subscription-based caching on back-navigation

#### Scenario: Back-navigation uses gcTime

- **WHEN** user navigates list A → list B → list A within gcTime (default 5 min)
- **THEN** the list A subscription may still be active
- **AND** the loader MAY return cached data from the active subscription without establishing a new one

### Requirement: Better Auth cookieCache is utilized

The Better Auth session configuration SHALL use `cookieCache` to reduce server-side session lookup latency. The existing configuration in `convex/auth.ts` SHALL remain (enabled, maxAge 5 min) and may be tuned if needed.

#### Scenario: cookieCache configuration

- **WHEN** auth is configured
- **THEN** `cookieCache.enabled` SHALL be true
- **AND** `cookieCache.maxAge` SHALL be at least 5 minutes (300 seconds)
