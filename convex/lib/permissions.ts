import { ConvexError } from "convex/values";
import { components } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { appError } from "./errors";
import { isComponentSubscriptionActive } from "./subscription";

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

export async function getListAccessOrNull(
	ctx: QueryCtx | MutationCtx,
	listId: Id<"lists">,
): Promise<{
	userId: string;
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
	userId: string,
): Promise<boolean> {
	const subs = await ctx.runQuery(
		components.stripe.public.listSubscriptionsByUserId,
		{ userId },
	);

	const now = Math.floor(Date.now() / 1000);
	return subs.some((sub) => isComponentSubscriptionActive(sub, now));
}

export async function requireSubscription(
	ctx: QueryCtx | MutationCtx,
	userId: string,
): Promise<void> {
	const subs = await ctx.runQuery(
		components.stripe.public.listSubscriptionsByUserId,
		{ userId },
	);

	const now = Math.floor(Date.now() / 1000);
	const hasActive = subs.some((sub) => isComponentSubscriptionActive(sub, now));

	if (subs.length === 0) {
		throw new ConvexError(
			appError("SUBSCRIPTION_REQUIRED", "Subscription required"),
		);
	}

	if (!hasActive) {
		throw new ConvexError(
			appError("SUBSCRIPTION_EXPIRED", "Subscription expired"),
		);
	}
}
