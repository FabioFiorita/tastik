import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { appError } from "./errors";

export async function requireAuth(
	ctx: QueryCtx | MutationCtx,
): Promise<Id<"users">> {
	const userId = await getAuthUserId(ctx);
	if (!userId) {
		throw new ConvexError(appError("NOT_AUTHENTICATED", "Not authenticated"));
	}
	return userId;
}

export async function requireListOwner(
	ctx: QueryCtx | MutationCtx,
	listId: Id<"lists">,
) {
	const userId = await requireAuth(ctx);
	const list = await ctx.db.get(listId);

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
	const userId = await requireAuth(ctx);
	const list = await ctx.db.get(listId);

	if (!list) {
		throw new ConvexError(appError("LIST_NOT_FOUND", "List not found"));
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
			throw new ConvexError(
				appError(
					"NOT_LIST_ACCESS",
					"Not authorized: you don't have access to this list",
				),
			);
		}
	}

	return { userId, list, isOwner };
}

export async function requireSubscription(
	ctx: QueryCtx | MutationCtx,
	userId: Id<"users">,
): Promise<void> {
	const subscription = await ctx.db
		.query("subscriptions")
		.withIndex("by_user", (q) => q.eq("userId", userId))
		.unique();
	const now = Date.now();

	if (!subscription) {
		throw new ConvexError(
			appError("SUBSCRIPTION_REQUIRED", "Subscription required"),
		);
	}

	if (subscription.status !== "active" && subscription.status !== "trialing") {
		throw new ConvexError(
			appError("SUBSCRIPTION_REQUIRED", "Subscription required"),
		);
	}

	if (
		subscription.currentPeriodEnd !== undefined &&
		subscription.currentPeriodEnd <= now
	) {
		throw new ConvexError(
			appError("SUBSCRIPTION_EXPIRED", "Subscription expired"),
		);
	}
}
