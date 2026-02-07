import { v } from "convex/values";
import { Webhook } from "svix";
import { internal } from "./_generated/api";
import { httpAction, internalMutation } from "./_generated/server";
import { normalizeEmail } from "./lib/validation";

// ── Types ────────────────────────────────────────────────────────────

export type ClerkUserEvent = {
	data: {
		id: string;
		email_addresses: Array<{
			email_address: string;
			id: string;
		}>;
		primary_email_address_id: string;
		first_name: string | null;
		last_name: string | null;
		image_url: string | null;
	};
	type: string;
};

export type ClerkDeleteEvent = {
	data: {
		id: string;
	};
	type: string;
};

export type BillingPayer = {
	user_id?: string;
	organization_id?: string;
};

export type BillingPlan = {
	id: string;
	slug: string;
	name: string;
};

export type BillingSubscriptionItemWebhookData = {
	id: string;
	status: string;
	is_free_trial?: boolean | null;
	plan_period: "month" | "annual";
	period_start: number | null;
	period_end?: number | null;
	canceled_at?: number | null;
	plan?: BillingPlan | null;
	plan_id?: string | null;
	payer?: BillingPayer;
};

export type BillingSubscriptionWebhookData = {
	id: string;
	status: string;
	payer_id: string;
	payer: BillingPayer;
	items: BillingSubscriptionItemWebhookData[];
};

export type ClerkBillingEvent = {
	data: BillingSubscriptionWebhookData | BillingSubscriptionItemWebhookData;
	type: string;
};

// ── Helpers ──────────────────────────────────────────────────────────

export function toOptionalNumber(
	value: number | null | undefined,
): number | undefined {
	return value ?? undefined;
}

export function toOptionalBoolean(
	value: boolean | null | undefined,
): boolean | undefined {
	return value ?? undefined;
}

// ── HTTP Action ──────────────────────────────────────────────────────

export const handleClerkWebhook = httpAction(async (ctx, request) => {
	const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
	if (!webhookSecret) {
		return new Response("Webhook secret not configured", { status: 500 });
	}

	const svixId = request.headers.get("svix-id");
	const svixTimestamp = request.headers.get("svix-timestamp");
	const svixSignature = request.headers.get("svix-signature");

	if (!svixId || !svixTimestamp || !svixSignature) {
		return new Response("Missing svix headers", { status: 400 });
	}

	const body = await request.text();

	const wh = new Webhook(webhookSecret);
	let event: ClerkUserEvent | ClerkDeleteEvent | ClerkBillingEvent;
	try {
		event = wh.verify(body, {
			"svix-id": svixId,
			"svix-timestamp": svixTimestamp,
			"svix-signature": svixSignature,
		}) as ClerkUserEvent | ClerkDeleteEvent | ClerkBillingEvent;
	} catch {
		return new Response("Invalid webhook signature", { status: 400 });
	}

	const { type, data } = event;

	if (type === "user.created" || type === "user.updated") {
		const userData = data as ClerkUserEvent["data"];
		const clerkId = userData.id;
		const primaryEmail = userData.email_addresses.find(
			(e) => e.id === userData.primary_email_address_id,
		);
		const email = primaryEmail
			? normalizeEmail(primaryEmail.email_address)
			: undefined;
		const firstName = userData.first_name ?? "";
		const lastName = userData.last_name ?? "";
		const name = `${firstName} ${lastName}`.trim() || undefined;
		const image = userData.image_url ?? undefined;

		await ctx.runMutation(internal.clerkWebhook.upsertUser, {
			clerkId,
			email,
			name,
			image,
		});
	} else if (type === "user.deleted") {
		const clerkId = data.id;
		await ctx.runMutation(internal.clerkWebhook.deleteUserData, {
			clerkId,
		});
	} else if (type.startsWith("subscription.")) {
		const subscriptionData = data as BillingSubscriptionWebhookData;
		const clerkUserId = subscriptionData.payer?.user_id;
		if (!clerkUserId) {
			return new Response(null, { status: 200 });
		}

		const firstItem = subscriptionData.items?.[0];

		await ctx.runMutation(internal.clerkWebhook.handleBillingEvent, {
			eventId: svixId,
			eventType: type,
			clerkUserId,
			clerkSubscriptionId: subscriptionData.id,
			clerkSubscriptionItemId: firstItem?.id,
			planSlug: firstItem?.plan?.slug,
			periodStart: toOptionalNumber(firstItem?.period_start),
			periodEnd: toOptionalNumber(firstItem?.period_end),
			isFreeTrial: toOptionalBoolean(firstItem?.is_free_trial),
		});
	} else if (type.startsWith("subscriptionItem.")) {
		const itemData = data as BillingSubscriptionItemWebhookData;
		const clerkUserId = itemData.payer?.user_id;
		if (!clerkUserId) {
			return new Response(null, { status: 200 });
		}

		await ctx.runMutation(internal.clerkWebhook.handleBillingEvent, {
			eventId: svixId,
			eventType: type,
			clerkUserId,
			clerkSubscriptionItemId: itemData.id,
			planSlug: itemData.plan?.slug,
			periodStart: toOptionalNumber(itemData.period_start),
			periodEnd: toOptionalNumber(itemData.period_end),
			canceledAt: toOptionalNumber(itemData.canceled_at),
			isFreeTrial: toOptionalBoolean(itemData.is_free_trial),
		});
	}

	return new Response(null, { status: 200 });
});

// ── User Mutations ───────────────────────────────────────────────────

