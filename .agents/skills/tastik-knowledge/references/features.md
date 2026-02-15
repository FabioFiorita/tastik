# Feature Behavior

## Access
- All features require an active subscription (hard paywall, plan `tastik_pro`).

## Limits
- 50 lists per user.

## List Types
- Simple: checkbox items that toggle complete/incomplete.
- Calculator: running total summary at top of list.
- Stepper: progress items that auto-complete at target.
- Kanban: status workflow across columns.
- Multi: list can contain mixed item types.

## Items
- Items are ordered and can be completed.
- Each list type has its own behavior and display rules.

## Item Form Fields

### Common fields (always shown)
- Name (required)
- Description (optional)
- URL (optional)
- Tag inputs (optional)

### Type-specific fields

#### Stepper type
- Step input (optional, defaults to 1.0)
- Value input (target value)

#### Calculator type
- Value input (calculator value)

#### Kanban type
- Status picker (todo, in progress, done, etc.)

#### Multi list type
- Item type picker (simple, stepper, calculator, kanban)
- After selecting item type, show fields based on that item type:
  - If item type is stepper: show step and value inputs
  - If item type is calculator: show value input
  - If item type is kanban: show status picker
  - If item type is simple: show only common fields

Note: For multi-type lists, the item type determines which fields are displayed, effectively using the item type as if it were the list type for field rendering purposes.

## Tags
- Tags are list-scoped for privacy in shared lists.
- Tags are visible to editors but only owners can modify them.
- Up to 50 tags per list.

## Sharing
- Owner adds editors by email or user ID and assigns a nickname.
- Editors see nicknames only, not real identities.
- Owners can manage list settings; editors cannot.
- Up to 10 editors per list.

## Keyboard Shortcuts
- Enables fast workflows for list and item management.

## List Preferences
- Lists support sorting and visibility preferences.
- Lists can be active or archived.
