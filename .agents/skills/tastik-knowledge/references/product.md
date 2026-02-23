# Product

## Positioning
- Fills the gap for casual, ongoing tasks that don't need due dates or alarms.
- Taglines: "Lists without deadlines" / "Quiet companion to your reminder app" / "Less pressure, more clarity"
- Not competing with Todoist, TickTick, Apple Reminders — those are for deadline-driven tasks.
- Tastik is for: grocery lists with quantities, expense tracking with totals, lightweight kanban, reading collections.

## Use Cases (from landing page)
- Grocery Shopping
- Party Planning
- Side Projects
- Travel Packing
- Reading List

## Business Model
- Hard paywall: pay or don't use the app. No free tier. No freemium.
- Monthly: $1.99/month — 7-day trial
- Yearly: $19.99/year — 14-day trial
- Trials configured in Stripe (not manual app-side logic). App trusts Stripe state.
- Goal: self-sustaining; cover hosting costs.

## The 5 List Types
- `simple`: Checkbox items. Toggle complete/incomplete. No numeric fields.
- `stepper`: Items with `currentValue` + `step` (increment size). Inline +/- controls. Good for shopping quantities, inventory, tracking.
- `calculator`: Items with `calculatorValue`. Running total shown at top (`showTotal` flag). Good for expense tracking, budget splitting.
- `kanban`: Items in 3 columns — To do / In progress / Done. `status` field on items. Drag-and-drop planned.
- `multi`: A single list containing mixed item types (simple + stepper + calculator + kanban). Item type picker on item form.

**Important distinction**: `multi` is a **list type**, not an item type. Item types are: `simple`, `stepper`, `calculator`, `kanban`.

## Item Fields
- Common (all types): `name` (required), `description`, `url`, `notes`, `tagId`
- Stepper: `currentValue`, `step`
- Calculator: `calculatorValue`
- Kanban: `status` → "todo" | "in_progress" | "done"
- Multi list item form: show item type picker first, then type-specific fields

## Tags
- List-scoped (tags belong to one list only)
- Up to 50 tags per list; optional `color`
- Owner: full CRUD; Editor: read-only (can assign to items, cannot create/edit/delete)

## Sharing
- Owner adds editors by email; assigns a nickname to each editor
- Editors see only nicknames, never real identities (privacy-first)
- Up to 10 editors per list

## List Preferences & Actions
- Sort: `sortBy` ("created_at" | "updated_at" | "name") + `sortAscending`
- Visibility: `showCompleted`, `hideCheckbox`, `showTotal`
- Status: active | archived
- Actions: create, update, delete, archive, restore, duplicate, export (txt / md / csv)

## Global User Preferences
- `listsSortBy` + `listsSortAscending` stored in `profiles` table
