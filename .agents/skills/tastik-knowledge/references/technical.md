# Technical Reference

## Tech Stack
- Frontend: TanStack Start (React 19 + Vite 7 + TanStack Router)
- Backend: Convex (real-time, WebSocket-based, TypeScript)
- Auth: Better Auth via `@convex-dev/better-auth`
- Billing: Stripe via `@convex-dev/stripe`
- Email: Resend (via Convex internal mutation)
- Rate limiting: Convex rate limiter component
- Package manager: Bun
- Linting: Biome (tabs, double quotes)

## Data Model (source: `convex/schema.ts`)

`profiles`: userId, listsSortBy?, listsSortAscending?, lastSeenAt?

`lists`: ownerId, name, icon?, type (listTypeValidator), status ("active"|"archived"),
         sortBy, sortAscending, showCompleted, hideCheckbox?, showTotal?, updatedAt?

`items`: listId, name, type (itemTypeValidator), completed, completedAt?,
         currentValue?, step?,                    ← stepper
         calculatorValue?,                        ← calculator
         status? ("todo"|"in_progress"|"done"),   ← kanban
         tagId?, description?, url?, notes?,
         sortOrder, updatedAt?

`listTags`: listId, name, color?

`listEditors`: listId, userId, nickname?, addedAt

`userProfileImages`: userId, storageId

## Authentication (source: `convex/auth.ts`, `convex/auth.config.ts`)
- Package: `@convex-dev/better-auth`
- Providers: email OTP, Google OAuth, Apple Sign In
- OTP: 6-digit, 5-min expiry, 5 req/hour rate limit (env vars: `AUTH_GOOGLE_ID/SECRET`, `AUTH_APPLE_ID/SECRET`)
- OTP delivery: via Resend → `internal.emails.sendOtpEmail`
- Dev bypass: `OTP_DEV_BYPASS=true` → hardcodes OTP to "424242"
- Auth API route: `src/routes/api/auth/$.tsx`
- Required env: `BETTER_AUTH_SECRET`, `SITE_URL`

## Billing / Subscription (source: `convex/stripe.ts`, `convex/lib/subscription.ts`)
- Package: `@convex-dev/stripe`
- Plan slug: `tastik_pro`
- Env vars: `STRIPE_SECRET_KEY`, `STRIPE_MONTHLY_PRICE_ID`, `STRIPE_YEARLY_PRICE_ID`
- `createCheckoutSession(plan, successUrl, cancelUrl)` → returns Stripe-hosted checkout URL
- `createBillingPortalSession(returnUrl)` → customer portal for managing subscription
- Subscription statuses: `"inactive"`, `"active"`, `"trialing"`, `"past_due"`, `"canceled"`
- Active check (`isComponentSubscriptionActive`): status is `"active"` or `"trialing"` AND `currentPeriodEnd > now` AND `plan_slug === "tastik_pro"`

## Hard Paywall Flow
1. User authenticates (OTP / Google / Apple)
2. `__root.tsx` pre-loads auth state + subscription
3. `_protected.tsx` layout: unauthenticated → `/sign-in`; no subscription → `/subscription`
4. `/subscription` accessible without subscription; redirects to `/lists` if already subscribed

## Permissions (source: `convex/lib/permissions.ts`)

Access chain: `requireAuth(ctx)` → `requireSubscription(ctx, userId)` → `requireListOwner` or `requireListAccess`

Owner-only: share list, edit list settings, delete list, create/edit/delete tags
Editor: item CRUD, assign tags to items (read-only tags), duplicate list (copy becomes own)

Error codes (source: `convex/lib/errors.ts`):
NOT_AUTHENTICATED, NOT_SUBSCRIBED, LIST_NOT_FOUND, NOT_LIST_OWNER, NOT_LIST_ACCESS,
LISTS_LIMIT_EXCEEDED, ITEMS_LIMIT_EXCEEDED, TAGS_LIMIT_EXCEEDED, EDITORS_LIMIT_EXCEEDED,
TAG_NAME_EXISTS, ITEM_NOT_FOUND, USER_NOT_FOUND, RATE_LIMITED, and more.

## Route Structure
- Public: `/` (landing), `/sign-in`, `/privacy`, `/support`, `/terms`
- Protected: `/lists/:listId`, `/archive`, `/subscription`
- API: `/api/auth/*` (Better Auth handler)

## Key File Map
```
convex/
  schema.ts             ← data model + validators
  auth.ts / auth.config.ts ← Better Auth setup
  lists.ts              ← list CRUD + archive/restore/duplicate/export
  items.ts              ← item CRUD + toggle + reorder
  tags.ts               ← tag CRUD
  listEditors.ts        ← sharing (add/remove editors, nicknames)
  stripe.ts             ← checkout + billing portal
  subscriptions.ts      ← getSubscription query
  users.ts              ← profile + deleteUserData (cascade)
  preferences.ts        ← user preferences
  emails.ts             ← OTP email templates
  http.ts               ← HTTP endpoints
  lib/permissions.ts    ← requireAuth, requireSubscription, requireListOwner/Access
  lib/limits.ts         ← MAX_LISTS, MAX_ITEMS, MAX_TAGS, MAX_EDITORS
  lib/subscription.ts   ← isComponentSubscriptionActive, TASTIK_PRO_PLAN_SLUG
  lib/errors.ts         ← error codes
  lib/rateLimiter.ts    ← rate limiting

src/routes/
  __root.tsx            ← root layout, auth pre-load
  index.tsx             ← landing (unauthenticated) or redirect
  _public.tsx           ← public layout wrapper
  _protected.tsx        ← auth + subscription guard
  _protected/
    lists.$listId.tsx   ← list detail page
    subscription.tsx    ← paywall / plan selection
    archive.tsx         ← archived lists
  sign-in.tsx
  (legal)/privacy.tsx, support.tsx, terms.tsx
  api/auth/$.tsx        ← Better Auth catch-all

src/hooks/
  queries/              ← Convex query wrappers (use-list, use-list-items, use-subscription, ...)
  actions/              ← mutation wrappers with loading/error/toast (use-create-list, ...)

src/components/
  lists/                ← list views, item rows, kanban board, dialogs
  dashboard/            ← sidebar, header, nav
  landing/              ← public landing page sections
  account/              ← account settings dialog
  common/               ← shared UI (confirm dialog, loading, error states)
  layout/               ← public and protected layout wrappers

src/lib/
  types/                ← ListType, ItemType, ItemStatus (inferred from schema)
  constants/            ← list-types.ts, plans.ts, list-icons.ts, item-statuses.ts
  utils/                ← cn, format-list-type, format-url, get-error-message, etc.
  validation/           ← Zod schemas (create-list-form, item-form)
  helpers/              ← fixtures.ts, mocks.ts (test utilities)
```

## Account Deletion (source: `convex/users.ts` → `deleteUserData`)
- Cascade: items → tags → editor entries → lists → profile → editor access on others' lists
- Requires email confirmation (case-insensitive)
- Does NOT cancel Stripe subscription (user must do via portal)
- Does NOT delete auth records (kept for audit)
- Irreversible, no recovery period
