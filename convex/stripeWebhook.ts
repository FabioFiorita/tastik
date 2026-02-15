import { v } from "convex/values";
import { internal } from "./_generated/api";
import { httpAction, internalMutation } from "./_generated/server";
import { hasTastikProPlan } from "./lib/subscription";

// ── Types ────────────────────────────────────────────────────────────

type StripeSubscription = {
	id: string;
	customer: string;
	status: string;
	current_period_start: number;
	current_period_end: number;
	cancel_at_period_end: boolean;
	canceled_at: number | null;
	trial_start: number | null;
	trial_end: number | null;
	items: {
		data: Array<{
			price: {
				id: string;
				lookup_key: string | null;
				product: string;
				metadata?: Record<string, string>;
			};
		}>;
	};
	metadata?: Record<string, string>;
};

type StripeCheckoutSession = {
	id: string;
	subscription: string | null;
	customer: string | null;
	client_reference_id: string | null;
	metadata?: Record<string, string>;
};

type StripeEvent = {
	id: string;
	type: string;
	data: {
		object: StripeSubscription | StripeCheckoutSession;
	};
};

// ── Helpers ──────────────────────────────────────────────────────────

async function verifyStripeSignature(
	body: string,
	signature: string,
	secret: string,
): Promise<StripeEvent> {
	// Stripe webhook signature verification using the raw HMAC approach
	// Format: t=timestamp,v1=signature
	const parts = signature.split(",");
	const timestampPart = parts.find((p) => p.startsWith("t="));
	const signaturePart = parts.find((p) => p.startsWith("v1="));

	if (!timestampPart || !signaturePart) {
		throw new Error("Invalid signature format");
	}

	const timestamp = timestampPart.slice(2);
	const expectedSignature = signaturePart.slice(3);

	// Check timestamp tolerance (5 minutes)
	const currentTime = Math.floor(Date.now() / 1000);
	if (Math.abs(currentTime - Number.parseInt(timestamp, 10)) > 300) {
		throw new Error("Webhook timestamp too old");
	}

	// Compute expected signature
	const signedPayload = `${timestamp}.${body}`;
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signatureBuffer = await crypto.subtle.sign(
		"HMAC",
		key,
		encoder.encode(signedPayload),
	);

	const computedSignature = Array.from(new Uint8Array(signatureBuffer))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	if (computedSignature !== expectedSignature) {
		throw new Error("Invalid webhook signature");
	}

	return JSON.parse(body) as StripeEvent;
}

/**
 * Extract the plan slug from a Stripe subscription.
 * We use price lookup_key or product metadata to map to our internal plan slug.
 */
function extractPlanSlug(subscription: StripeSubscription): string {
	const item = subscription.items.data[0];
	if (!item) return "";

	// Check price lookup_key first (recommended Stripe pattern)
	if (item.price.lookup_key === "tastik_pro") {
		return "tastik_pro";
	}

	// Check price metadata
	if (item.price.metadata?.plan_slug) {
		return item.price.metadata.plan_slug;
	}

	// Check subscription metadata
	if (subscription.metadata?.plan_slug) {
		return subscription.metadata.plan_slug;
	}

	// Default: any active Stripe subscription is tastik_pro
	return "tastik_pro";
}

// ── HTTP Action ──────────────────────────────────────────────────────

export const handleStripeWebhook = httpAction(async (ctx, request) => {
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
	if (!webhookSecret) {
		return new Response("Webhook secret not configured", { status: 500 });
	}

	const signature = request.headers.get("stripe-signature");
	if (!signature) {
		return new Response("Missing stripe-signature header", { status: 400 });
	}

	const body = await request.text();

	let event: StripeEvent;
	try {
		event = await verifyStripeSignature(body, signature, webhookSecret);
	} catch {
		return new Response("Invalid webhook signature", { status: 400 });
	}

	const { type } = event;

	if (type === "checkout.session.completed") {
		const session = event.data.object as StripeCheckoutSession;
		// client_reference_id is the Clerk user ID we pass when creating the checkout
		const clerkUserId = session.client_reference_id;
		if (!clerkUserId || !session.subscription) {
			return new Response(null, { status: 200 });
		}

		// The subscription events will handle the actual subscription creation.
		// This event just confirms checkout completed successfully.
		return new Response(null, { status: 200 });
	}

	if (type.startsWith("customer.subscription.")) {
		const subscription = event.data.object as StripeSubscription;

		// We need the Clerk user ID. We store it in subscription metadata
		// when creating the checkout session.
		const clerkUserId =
			subscription.metadata?.clerk_user_id ?? subscription.metadata?.user_id;

		if (!clerkUserId) {
			// Can't process without user mapping
			return new Response(null, { status: 200 });
		}

		const planSlug = extractPlanSlug(subscription);
		const isFreeTrial =
			subscription.trial_end !== null &&
			subscription.trial_end > Math.floor(Date.now() / 1000);

		await ctx.runMutation(
			internal.stripeWebhook.handleStripeSubscriptionEvent,
			{
				eventId: event.id,
				eventType: type,
				clerkUserId,
				stripeSubscriptionId: subscription.id,
				stripeCustomerId: subscription.customer,
				planSlug,
				status: subscription.status,
				currentPeriodStart: subscription.current_period_start * 1000,
				currentPeriodEnd: subscription.current_period_end * 1000,
				canceledAt: subscription.canceled_at
					? subscription.canceled_at * 1000
					: undefined,
				isFreeTrial,
			},
		);
	}

	return new Response(null, { status: 200 });
});

// ── Mutation ─────────────────────────────────────────────────────────

export const handleStripeSubscriptionEvent = internalMutation({
	args: {
		eventId: v.string(),
		eventType: v.string(),
		clerkUserId: v.string(),
		stripeSubscriptionId: v.string(),
		stripeCustomerId: v.string(),
		planSlug: v.string(),
		status: v.string(),
		currentPeriodStart: v.number(),
		currentPeriodEnd: v.number(),
		canceledAt: v.optional(v.number()),
		isFreeTrial: v.boolean(),
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

		// Map Stripe status to our internal status
		type SubscriptionStatus = "inactive" | "active" | "past_due" | "canceled";
		let internalStatus: SubscriptionStatus;

		switch (args.status) {
			case "active":
			case "trialing": {
				internalStatus = "active";
				break;
			}
			case "past_due": {
				internalStatus = "past_due";
				break;
			}
			case "canceled":
			case "unpaid":
			case "incomplete_expired": {
				internalStatus = "canceled";
				break;
			}
			default: {
				// incomplete, paused, etc. — treat as inactive
				internalStatus = "inactive";
				break;
			}
		}

		// Precompute isActive for query efficiency
		const isActive =
			internalStatus === "active" &&
			hasTastikProPlan(args.planSlug) &&
			args.currentPeriodEnd > Date.now();

		const payload = {
			status: internalStatus,
			isActive,
			freeTrial: args.isFreeTrial,
			provider: "stripe" as const,
			providerSubscriptionId: args.stripeSubscriptionId,
			planSlug: args.planSlug,
			currentPeriodStart: args.currentPeriodStart,
			currentPeriodEnd: args.currentPeriodEnd,
			canceledAt: args.canceledAt ?? existingSubscription?.canceledAt,
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
