import { beforeEach, describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import {
	createTestEnv,
	seedSubscribedUser,
	type TestIdentity,
} from "./test.setup";

describe("subscriptions", () => {
	let env: Awaited<ReturnType<typeof createTestEnv>>;
	let asAlice: TestIdentity;

	beforeEach(async () => {
		env = await createTestEnv();
		asAlice = env.asAlice;
	});

	it("treats user without subscription as not subscribed", async () => {
		const subscription = await asAlice.query(
			api.subscriptions.getSubscription,
			{},
		);

		expect(subscription.isSubscribed).toBe(false);
		expect(subscription.isTrialing).toBe(false);
		expect(subscription.currentPeriodEnd).toBeUndefined();
	});

	it("treats tastik_pro active subscription as subscribed", async () => {
		await seedSubscribedUser(asAlice);

		const subscription = await asAlice.query(
			api.subscriptions.getSubscription,
			{},
		);

		expect(subscription.isSubscribed).toBe(true);
		expect(subscription.isTrialing).toBe(false);
		expect(subscription.currentPeriodEnd).toBeTypeOf("number");
	});

	it("treats tastik_pro trialing subscription as in trial and subscribed", async () => {
		await env.t.run(async (ctx) => {
			const { components } = await import("./_generated/api");
			await ctx.runMutation(
				components.stripe.private.handleSubscriptionCreated,
				{
					stripeSubscriptionId: `sub_trial_${Date.now()}`,
					stripeCustomerId: "cus_test_clerk_alice_123",
					status: "trialing",
					currentPeriodEnd: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
					cancelAtPeriodEnd: false,
					priceId: "price_tastik_pro",
					metadata: { plan_slug: "tastik_pro", userId: "clerk_alice_123" },
				},
			);
		});

		const subscription = await asAlice.query(
			api.subscriptions.getSubscription,
			{},
		);

		expect(subscription.isSubscribed).toBe(true);
		expect(subscription.isTrialing).toBe(true);
		expect(subscription.currentPeriodEnd).toBeTypeOf("number");
	});
});
