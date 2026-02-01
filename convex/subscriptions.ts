import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { z } from "zod";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
	action,
	internalMutation,
	internalQuery,
	query,
} from "./_generated/server";
import { appError } from "./lib/errors";
import { requireAuth } from "./lib/permissions";

const revenueCatListSubscriptionsSchema = z.object({
	object: z.string().optional(),
	items: z
		.array(
			z.object({
				id: z.string(),
				store_subscription_identifier: z
					.union([z.string(), z.number()])
					.optional(),
			}),
		)
		.optional(),
	next_page: z.string().nullable().optional(),
});

const revenueCatManagementUrlSchema = z.object({
	object: z.string().optional(),
	management_url: z.string().optional(),
});

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

export const getSubscriptionByUserId = internalQuery({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("subscriptions")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.unique();
	},
});

export const getManagementUrl = action({
	args: {},
	returns: v.union(v.string(), v.null()),
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new ConvexError(appError("NOT_AUTHENTICATED", "Not authenticated"));
		}
		const subscription = await ctx.runQuery(
			internal.subscriptions.getSubscriptionByUserId,
			{ userId },
		);
		const transactionId = subscription?.externalTransactionId;
		if (!transactionId || !subscription?.externalCustomerId) {
			return null;
		}
		const apiSecret = process.env.REVENUECAT_API_SECRET?.trim();
		const projectId = process.env.REVENUECAT_PROJECT_ID?.trim();
		const environment =
			process.env.REVENUECAT_ENVIRONMENT?.trim() === "sandbox"
				? "sandbox"
				: "production";
		if (!apiSecret || !projectId) {
			throw new ConvexError(
				appError("SUBSCRIPTION_NOT_FOUND", "Billing portal is not configured"),
			);
		}
		const customerId = subscription.externalCustomerId;
		const baseUrl = "https://api.revenuecat.com";
		const headers = { Authorization: `Bearer ${apiSecret}` };
		let listUrl: string | null =
			`${baseUrl}/v2/projects/${projectId}/customers/${customerId}/subscriptions?environment=${environment}&limit=5`;
		let revenueCatSubscriptionId: string | null = null;
		while (listUrl) {
			const listResponse = await fetch(listUrl, { headers });
			if (!listResponse.ok) {
				const message =
					listResponse.status === 401
						? "Invalid RevenueCat API secret. Use a Secret API key (sk_...) from Project settings → API keys."
						: `Billing portal request failed: ${listResponse.status}`;
				throw new ConvexError(appError("SUBSCRIPTION_NOT_FOUND", message));
			}
			const listJson = await listResponse.json();
			const listParse = revenueCatListSubscriptionsSchema.safeParse(listJson);
			if (!listParse.success) {
				throw new ConvexError(
					appError(
						"SUBSCRIPTION_NOT_FOUND",
						"Invalid response from RevenueCat subscriptions list",
					),
				);
			}
			const listBody = listParse.data;
			const items = listBody.items ?? [];
			for (const item of items) {
				const storeId = item.store_subscription_identifier;
				if (storeId != null && String(storeId) === String(transactionId)) {
					revenueCatSubscriptionId = item.id;
					break;
				}
			}
			if (revenueCatSubscriptionId) break;
			const nextPage = listBody.next_page;
			listUrl = nextPage ? `${baseUrl}${nextPage}` : null;
		}
		if (!revenueCatSubscriptionId) {
			return null;
		}
		const managementUrl = `https://api.revenuecat.com/v2/projects/${projectId}/subscriptions/${revenueCatSubscriptionId}/authenticated_management_url`;
		const mgmtResponse = await fetch(managementUrl, { headers });
		if (!mgmtResponse.ok) {
			const message =
				mgmtResponse.status === 401
					? "Invalid RevenueCat API secret. Use a Secret API key (sk_...) from Project settings → API keys."
					: `Billing portal request failed: ${mgmtResponse.status}`;
			throw new ConvexError(appError("SUBSCRIPTION_NOT_FOUND", message));
		}
		const mgmtJson = await mgmtResponse.json();
		const mgmtParse = revenueCatManagementUrlSchema.safeParse(mgmtJson);
		if (!mgmtParse.success) {
			throw new ConvexError(
				appError(
					"SUBSCRIPTION_NOT_FOUND",
					"Invalid response from RevenueCat management URL",
				),
			);
		}
		return mgmtParse.data.management_url ?? null;
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

		const externalTransactionId =
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
			externalTransactionId,
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
