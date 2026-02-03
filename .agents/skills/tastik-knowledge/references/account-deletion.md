# Account Deletion

## Implementation

- **Mutation:** `deleteAccount` in `convex/users.ts`
- **Args:** `confirmEmail` (string) - User must confirm their email address
- **Returns:** `null`
- **Permission:** Requires authentication via `requireAuth()`

## Deletion Behavior

**Immediate deletion with no retention period:**
1. All lists owned by the user (with cascading deletes)
2. All items in those lists
3. All tags in those lists
4. All editor invitations for those lists
5. User's editor access to other users' lists (removed from shared lists)
6. User's subscription record
7. User profile

## Safety Measures

- Requires exact email confirmation (case-insensitive)
- No subscription check (users can delete even with expired subscription)
- Validates user has email (OAuth users should have email)
- Email confirmation prevents accidental deletion

## Important Notes

- **Does NOT cancel RevenueCat subscriptions** - users must cancel via management portal first
- **Does NOT delete auth system records** (authSessions, authAccounts) - kept for audit trail
- **No rate limiting** - intentionally allows deletion even if rate limited
- **Irreversible** - no recovery or backup period

## Data Cascade Logic

Uses same deletion pattern as `deleteList` mutation (convex/lists.ts:164-204):
1. Delete child entities first (items, tags, editors)
2. Delete parent entities last (lists, then user)
3. Uses `.withIndex()` for efficient queries (not `.filter()`)
4. Uses `.collect()` then `for` loop for bulk deletions

## Edge Cases Handled

- User without email: Returns error, must contact support
- User with no subscription: Proceeds normally (subscription deletion skipped)
- User with no lists: Proceeds normally (list deletion skipped)
- Large accounts (50 lists × 500 items): Completes in acceptable time

## Frontend Integration

The frontend should:
1. Show clear warning that deletion is permanent
2. Instruct users to cancel RevenueCat subscription first
3. Require email confirmation input
4. Use destructive styling (red "DELETE ACCOUNT" button)
5. Clear local storage and redirect to login after successful deletion
