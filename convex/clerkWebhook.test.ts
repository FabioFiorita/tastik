import { beforeEach, describe, expect, it } from "vitest";
import { api, internal } from "./_generated/api";
import { toOptionalBoolean, toOptionalNumber } from "./clerkWebhook";
import { createTestEnv, type TestIdentity } from "./test.setup";

describe("clerkWebhook", () => {
	describe("toOptionalNumber", () => {
		it("returns undefined for null and undefined", () => {
			expect(toOptionalNumber(null)).toBeUndefined();
			expect(toOptionalNumber(undefined)).toBeUndefined();
		});

		it("returns the original number when provided", () => {
			expect(toOptionalNumber(123)).toBe(123);
		});
	});

	describe("toOptionalBoolean", () => {
		it("returns undefined for null and undefined", () => {
			expect(toOptionalBoolean(null)).toBeUndefined();
			expect(toOptionalBoolean(undefined)).toBeUndefined();
		});

		it("returns the original boolean when provided", () => {
			expect(toOptionalBoolean(true)).toBe(true);
			expect(toOptionalBoolean(false)).toBe(false);
		});
	});

	describe("handleBillingEvent", () => {
		let env: Awaited<ReturnType<typeof createTestEnv>>;
		let asAlice: TestIdentity;

		beforeEach(async () => {
			env = await createTestEnv();
			asAlice = env.asAlice;
		});

		it("keeps active status and marks freeTrial for subscription.active free trial events", async () => {
			const now = Date.now();

			await env.t.mutation(internal.clerkWebhook.handleBillingEvent, {
				eventId: "evt_subscription_active_trial",
				eventType: "subscription.active",
				clerkUserId: "clerk_alice_123",
				clerkSubscriptionId: "sub_trial",
				clerkSubscriptionItemId: "item_trial",
				planSlug: "tastik_pro",
				periodStart: now,
				periodEnd: now + 7 * 24 * 60 * 60 * 1000,
				isFreeTrial: true,
			});

			const subscription = await asAlice.query(
				api.subscriptions.getSubscription,
				{},
			);

			expect(subscription.status).toBe("active");
			expect(subscription.freeTrial).toBe(true);
			expect(subscription.isTrialing).toBe(true);
		});

		it("keeps active status and marks freeTrial for subscriptionItem.active free trial events", async () => {
			const now = Date.now();

			await env.t.mutation(internal.clerkWebhook.handleBillingEvent, {
				eventId: "evt_subscription_item_active_trial",
				eventType: "subscriptionItem.active",
				clerkUserId: "clerk_alice_123",
				clerkSubscriptionItemId: "item_trial_active",
				planSlug: "tastik_pro",
				periodStart: now,
				periodEnd: now + 7 * 24 * 60 * 60 * 1000,
				isFreeTrial: true,
			});

			const subscription = await asAlice.query(
				api.subscriptions.getSubscription,
				{},
			);

			expect(subscription.status).toBe("active");
			expect(subscription.freeTrial).toBe(true);
			expect(subscription.isTrialing).toBe(true);
		});

		it("transitions freeTrial active subscription to paid active", async () => {
			const now = Date.now();

			await env.t.mutation(internal.clerkWebhook.handleBillingEvent, {
				eventId: "evt_trial_started",
				eventType: "subscription.active",
				clerkUserId: "clerk_alice_123",
				clerkSubscriptionId: "sub_123",
				clerkSubscriptionItemId: "item_123",
				planSlug: "tastik_pro",
				periodStart: now,
				periodEnd: now + 7 * 24 * 60 * 60 * 1000,
				isFreeTrial: true,
			});

			await env.t.mutation(internal.clerkWebhook.handleBillingEvent, {
				eventId: "evt_paid_started",
				eventType: "subscription.active",
				clerkUserId: "clerk_alice_123",
				clerkSubscriptionId: "sub_123",
				clerkSubscriptionItemId: "item_123",
				planSlug: "tastik_pro",
				periodStart: now + 7 * 24 * 60 * 60 * 1000,
				periodEnd: now + 37 * 24 * 60 * 60 * 1000,
				isFreeTrial: false,
			});

			const subscription = await asAlice.query(
				api.subscriptions.getSubscription,
				{},
			);

			expect(subscription.status).toBe("active");
			expect(subscription.freeTrial).toBe(false);
			expect(subscription.isTrialing).toBe(false);
			expect(subscription.isSubscribed).toBe(true);
		});
	});
});
