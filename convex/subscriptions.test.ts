import { beforeEach, describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { createTestEnv, type TestIdentity } from "./test.setup";

describe("subscriptions", () => {
	let env: Awaited<ReturnType<typeof createTestEnv>>;
	let asAlice: TestIdentity;
	let userId: Id<"users">;

	beforeEach(async () => {
		env = await createTestEnv();
		asAlice = env.asAlice;

		const user = await asAlice.query(api.users.getCurrentUser, {});
		if (!user) throw new Error("expected Alice user");
		userId = user._id;
	});

	it("treats free_user active subscription as not subscribed", async () => {
		const now = Date.now();
		await env.t.run(async (ctx) => {
			await ctx.db.insert("subscriptions", {
				userId,
				status: "active",
				isActive: false,
				freeTrial: true,
				planSlug: "free_user",
				currentPeriodStart: now,
				currentPeriodEnd: now + 30 * 24 * 60 * 60 * 1000,
			});
		});

		const subscription = await asAlice.query(
			api.subscriptions.getSubscription,
			{},
		);
		const isSubscribed = await asAlice.query(
			api.subscriptions.isSubscribed,
			{},
		);

		expect(subscription.status).toBe("active");
		expect(subscription.freeTrial).toBe(true);
		expect(subscription.planSlug).toBe("free_user");
		expect(subscription.isSubscribed).toBe(false);
		expect(subscription.isTrialing).toBe(false);
		expect(isSubscribed).toBe(false);
	});

	it("treats tastik_pro active subscription as subscribed", async () => {
		const now = Date.now();
		await env.t.run(async (ctx) => {
			await ctx.db.insert("subscriptions", {
				userId,
				status: "active",
				isActive: true,
				freeTrial: false,
				planSlug: "tastik_pro",
				currentPeriodStart: now,
				currentPeriodEnd: now + 30 * 24 * 60 * 60 * 1000,
			});
		});

		const subscription = await asAlice.query(
			api.subscriptions.getSubscription,
			{},
		);
		const isSubscribed = await asAlice.query(
			api.subscriptions.isSubscribed,
			{},
		);

		expect(subscription.status).toBe("active");
		expect(subscription.freeTrial).toBe(false);
		expect(subscription.planSlug).toBe("tastik_pro");
		expect(subscription.isSubscribed).toBe(true);
		expect(subscription.isTrialing).toBe(false);
		expect(isSubscribed).toBe(true);
	});

	it("treats expired currentPeriodEnd with isActive: true as not subscribed", async () => {
		const now = Date.now();
		await env.t.run(async (ctx) => {
			await ctx.db.insert("subscriptions", {
				userId,
				status: "active",
				isActive: true,
				freeTrial: false,
				planSlug: "tastik_pro",
				currentPeriodStart: now - 60 * 24 * 60 * 60 * 1000,
				currentPeriodEnd: now - 1000, // expired
			});
		});

		const subscription = await asAlice.query(
			api.subscriptions.getSubscription,
			{},
		);
		const isSubscribed = await asAlice.query(
			api.subscriptions.isSubscribed,
			{},
		);

		expect(subscription.isSubscribed).toBe(false);
		expect(isSubscribed).toBe(false);
	});

	it("treats isActive: true with free_user plan as not subscribed", async () => {
		const now = Date.now();
		await env.t.run(async (ctx) => {
			await ctx.db.insert("subscriptions", {
				userId,
				status: "active",
				isActive: true,
				freeTrial: false,
				planSlug: "free_user",
				currentPeriodStart: now,
				currentPeriodEnd: now + 30 * 24 * 60 * 60 * 1000,
			});
		});

		const subscription = await asAlice.query(
			api.subscriptions.getSubscription,
			{},
		);
		const isSubscribed = await asAlice.query(
			api.subscriptions.isSubscribed,
			{},
		);

		expect(subscription.isSubscribed).toBe(false);
		expect(isSubscribed).toBe(false);
	});

	it("treats tastik_pro active freeTrial subscription as in trial and subscribed", async () => {
		const now = Date.now();
		await env.t.run(async (ctx) => {
			await ctx.db.insert("subscriptions", {
				userId,
				status: "active",
				isActive: true,
				freeTrial: true,
				planSlug: "tastik_pro",
				currentPeriodStart: now,
				currentPeriodEnd: now + 7 * 24 * 60 * 60 * 1000,
			});
		});

		const subscription = await asAlice.query(
			api.subscriptions.getSubscription,
			{},
		);
		const isSubscribed = await asAlice.query(
			api.subscriptions.isSubscribed,
			{},
		);

		expect(subscription.status).toBe("active");
		expect(subscription.freeTrial).toBe(true);
		expect(subscription.planSlug).toBe("tastik_pro");
		expect(subscription.isSubscribed).toBe(true);
		expect(subscription.isTrialing).toBe(true);
		expect(isSubscribed).toBe(true);
	});
});
