import { components } from "./_generated/api";
import { query } from "./_generated/server";
import { isComponentSubscriptionActive } from "./lib/subscription";

export const getSubscription = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();

		if (!identity) {
			return {
				isSubscribed: false,
				isTrialing: false,
				currentPeriodEnd: undefined,
			};
		}

		const subs = await ctx.runQuery(
			components.stripe.public.listSubscriptionsByUserId,
			{ userId: identity.subject },
		);

		const now = Math.floor(Date.now() / 1000);
		const activeSub = subs
			.filter((sub) => isComponentSubscriptionActive(sub, now))
			.sort((a, b) => b.currentPeriodEnd - a.currentPeriodEnd)[0];

		if (!activeSub) {
			return {
				isSubscribed: false,
				isTrialing: false,
				currentPeriodEnd: undefined,
			};
		}

		const isTrialing = activeSub.status === "trialing";

		return {
			isSubscribed: true,
			isTrialing,
			currentPeriodEnd: activeSub.currentPeriodEnd * 1000,
		};
	},
});
