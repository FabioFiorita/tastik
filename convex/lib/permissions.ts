import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { appError } from "./errors";
import { isPaidSubscriptionActive } from "./subscription";

export async function requireAuth(
	ctx: QueryCtx | MutationCtx,
): Promise<Id<"users">> {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		throw new ConvexError(appError("NOT_AUTHENTICATED", "Not authenticated"));
	}
	const user = await ctx.db
		.query("users")
		.withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
		.unique();
	if (!user) {
		throw new ConvexError(appError("NOT_AUTHENTICATED", "User not found"));
	}
	return user._id;
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

export async function getListAccessOrNull(
	ctx: QueryCtx | MutationCtx,
	listId: Id<"lists">,
): Promise<{
	userId: Id<"users">;
	list: Doc<"lists">;
	isOwner: boolean;
} | null> {
	const userId = await requireAuth(ctx);
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

export async function isUserSubscribed(
	ctx: QueryCtx | MutationCtx,
	userId: Id<"users">,
): Promise<boolean> {
	const subscription = await ctx.db
		.query("subscriptions")
		.withIndex("by_user", (q) => q.eq("userId", userId))
		.unique();

	if (!subscription) return false;

	return isPaidSubscriptionActive(subscription);
}

export async function requirePaidFeature(
	ctx: QueryCtx | MutationCtx,
	userId: Id<"users">,
	featureName: string,
): Promise<void> {
	const subscribed = await isUserSubscribed(ctx, userId);
	if (!subscribed) {
		throw new ConvexError(
			appError("UPGRADE_REQUIRED", `Upgrade to Pro to use ${featureName}`),
		);
	}
}

export async function requireSubscription(
	ctx: QueryCtx | MutationCtx,
	userId: Id<"users">,
): Promise<void> {
	const subscription = await ctx.db
		.query("subscriptions")
		.withIndex("by_user", (q) => q.eq("userId", userId))
		.unique();

	if (!subscription) {
		throw new ConvexError(
			appError("SUBSCRIPTION_REQUIRED", "Subscription required"),
		);
	}

	if (!isPaidSubscriptionActive(subscription)) {
		throw new ConvexError(
			appError("SUBSCRIPTION_EXPIRED", "Subscription expired"),
		);
	}
}
