import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

/**
 * Verify the user has an active subscription, throw if not.
 */
export async function requireSubscription(
	ctx: QueryCtx | MutationCtx,
	userId: Id<"users">,
): Promise<void> {
	const subscription = await ctx.db
		.query("subscriptions")
		.withIndex("by_user", (q) => q.eq("userId", userId))
		.unique();

	if (!subscription) {
		throw new Error("Subscription required");
	}

	if (subscription.status !== "active" && subscription.status !== "trialing") {
		throw new Error("Subscription required");
	}
}
