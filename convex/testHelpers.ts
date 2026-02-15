import { v } from "convex/values";
import { components } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { requireAuth } from "./lib/permissions";

export const seedSubscribedUser = internalMutation({
	args: {},
	returns: v.null(),
	handler: async (ctx) => {
		const userId = await requireAuth(ctx);
		const user = await ctx.db.get("users", userId);
		if (!user) return null;

		const now = Math.floor(Date.now() / 1000);
		await ctx.runMutation(components.stripe.private.handleSubscriptionCreated, {
			stripeSubscriptionId: `sub_test_${user.clerkId}`,
			stripeCustomerId: `cus_test_${user.clerkId}`,
			status: "active",
			currentPeriodEnd: now + 365 * 24 * 60 * 60,
			cancelAtPeriodEnd: false,
			priceId: "price_tastik_pro",
			metadata: { plan_slug: "tastik_pro", userId: user.clerkId },
		});

		return null;
	},
});