export const upsertUser = internalMutation({
	args: {
		clerkId: v.string(),
		email: v.optional(v.string()),
		name: v.optional(v.string()),
		image: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const existingUser = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.unique();

		if (existingUser) {
			await ctx.db.patch("users", existingUser._id, {
				email: args.email,
				name: args.name,
				image: args.image,
				lastSeenAt: Date.now(),
			});
		} else {
			await ctx.db.insert("users", {
				clerkId: args.clerkId,
				email: args.email,
				name: args.name,
				image: args.image,
				termsAcceptedAt: Date.now(),
				lastSeenAt: Date.now(),
			});
		}
	},
});

export const deleteUserData = internalMutation({
	args: { clerkId: v.string() },
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.unique();
		if (!user) return;

		const userId = user._id;

		// Delete owned lists and their related data
		const ownedLists = ctx.db
			.query("lists")
			.withIndex("by_owner", (q) => q.eq("ownerId", userId));
		for await (const list of ownedLists) {
			const items = ctx.db
				.query("items")
				.withIndex("by_list", (q) => q.eq("listId", list._id));
			for await (const item of items) {
				await ctx.db.delete("items", item._id);
			}
			const tags = ctx.db
				.query("listTags")
				.withIndex("by_list", (q) => q.eq("listId", list._id));
			for await (const tag of tags) {
				await ctx.db.delete("listTags", tag._id);
			}
			const editors = ctx.db
				.query("listEditors")
				.withIndex("by_list", (q) => q.eq("listId", list._id));
			for await (const editor of editors) {
				await ctx.db.delete("listEditors", editor._id);
			}
			await ctx.db.delete("lists", list._id);
		}

		// Delete editor entries where this user was added to others' lists
		const editorEntries = ctx.db
			.query("listEditors")
			.withIndex("by_user", (q) => q.eq("userId", userId));
		for await (const entry of editorEntries) {
			await ctx.db.delete("listEditors", entry._id);
		}

		// Delete subscription
		const subscription = await ctx.db
			.query("subscriptions")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.unique();
		if (subscription) {
			await ctx.db.delete("subscriptions", subscription._id);
		}

		// Delete user document
		await ctx.db.delete("users", userId);
	},
});

// ── Billing Mutations ────────────────────────────────────────────────

export const handleBillingEvent = internalMutation({
	args: {
		eventId: v.string(),
		eventType: v.string(),
		clerkUserId: v.string(),
		clerkSubscriptionId: v.optional(v.string()),
		clerkSubscriptionItemId: v.optional(v.string()),
		planSlug: v.optional(v.string()),
		periodStart: v.optional(v.number()),
		periodEnd: v.optional(v.number()),
		canceledAt: v.optional(v.number()),
		isFreeTrial: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		// Idempotency check
		const existing = await ctx.db
			.query("processedWebhookEvents")
			.withIndex("by_event_id", (q) => q.eq("eventId", args.eventId))
			.unique();
		if (existing) return;

		// Find user by Clerk ID
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkUserId))
			.unique();
		if (!user) {
			await ctx.db.insert("processedWebhookEvents", {
				eventId: args.eventId,
			});
			return;
		}

		const userId = user._id;
		const existingSubscription = await ctx.db
			.query("subscriptions")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.unique();

		type SubscriptionStatus = "inactive" | "active" | "past_due" | "canceled";

		let status: SubscriptionStatus | undefined;
		let canceledAt: number | undefined;
		const freeTrial = args.isFreeTrial ?? existingSubscription?.freeTrial;

		switch (args.eventType) {
			// Subscription-level events
			case "subscription.created":
			case "subscription.active": {
				status = "active";
				break;
			}
			case "subscription.pastDue": {
				status = "past_due";
				break;
			}
			// Subscription item events
			case "subscriptionItem.created": {
				status = "active";
				break;
			}
			case "subscriptionItem.active": {
				status = "active";
				break;
			}
			case "subscriptionItem.canceled": {
				// Keep current status until period ends, just record canceledAt
				canceledAt = args.canceledAt ?? Date.now();
				status =
					existingSubscription?.status === "active" ? "active" : "canceled";
				break;
			}
			case "subscriptionItem.ended": {
				status = "inactive";
				break;
			}
			case "subscriptionItem.pastDue": {
				status = "past_due";
				break;
			}
			case "subscriptionItem.abandoned":
			case "subscriptionItem.incomplete": {
				// No subscription change needed
				await ctx.db.insert("processedWebhookEvents", {
					eventId: args.eventId,
				});
				return;
			}
			default: {
				await ctx.db.insert("processedWebhookEvents", {
					eventId: args.eventId,
				});
				return;
			}
		}

		const planSlug = args.planSlug ?? existingSubscription?.planSlug;
		const currentPeriodEnd =
			args.periodEnd ?? existingSubscription?.currentPeriodEnd;

		// Precompute isActive for query efficiency
		const isActive =
			status === "active" &&
			planSlug !== undefined &&
			(currentPeriodEnd === undefined || currentPeriodEnd > Date.now());

		const payload = {
			status,
			isActive,
			freeTrial,
			clerkSubscriptionId:
				args.clerkSubscriptionId ?? existingSubscription?.clerkSubscriptionId,
			clerkSubscriptionItemId:
				args.clerkSubscriptionItemId ??
				existingSubscription?.clerkSubscriptionItemId,
			planSlug,
			currentPeriodStart:
				args.periodStart ?? existingSubscription?.currentPeriodStart,
			currentPeriodEnd,
			canceledAt: canceledAt ?? existingSubscription?.canceledAt,
		};

		if (existingSubscription) {
			await ctx.db.patch("subscriptions", existingSubscription._id, payload);
		} else {
			await ctx.db.insert("subscriptions", {
				userId,
				...payload,
			});
		}

		await ctx.db.insert("processedWebhookEvents", {
			eventId: args.eventId,
		});
	},
});
