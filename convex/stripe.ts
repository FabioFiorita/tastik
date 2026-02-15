import { StripeSubscriptions } from "@convex-dev/stripe";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { action } from "./_generated/server";

const stripeClient = new StripeSubscriptions(components.stripe, {});

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

		const customer = await stripeClient.getOrCreateCustomer(ctx, {
			userId: identity.subject,
			email: identity.email ?? undefined,
			name: identity.name ?? undefined,
		});

		const result = await stripeClient.createCheckoutSession(ctx, {
			priceId: args.priceId,
			customerId: customer.customerId,
			mode: "subscription",
			successUrl: args.successUrl,
			cancelUrl: args.cancelUrl,
			subscriptionMetadata: {
				userId: identity.subject,
				plan_slug: "tastik_pro",
			},
		});

		if (!result.url) {
			throw new Error("Failed to create checkout session");
		}

		return result.url;
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
