import { StripeSubscriptions } from "@convex-dev/stripe";
import { v } from "convex/values";
import Stripe from "stripe";
import { components } from "./_generated/api";
import { action } from "./_generated/server";

const stripeClient = new StripeSubscriptions(components.stripe, {});

function validateCallbackUrl(url: string, paramName: string): void {
	const siteUrl = process.env.SITE_URL;
	if (!siteUrl) return; // Skip validation in dev when SITE_URL is not set

	let parsedUrl: URL;
	try {
		parsedUrl = new URL(url);
	} catch {
		throw new Error(`Invalid ${paramName}: must be a valid URL`);
	}

	const siteOrigin = new URL(siteUrl).origin;
	if (parsedUrl.origin !== siteOrigin) {
		throw new Error(
			`${paramName} must be on the same origin as the application (${siteOrigin})`,
		);
	}
}

const PLAN_CONFIG = {
	Monthly: {
		priceIdEnv: "STRIPE_MONTHLY_PRICE_ID",
		trialPeriodDays: 7,
	},
	Yearly: {
		priceIdEnv: "STRIPE_YEARLY_PRICE_ID",
		trialPeriodDays: 14,
	},
} as const;

export const createCheckoutSession = action({
	args: {
		plan: v.union(v.literal("Monthly"), v.literal("Yearly")),
		successUrl: v.string(),
		cancelUrl: v.string(),
	},
	handler: async (ctx, args): Promise<string> => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}

		validateCallbackUrl(args.successUrl, "successUrl");
		validateCallbackUrl(args.cancelUrl, "cancelUrl");

		const config = PLAN_CONFIG[args.plan];
		const priceId = process.env[config.priceIdEnv];
		if (!priceId) {
			throw new Error(
				`Missing ${config.priceIdEnv} in Convex environment variables`,
			);
		}

		const customer = await stripeClient.getOrCreateCustomer(ctx, {
			userId: identity.subject,
			email: identity.email ?? undefined,
			name: identity.name ?? undefined,
		});

		const apiKey = process.env.STRIPE_SECRET_KEY;
		if (!apiKey) {
			throw new Error("STRIPE_SECRET_KEY is not set in Convex environment");
		}
		const stripe = new Stripe(apiKey);
		const session = await stripe.checkout.sessions.create({
			mode: "subscription",
			customer: customer.customerId,
			line_items: [
				{
					price: priceId,
					quantity: 1,
				},
			],
			success_url: args.successUrl,
			cancel_url: args.cancelUrl,
			subscription_data: {
				trial_period_days: config.trialPeriodDays,
				metadata: {
					userId: identity.subject,
					plan_slug: "tastik_pro",
				},
			},
		});

		if (!session.url) {
			throw new Error("Failed to create checkout session");
		}

		return session.url;
	},
});

export const createBillingPortalSession = action({
	args: {
		returnUrl: v.string(),
	},
	handler: async (ctx, args): Promise<string> => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}

		validateCallbackUrl(args.returnUrl, "returnUrl");

		const customer = await stripeClient.getOrCreateCustomer(ctx, {
			userId: identity.subject,
			email: identity.email ?? undefined,
			name: identity.name ?? undefined,
		});

		const result = await stripeClient.createCustomerPortalSession(ctx, {
			customerId: customer.customerId,
			returnUrl: args.returnUrl,
		});

		return result.url;
	},
});
