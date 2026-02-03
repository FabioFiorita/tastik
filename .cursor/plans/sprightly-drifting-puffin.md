# Account Deletion Implementation Plan

## Overview

Implement immediate account deletion functionality to match the updated legal policy (immediate deletion with no 30-day retention). This includes:
1. Create `deleteAccount` mutation in Convex
2. Add documentation to tastik-knowledge skill

## Critical Files

1. **`convex/users.ts`** - Add `deleteAccount` mutation
2. **`.agents/skills/tastik-knowledge/references/account-deletion.md`** - New documentation file

## Implementation

### 1. Add `deleteAccount` Mutation to `convex/users.ts`

Add the following mutation after the existing `getCurrentUser` query (after line 19):

```typescript
import { ConvexError } from "convex/values";
import { mutation } from "./_generated/server";
import { appError } from "./lib/errors";
import { requireAuth } from "./lib/permissions";
import { normalizeEmail } from "./lib/validation";

/**
 * Delete the current user's account and all associated data.
 * This is an irreversible operation that immediately:
 * - Deletes all lists owned by the user (with items, tags, and editors)
 * - Removes the user from all shared lists (where they're an editor)
 * - Deletes the user's subscription record
 * - Deletes the user's profile
 *
 * Note: This does NOT cancel active subscriptions with RevenueCat.
 * Users should cancel their subscription first via the management portal.
 */
export const deleteAccount = mutation({
  args: {
    confirmEmail: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // 1. Require authentication
    const userId = await requireAuth(ctx);

    // 2. Get user record
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new ConvexError(appError("USER_NOT_FOUND", "User not found"));
    }

    // 3. Validate user has an email
    if (!user.email) {
      throw new ConvexError(
        appError(
          "INVALID_INPUT",
          "Account has no email address. Please contact support for account deletion."
        )
      );
    }

    // 4. Validate email confirmation
    const normalizedUserEmail = normalizeEmail(user.email);
    const normalizedConfirmEmail = normalizeEmail(args.confirmEmail);

    if (normalizedConfirmEmail !== normalizedUserEmail) {
      throw new ConvexError(
        appError(
          "INVALID_INPUT",
          "Email confirmation does not match your account email"
        )
      );
    }

    // 5. Delete all owned lists with their dependencies
    const ownedLists = await ctx.db
      .query("lists")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    for (const list of ownedLists) {
      // Delete all items in the list
      const items = await ctx.db
        .query("items")
        .withIndex("by_list", (q) => q.eq("listId", list._id))
        .collect();

      for (const item of items) {
        await ctx.db.delete(item._id);
      }

      // Delete all tags in the list
      const tags = await ctx.db
        .query("listTags")
        .withIndex("by_list", (q) => q.eq("listId", list._id))
        .collect();

      for (const tag of tags) {
        await ctx.db.delete(tag._id);
      }

      // Delete all editor entries for the list
      const editors = await ctx.db
        .query("listEditors")
        .withIndex("by_list", (q) => q.eq("listId", list._id))
        .collect();

      for (const editor of editors) {
        await ctx.db.delete(editor._id);
      }

      // Delete the list itself
      await ctx.db.delete(list._id);
    }

    // 6. Remove user from all shared lists (where they're an editor)
    const editorEntries = await ctx.db
      .query("listEditors")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const entry of editorEntries) {
      await ctx.db.delete(entry._id);
    }

    // 7. Delete subscription record
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (subscription) {
      await ctx.db.delete(subscription._id);
    }

    // 8. Delete the user record
    await ctx.db.delete(userId);

    return null;
  },
});
```

**Import additions needed at top of file:**
```typescript
import { ConvexError } from "convex/values";
import { mutation } from "./_generated/server";
import { appError } from "./lib/errors";
import { requireAuth } from "./lib/permissions";
import { normalizeEmail } from "./lib/validation";
```

### 2. Create Documentation File

Create `.agents/skills/tastik-knowledge/references/account-deletion.md`:

```markdown
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
```

### 3. Update SKILL.md References Section

Add reference to account-deletion.md in `.agents/skills/tastik-knowledge/SKILL.md` after line 28:

```markdown
## References
- Product and positioning: `references/product.md`
- Auth and subscription: `references/auth-subscription.md`
- Feature behavior: `references/features.md`
- Permissions: `references/permissions.md`
- Account deletion: `references/account-deletion.md`
- Source of truth and verification: `references/source-of-truth.md`
```

## Implementation Details

### Deletion Sequence

The mutation follows this exact order to avoid orphaned data:

1. **Authenticate** - Get userId from `requireAuth(ctx)`
2. **Validate email** - Compare normalized emails (case-insensitive)
3. **Delete owned lists** - For each list:
   - Delete all items (via `items.by_list` index)
   - Delete all tags (via `listTags.by_list` index)
   - Delete all editors (via `listEditors.by_list` index)
   - Delete the list itself
4. **Remove from shared lists** - Delete editor entries (via `listEditors.by_user` index)
5. **Delete subscription** - Delete subscription record (via `subscriptions.by_user` index)
6. **Delete user** - Delete the user record itself

### Why Email Confirmation?

- Prevents accidental deletion from UI bugs or misclicks
- User must actively type their email address
- Case-insensitive comparison using `normalizeEmail()` (already used in app)
- Better UX than forcing re-authentication flow

### Why No Subscription Check?

Users should be able to delete their account even if their subscription expired. Account deletion is a user right that shouldn't be blocked by payment status (GDPR/CCPA requirement).

### Reused Utilities

- `requireAuth()` - Get authenticated user (convex/lib/permissions.ts)
- `normalizeEmail()` - Normalize email for comparison (convex/lib/validation.ts)
- `appError()` - Create error objects (convex/lib/errors.ts)
- Existing error codes: `USER_NOT_FOUND`, `INVALID_INPUT`

### Pattern References

The deletion logic follows the exact pattern from `deleteList` mutation in `convex/lists.ts:164-204`:
- Use `.withIndex()` with appropriate indexes (never `.filter()`)
- Use `.collect()` to get all records
- Use `for` loop with `ctx.db.delete()` for each record
- Delete children before parents

## Verification Steps

After implementation:

1. **Type checking:**
   ```bash
   bun typecheck
   ```

2. **Code formatting:**
   ```bash
   bun check:write
   ```

3. **Manual testing (recommended):**
   - Create test account with email
   - Add lists, items, tags
   - Share a list with another user
   - Become an editor on another user's list
   - Attempt deletion with wrong email (should fail with error)
   - Delete account with correct email (should succeed)
   - Verify cannot log back in
   - Verify in Convex dashboard:
     - User record deleted
     - All owned lists deleted
     - All items/tags deleted
     - Editor entries removed from shared lists
     - Subscription record deleted

4. **Edge case testing:**
   - User with no subscription
   - User with no lists
   - User with maximum data (50 lists with items)
   - Case-different email confirmation (should work)

## Notes

- Frontend implementation is a separate task (not included in this plan)
- RevenueCat subscription cancellation is separate (users must do via management portal)
- Auth system cleanup intentionally skipped (keeps audit trail)
- No rate limiting applied to account deletion (intentional)
