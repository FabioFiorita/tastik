import { v } from "convex/values";
import { action } from "./_generated/server";

const STRIPE_API_BASE = "https://api.stripe.com/v1";

async function stripePost(
	path: string,
	params: Record<string, string>,
): Promise<Record<string, unknown>> {
	const apiKey = process.env.STRIPE_SECRET_KEY;
	if (!apiKey) {
		throw new Error("STRIPE_SECRET_KEY not configured");
	}

	const response = await fetch(`${STRIPE_API_BASE}${path}`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams(params).toString(),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Stripe API error: ${response.status} ${error}`);
	}

	return (await response.json()) as Record<string, unknown>;
}

async function stripeGet(path: string): Promise<Record<string, unknown>> {
	const apiKey = process.env.STRIPE_SECRET_KEY;
	if (!apiKey) {
		throw new Error("STRIPE_SECRET_KEY not configured");
	}

	const response = await fetch(`${STRIPE_API_BASE}${path}`, {
		headers: {
			Authorization: `Bearer ${apiKey}`,
		},
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Stripe API error: ${response.status} ${error}`);
	}

	return (await response.json()) as Record<string, unknown>;
}

/**
 * Create a Stripe Checkout session for subscribing to Tastik Pro.
 * Returns the checkout URL to redirect the user to.
 */
export const createCheckoutSession = action({
	args: {
		priceId: v.string(),
		successUrl: v.string(),
		cancelUrl: v.string(),
	},
	handler: async (ctx, args): Promise<string> => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}

		const clerkUserId = identity.subject;

		const params: Record<string, string> = {
			mode: "subscription",
			"line_items[0][price]": args.priceId,
			"line_items[0][quantity]": "1",
			success_url: args.successUrl,
			cancel_url: args.cancelUrl,
			client_reference_id: clerkUserId,
			"subscription_data[metadata][clerk_user_id]": clerkUserId,
		};

		// Pre-fill customer email if available
		if (identity.email) {
			params.customer_email = identity.email;
		}

		const session = await stripePost("/checkout/sessions", params);
		const url = session.url as string;

		if (!url) {
			throw new Error("Failed to create checkout session");
		}

		return url;
	},
});

/**
 * Create a Stripe Billing Portal session for managing subscription.
 * Returns the portal URL to redirect the user to.
 */
export const createBillingPortalSession = action({
	args: {
		returnUrl: v.string(),
	},
	handler: async (ctx, args): Promise<string> => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}

		const email = identity.email;
		if (!email) {
			throw new Error("User email not found");
		}

		// Find the Stripe customer by email
		const customers = (await stripeGet(
			`/customers?email=${encodeURIComponent(email)}&limit=1`,
		)) as { data: Array<{ id: string }> };

		const customer = customers.data[0];
		if (!customer) {
			throw new Error("No Stripe customer found");
		}

		const session = await stripePost("/billing_portal/sessions", {
			customer: customer.id,
			return_url: args.returnUrl,
		});

		const url = session.url as string;
		if (!url) {
			throw new Error("Failed to create billing portal session");
		}

		return url;
	},
});
