import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internalMutation, query } from "./_generated/server";
import { requireAuth } from "./lib/permissions";

const revenueCatEventValidator = v.object({
	eventId: v.string(),
	type: v.string(),
	app_user_id: v.optional(v.string()),
	transferred_from: v.optional(v.array(v.string())),
	transferred_to: v.optional(v.array(v.string())),
	purchased_at_ms: v.optional(v.number()),
	expiration_at_ms: v.optional(v.number()),
	event_timestamp_ms: v.optional(v.number()),
	period_type: v.optional(v.string()),
	original_transaction_id: v.optional(v.string()),
	transaction_id: v.optional(v.string()),
});

export const isSubscribed = query({
	args: {},
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

export const handleRevenueCatEvent = internalMutation({
	args: { event: revenueCatEventValidator },
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("processedWebhookEvents")
			.withIndex("by_event_id", (q) => q.eq("eventId", args.event.eventId))
			.unique();
		if (existing) return;

		const { event } = args;
		const type = event.type;

		if (type === "TRANSFER") {
			const fromIds = event.transferred_from ?? [];
			const toIds = event.transferred_to ?? [];
			const fromId = fromIds[0] as Id<"users"> | undefined;
			const toId = toIds[0] as Id<"users"> | undefined;
			if (fromId && toId) {
				const subscription = await ctx.db
					.query("subscriptions")
					.withIndex("by_user", (q) => q.eq("userId", fromId))
					.unique();
				if (subscription) {
					await ctx.db.patch(subscription._id, { userId: toId });
				}
			}
			await ctx.db.insert("processedWebhookEvents", {
				eventId: event.eventId,
			});
			return;
		}

		if (type === "TEST" || type === "SUBSCRIPTION_PAUSED") {
			await ctx.db.insert("processedWebhookEvents", {
				eventId: event.eventId,
			});
			return;
		}

		const appUserId = event.app_user_id;
		if (!appUserId) {
			await ctx.db.insert("processedWebhookEvents", {
				eventId: event.eventId,
			});
			return;
		}
		const userId = appUserId as Id<"users">;
		const user = await ctx.db.get(userId);
		if (!user) {
			await ctx.db.insert("processedWebhookEvents", {
				eventId: event.eventId,
			});
			return;
		}

		const externalSubscriptionId =
			event.original_transaction_id ?? event.transaction_id ?? undefined;
		const externalCustomerId = appUserId;
		const currentPeriodStart = event.purchased_at_ms;
		const currentPeriodEnd = event.expiration_at_ms;
		const eventTimestamp = event.event_timestamp_ms;

		const existingSubscription = await ctx.db
			.query("subscriptions")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.unique();

		let status: "inactive" | "trialing" | "active" | "past_due" | "canceled" =
			"active";
		let canceledAt: number | undefined;

		switch (type) {
			case "INITIAL_PURCHASE": {
				status = event.period_type === "TRIAL" ? "trialing" : "active";
				break;
			}
			case "RENEWAL": {
				status = "active";
				break;
			}
			case "CANCELLATION": {
				const now = eventTimestamp ?? Date.now();
				const isExpired =
					currentPeriodEnd !== undefined && currentPeriodEnd <= now;
				if (isExpired) {
					status = "inactive";
				} else if (
					existingSubscription?.status === "trialing" ||
					event.period_type === "TRIAL"
				) {
					status = "trialing";
				} else {
					status = "active";
				}
				canceledAt = now;
				break;
			}
			case "EXPIRATION": {
				status = "inactive";
				break;
			}
			case "UNCANCELLATION": {
				status = "active";
				canceledAt = undefined;
				break;
			}
			case "BILLING_ISSUE": {
				status = "past_due";
				break;
			}
			case "NON_RENEWING_PURCHASE": {
				status = "active";
				break;
			}
			case "PRODUCT_CHANGE":
			case "SUBSCRIPTION_EXTENDED": {
				status = "active";
				break;
			}
			case "REFUND_REVERSED": {
				status = "active";
				break;
			}
			default:
				await ctx.db.insert("processedWebhookEvents", {
					eventId: event.eventId,
				});
				return;
		}

		const payload = {
			status,
			externalCustomerId,
			externalSubscriptionId,
			currentPeriodStart,
			currentPeriodEnd,
			canceledAt,
		};

		if (existingSubscription) {
			await ctx.db.patch(existingSubscription._id, payload);
		} else {
			await ctx.db.insert("subscriptions", {
				userId,
				...payload,
			});
		}

		await ctx.db.insert("processedWebhookEvents", {
			eventId: event.eventId,
		});
	},
});
