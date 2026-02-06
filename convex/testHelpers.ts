import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { requireAuth } from "./lib/permissions";

export const seedSubscribedUser = internalMutation({
	args: {},
	returns: v.null(),
	handler: async (ctx) => {
		const userId = await requireAuth(ctx);

		const existing = await ctx.db
			.query("subscriptions")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.unique();

		if (!existing) {
			const now = Date.now();
			await ctx.db.insert("subscriptions", {
				userId,
				status: "active",
				currentPeriodStart: now,
				currentPeriodEnd: now + 1_000_000,
			});
		}

		return null;
	},
});
