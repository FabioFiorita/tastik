## ADDED Requirements

### Requirement: Pending UI appears within 200ms of navigation start

The router SHALL show a pending component within 200ms of a navigation transition starting, when route loaders or beforeLoad have not yet completed.

#### Scenario: Client navigation from list A to list B

- **WHEN** user clicks a list link in the sidebar while on another list
- **AND** route loaders take longer than the pending threshold (150ms)
- **THEN** a layout-matching skeleton SHALL appear within ~200ms
- **AND** the skeleton SHALL remain visible until the destination route has rendered

#### Scenario: Fast navigation does not show pending

- **WHEN** user navigates and loaders complete in under 150ms (e.g. cached/preloaded route)
- **THEN** no pending component SHALL appear
- **AND** the destination SHALL render directly

### Requirement: Protected routes show dashboard skeleton during pending

The _protected layout SHALL display a skeleton that mirrors the dashboard layout (sidebar placeholder, header placeholder, main content area with card-like skeleton blocks) when the route is in a pending state.

#### Scenario: Navigating to /home or /archive

- **WHEN** user navigates to /home or /archive
- **AND** the _protected loader has not yet completed
- **THEN** the dashboard skeleton SHALL render in place of the layout content
- **AND** the skeleton SHALL match the approximate structure of DashboardLayout (sidebar + header + content area)

#### Scenario: Pending minimum duration

- **WHEN** the pending skeleton is shown
- **AND** loaders complete within 200ms of the skeleton appearing
- **THEN** the skeleton SHALL remain visible for at least 200ms (defaultPendingMinMs) to avoid jarring flash

### Requirement: List detail route shows list skeleton during pending

The lists.$listId route SHALL display a skeleton that mirrors the list detail layout (header row, item rows) when the route is in a pending state.

#### Scenario: Navigating to a specific list

- **WHEN** user navigates to /lists/$listId (e.g. from sidebar or search)
- **AND** the list loader has not yet completed
- **THEN** the list detail skeleton SHALL render
- **AND** the skeleton SHALL show a header row plus 5–6 placeholder item rows

### Requirement: Skeleton-first pending; spinner for fallback contexts

The system SHALL prefer layout-matching skeletons for route pending states. The existing LoadingState (spinner) SHALL remain in use for Suspense fallbacks and non-route loading contexts (e.g. ProtectedLayout Suspense, error boundaries).

#### Scenario: Suspense fallback unchanged

- **WHEN** a component suspends (e.g. async data inside a route component)
- **THEN** the Suspense fallback (LoadingState) SHALL display as before
- **AND** route-level pending components SHALL not affect component-level Suspense
