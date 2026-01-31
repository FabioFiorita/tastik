import { ConvexError } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { appError } from "./errors";

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

	if (subscription.status !== "active" && subscription.status !== "trialing") {
		throw new ConvexError(
			appError("SUBSCRIPTION_REQUIRED", "Subscription required"),
		);
	}
}
