import { v } from "convex/values";
import { internalQuery, query } from "./_generated/server";
import { requireAuth } from "./lib/permissions";
import { hasTastikProPlan, isPaidSubscriptionActive } from "./lib/subscription";

export const isSubscribed = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireAuth(ctx);

		const subscription = await ctx.db
			.query("subscriptions")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.unique();

		if (!subscription) return false;

		return isPaidSubscriptionActive(subscription);
	},
});

export const getSubscription = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();

		if (!identity) {
			return {
				isSubscribed: false,
				isTrialing: false,
				status: "inactive" as const,
				freeTrial: false,
				planSlug: undefined,
				currentPeriodEnd: undefined,
				canceledAt: undefined,
			};
		}

		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
			.unique();

		if (!user) {
			return {
				isSubscribed: false,
				isTrialing: false,
				status: "inactive" as const,
				freeTrial: false,
				planSlug: undefined,
				currentPeriodEnd: undefined,
				canceledAt: undefined,
			};
		}

		const subscription = await ctx.db
			.query("subscriptions")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.unique();

		if (!subscription) {
			return {
				isSubscribed: false,
				isTrialing: false,
				status: "inactive" as const,
				freeTrial: false,
				planSlug: undefined,
				currentPeriodEnd: undefined,
				canceledAt: undefined,
			};
		}

		const isSubscribed =
			subscription.status === "active" &&
			hasTastikProPlan(subscription.planSlug) &&
			(subscription.currentPeriodEnd === undefined ||
				subscription.currentPeriodEnd > Date.now());
		const isTrialing =
			subscription.status === "active" &&
			subscription.freeTrial === true &&
			hasTastikProPlan(subscription.planSlug) &&
			(subscription.currentPeriodEnd === undefined ||
				subscription.currentPeriodEnd > Date.now());

		return {
			isSubscribed,
			isTrialing,
			status: subscription.status,
			freeTrial: subscription.freeTrial ?? false,
			planSlug: subscription.planSlug,
			currentPeriodEnd: subscription.currentPeriodEnd,
			canceledAt: subscription.canceledAt,
		};
	},
});

export const getSubscriptionByUserId = internalQuery({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("subscriptions")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.unique();
	},
});
