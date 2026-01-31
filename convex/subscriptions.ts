import { ConvexError, v } from "convex/values";
import {
	internalMutation,
	internalQuery,
	mutation,
	query,
} from "./_generated/server";
import { appError } from "./lib/errors";
import { requireAuth } from "./lib/permissions";
import {
	subscriptionProviderValidator,
	subscriptionStatusValidator,
} from "./schema";

const subscriptionReturnValidator = v.object({
	_id: v.id("subscriptions"),
	_creationTime: v.number(),
	userId: v.id("users"),
	provider: subscriptionProviderValidator,
	status: subscriptionStatusValidator,
	externalCustomerId: v.optional(v.string()),
	externalSubscriptionId: v.optional(v.string()),
	currentPeriodStart: v.optional(v.number()),
	currentPeriodEnd: v.optional(v.number()),
	canceledAt: v.optional(v.number()),
});

/**
 * Get the current user's subscription.
 */
export const getSubscription = query({
	args: {},
	returns: v.union(subscriptionReturnValidator, v.null()),
	handler: async (ctx) => {
		const userId = await requireAuth(ctx);

		const subscription = await ctx.db
			.query("subscriptions")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.unique();

		return subscription;
	},
});

/**
 * Check if the current user has an active subscription.
 */
export const isSubscribed = query({
	args: {},
	returns: v.boolean(),
	handler: async (ctx) => {
		const userId = await requireAuth(ctx);

		const subscription = await ctx.db
			.query("subscriptions")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.unique();

		if (!subscription) return false;

		return (
			subscription.status === "active" || subscription.status === "trialing"
		);
	},
});

/**
 * Internal: Look up subscription by external customer ID.
 * Used by webhook handlers.
 */
export const getByExternalCustomerId = internalQuery({
	args: {
		externalCustomerId: v.string(),
	},
	returns: v.union(subscriptionReturnValidator, v.null()),
	handler: async (ctx, args) => {
		const subscription = await ctx.db
			.query("subscriptions")
			.withIndex("by_external_customer", (q) =>
				q.eq("externalCustomerId", args.externalCustomerId),
			)
			.unique();

		return subscription;
	},
});

/**
 * Internal: Look up subscription by external subscription ID.
 * Used by webhook handlers.
 */
export const getByExternalSubscriptionId = internalQuery({
	args: {
		externalSubscriptionId: v.string(),
	},
	returns: v.union(subscriptionReturnValidator, v.null()),
	handler: async (ctx, args) => {
		const subscription = await ctx.db
			.query("subscriptions")
			.withIndex("by_external_subscription", (q) =>
				q.eq("externalSubscriptionId", args.externalSubscriptionId),
			)
			.unique();

		return subscription;
	},
});

/**
 * Internal: Create or update a subscription.
 * Used by webhook handlers to sync subscription state.
 */
export const upsertSubscription = internalMutation({
	args: {
		userId: v.id("users"),
		provider: subscriptionProviderValidator,
		status: subscriptionStatusValidator,
		externalCustomerId: v.optional(v.string()),
		externalSubscriptionId: v.optional(v.string()),
		currentPeriodStart: v.optional(v.number()),
		currentPeriodEnd: v.optional(v.number()),
		canceledAt: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const existingSubscription = await ctx.db
			.query("subscriptions")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.unique();

		if (existingSubscription) {
			await ctx.db.patch(existingSubscription._id, {
				provider: args.provider,
				status: args.status,
				externalCustomerId: args.externalCustomerId,
				externalSubscriptionId: args.externalSubscriptionId,
				currentPeriodStart: args.currentPeriodStart,
				currentPeriodEnd: args.currentPeriodEnd,
				canceledAt: args.canceledAt,
			});
		} else {
			await ctx.db.insert("subscriptions", {
				userId: args.userId,
				provider: args.provider,
				status: args.status,
				externalCustomerId: args.externalCustomerId,
				externalSubscriptionId: args.externalSubscriptionId,
				currentPeriodStart: args.currentPeriodStart,
				currentPeriodEnd: args.currentPeriodEnd,
				canceledAt: args.canceledAt,
			});
		}
	},
});

/**
 * Cancel the current user's subscription.
 * This marks it as canceled locally; actual cancellation with provider
 * should be handled separately.
 */
export const cancelSubscription = mutation({
	args: {},
	handler: async (ctx) => {
		const userId = await requireAuth(ctx);

		const subscription = await ctx.db
			.query("subscriptions")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.unique();

		if (!subscription) {
			throw new ConvexError(
				appError("SUBSCRIPTION_NOT_FOUND", "No subscription found"),
			);
		}

		await ctx.db.patch(subscription._id, {
			status: "canceled",
			canceledAt: Date.now(),
		});
	},
});
