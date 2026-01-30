import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

/**
 * Get the authenticated user ID or throw an error.
 */
export async function requireAuth(
	ctx: QueryCtx | MutationCtx,
): Promise<Id<"users">> {
	const userId = await getAuthUserId(ctx);
	if (!userId) {
		throw new Error("Not authenticated");
	}
	return userId;
}

/**
 * Verify the user owns the specified list, throw if not.
 * Returns the list document.
 */
export async function requireListOwner(
	ctx: QueryCtx | MutationCtx,
	listId: Id<"lists">,
) {
	const userId = await requireAuth(ctx);
	const list = await ctx.db.get(listId);

	if (!list) {
		throw new Error("List not found");
	}

	if (list.ownerId !== userId) {
		throw new Error("Not authorized: you don't own this list");
	}

	return { userId, list };
}

/**
 * Verify the user has access to the list (owner or editor), throw if not.
 * Returns the list document and whether user is owner.
 */
export async function requireListAccess(
	ctx: QueryCtx | MutationCtx,
	listId: Id<"lists">,
) {
	const userId = await requireAuth(ctx);
	const list = await ctx.db.get(listId);

	if (!list) {
		throw new Error("List not found");
	}

	const isOwner = list.ownerId === userId;

	if (!isOwner) {
		// Check if user is an editor
		const editor = await ctx.db
			.query("listEditors")
			.withIndex("by_list_and_user", (q) =>
				q.eq("listId", listId).eq("userId", userId),
			)
			.unique();

		if (!editor) {
			throw new Error("Not authorized: you don't have access to this list");
		}
	}

	return { userId, list, isOwner };
}
