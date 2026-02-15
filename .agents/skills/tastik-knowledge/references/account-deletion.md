# Account Deletion

## Implementation

- **Internal mutation:** `deleteUserData` in `convex/users.ts`
- **Args:** `userId` (string)
- Orchestration (Better Auth or API) invokes this after user confirms; exact flow in `src/**`.

## Deletion Behavior

**Immediate deletion with no retention period:**
1. All lists owned by the user (with cascading deletes)
2. All items in those lists
3. All tags in those lists
4. All editor invitations for those lists
5. User's editor access to other users' lists (removed from shared lists)
6. User profile

## Safety Measures

- Orchestration layer validates email confirmation (case-insensitive) before invoking `deleteUserData`
- No subscription check (users can delete with or without active subscription)
- Email confirmation prevents accidental deletion

## Important Notes

- **Does NOT cancel Stripe subscriptions** - users must cancel via Stripe customer portal first
- **Does NOT delete auth system records** (authSessions, authAccounts) - kept for audit trail
- **No rate limiting** - intentionally allows deletion even if rate limited
- **Irreversible** - no recovery or backup period

## Data Cascade Logic

`deleteUserData` uses `for await` iteration over index queries:
1. Delete child entities first (items, tags, editors per list)
2. Delete parent entities last (lists)
3. Remove user's editor entries on others' lists
4. Delete profile
5. Uses `.withIndex()` for efficient queries

## Edge Cases Handled

- User with no lists: Proceeds normally (list/profile cleanup only)
- Large accounts (50 lists × 500 items): Uses index queries and `for await` iteration

## Frontend Integration

The frontend should:
1. Show clear warning that deletion is permanent
2. Instruct users to cancel Stripe subscription first
3. Require email confirmation input
4. Use destructive styling (red "DELETE ACCOUNT" button)
5. Clear local storage and redirect to login after successful deletion
