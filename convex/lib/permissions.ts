import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { appError } from "./errors";

export async function requireAuth(
	ctx: QueryCtx | MutationCtx,
): Promise<string> {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		throw new ConvexError(appError("NOT_AUTHENTICATED", "Not authenticated"));
	}
	return identity.subject;
}

export async function requireListOwner(
	ctx: QueryCtx | MutationCtx,
	listId: Id<"lists">,
) {
	const userId = await requireAuth(ctx);
	const list = await ctx.db.get("lists", listId);

	if (!list) {
		throw new ConvexError(appError("LIST_NOT_FOUND", "List not found"));
	}

	if (list.ownerId !== userId) {
		throw new ConvexError(
			appError("NOT_LIST_OWNER", "Not authorized: you don't own this list"),
		);
	}

	return { userId, list };
}

export async function requireListAccess(
	ctx: QueryCtx | MutationCtx,
	listId: Id<"lists">,
) {
	const access = await getListAccessOrNull(ctx, listId);
	if (!access) {
		throw new ConvexError(appError("LIST_NOT_FOUND", "List not found"));
	}

	return access;
}

/**
 * Returns access info for the given list, or null if the caller has no access.
 * Returns null for unauthenticated users (does not throw).
 * Use `requireListAccess` when you want an error instead of null.
 */
export async function getListAccessOrNull(
	ctx: QueryCtx | MutationCtx,
	listId: Id<"lists">,
): Promise<{
	userId: string;
	list: Doc<"lists">;
	isOwner: boolean;
} | null> {
	let userId: string;
	try {
		userId = await requireAuth(ctx);
	} catch {
		return null;
	}
	const list = await ctx.db.get("lists", listId);

	if (!list) {
		return null;
	}

	const isOwner = list.ownerId === userId;

	if (!isOwner) {
		const editor = await ctx.db
			.query("listEditors")
			.withIndex("by_list_and_user", (q) =>
				q.eq("listId", listId).eq("userId", userId),
			)
			.unique();

		if (!editor) {
			return null;
		}
	}

	return { userId, list, isOwner };
}
