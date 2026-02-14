import { beforeEach, describe, expect, it } from "vitest";
import { api, internal } from "./_generated/api";
import type { BillingSubscriptionItemWebhookData } from "./clerkWebhook";
import {
	findBestSubscriptionItem,
	toOptionalBoolean,
	toOptionalNumber,
} from "./clerkWebhook";
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

		it("updates subscription correctly on subscription.updated with active status", async () => {
			const now = Date.now();

			// First, create a canceled subscription
			await env.t.mutation(internal.clerkWebhook.handleBillingEvent, {
				eventId: "evt_canceled",
				eventType: "subscriptionItem.canceled",
				clerkUserId: "clerk_alice_123",
				clerkSubscriptionId: "sub_123",
				clerkSubscriptionItemId: "item_123",
				planSlug: "tastik_pro",
				periodStart: now,
				periodEnd: now + 30 * 24 * 60 * 60 * 1000,
				canceledAt: now,
			});

			// Now re-subscribe via subscription.updated with active status
			await env.t.mutation(internal.clerkWebhook.handleBillingEvent, {
				eventId: "evt_resubscribed",
				eventType: "subscription.updated",
				clerkUserId: "clerk_alice_123",
				clerkSubscriptionId: "sub_123",
				clerkSubscriptionItemId: "item_456",
				planSlug: "tastik_pro",
				periodStart: now,
				periodEnd: now + 30 * 24 * 60 * 60 * 1000,
				subscriptionStatus: "active",
			});

			const subscription = await asAlice.query(
				api.subscriptions.getSubscription,
				{},
			);

			expect(subscription.status).toBe("active");
			expect(subscription.isSubscribed).toBe(true);
		});

		it("sets past_due status on subscription.updated with past_due", async () => {
			const now = Date.now();

			await env.t.mutation(internal.clerkWebhook.handleBillingEvent, {
				eventId: "evt_past_due",
				eventType: "subscription.updated",
				clerkUserId: "clerk_alice_123",
				clerkSubscriptionId: "sub_123",
				clerkSubscriptionItemId: "item_123",
				planSlug: "tastik_pro",
				periodStart: now,
				periodEnd: now + 30 * 24 * 60 * 60 * 1000,
				subscriptionStatus: "past_due",
			});

			const subscription = await asAlice.query(
				api.subscriptions.getSubscription,
				{},
			);

			expect(subscription.status).toBe("past_due");
			expect(subscription.isSubscribed).toBe(false);
		});

		it("sets inactive status on subscriptionItem.expired", async () => {
			const now = Date.now();

			// Create an active trial first
			await env.t.mutation(internal.clerkWebhook.handleBillingEvent, {
				eventId: "evt_trial",
				eventType: "subscriptionItem.active",
				clerkUserId: "clerk_alice_123",
				clerkSubscriptionItemId: "item_trial",
				planSlug: "tastik_pro",
				periodStart: now,
				periodEnd: now + 7 * 24 * 60 * 60 * 1000,
				isFreeTrial: true,
			});

			// Trial expired without conversion
			await env.t.mutation(internal.clerkWebhook.handleBillingEvent, {
				eventId: "evt_expired",
				eventType: "subscriptionItem.expired",
				clerkUserId: "clerk_alice_123",
				clerkSubscriptionItemId: "item_trial",
				planSlug: "tastik_pro",
				periodStart: now,
				periodEnd: now + 7 * 24 * 60 * 60 * 1000,
			});

			const subscription = await asAlice.query(
				api.subscriptions.getSubscription,
				{},
			);

			expect(subscription.status).toBe("inactive");
			expect(subscription.isSubscribed).toBe(false);
		});

		it("preserves existing status on subscriptionItem.updated", async () => {
			const now = Date.now();

			// Create an active subscription first
			await env.t.mutation(internal.clerkWebhook.handleBillingEvent, {
				eventId: "evt_active",
				eventType: "subscriptionItem.active",
				clerkUserId: "clerk_alice_123",
				clerkSubscriptionItemId: "item_123",
				planSlug: "tastik_pro",
				periodStart: now,
				periodEnd: now + 30 * 24 * 60 * 60 * 1000,
			});

			// Metadata update (e.g. plan period change)
			await env.t.mutation(internal.clerkWebhook.handleBillingEvent, {
				eventId: "evt_updated",
				eventType: "subscriptionItem.updated",
				clerkUserId: "clerk_alice_123",
				clerkSubscriptionItemId: "item_123",
				planSlug: "tastik_pro",
				periodStart: now,
				periodEnd: now + 365 * 24 * 60 * 60 * 1000,
			});

			const subscription = await asAlice.query(
				api.subscriptions.getSubscription,
				{},
			);

			expect(subscription.status).toBe("active");
			expect(subscription.isSubscribed).toBe(true);
		});

		it("does not set isActive for free_user plan", async () => {
			const now = Date.now();

			await env.t.mutation(internal.clerkWebhook.handleBillingEvent, {
				eventId: "evt_free_user",
				eventType: "subscriptionItem.active",
				clerkUserId: "clerk_alice_123",
				clerkSubscriptionItemId: "item_free",
				planSlug: "free_user",
				periodStart: now,
				periodEnd: now + 30 * 24 * 60 * 60 * 1000,
			});

			const subscription = await asAlice.query(
				api.subscriptions.getSubscription,
				{},
			);

			expect(subscription.status).toBe("active");
			expect(subscription.isSubscribed).toBe(false);
		});
	});

	describe("findBestSubscriptionItem", () => {
		const makeItem = (
			overrides: Partial<BillingSubscriptionItemWebhookData>,
		): BillingSubscriptionItemWebhookData => ({
			id: "item_default",
			status: "active",
			plan_period: "month" as const,
			period_start: Date.now(),
			...overrides,
		});

		it("returns undefined for empty array", () => {
			expect(findBestSubscriptionItem([])).toBeUndefined();
		});

		it("returns the only item for single-element array", () => {
			const item = makeItem({ id: "only" });
			expect(findBestSubscriptionItem([item])).toBe(item);
		});

		it("prefers active paid item over active free item", () => {
			const freeItem = makeItem({
				id: "free",
				status: "active",
				plan: { id: "plan_free", slug: "free_user", name: "Free" },
			});
			const proItem = makeItem({
				id: "pro",
				status: "active",
				plan: { id: "plan_pro", slug: "tastik_pro", name: "Pro" },
			});

			const result = findBestSubscriptionItem([freeItem, proItem]);
			expect(result?.id).toBe("pro");
		});

		it("prefers active item over ended paid item", () => {
			const endedPro = makeItem({
				id: "ended_pro",
				status: "ended",
				plan: { id: "plan_pro", slug: "tastik_pro", name: "Pro" },
			});
			const activeFree = makeItem({
				id: "active_free",
				status: "active",
				plan: { id: "plan_free", slug: "free_user", name: "Free" },
			});

			const result = findBestSubscriptionItem([endedPro, activeFree]);
			expect(result?.id).toBe("active_free");
		});

		it("prefers active paid item over ended paid item", () => {
			const endedPro = makeItem({
				id: "ended",
				status: "ended",
				plan: { id: "plan_pro", slug: "tastik_pro", name: "Pro" },
				period_start: Date.now() + 1000,
			});
			const activePro = makeItem({
				id: "active",
				status: "active",
				plan: { id: "plan_pro", slug: "tastik_pro", name: "Pro" },
				period_start: Date.now(),
			});

			const result = findBestSubscriptionItem([endedPro, activePro]);
			expect(result?.id).toBe("active");
		});
	});
});
