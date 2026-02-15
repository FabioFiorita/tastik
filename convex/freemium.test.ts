import { ConvexError } from "convex/values";
import { beforeEach, describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import { ERROR_CODES, isAppErrorData } from "./lib/errors";
import {
	createTestEnv,
	seedSubscribedUser,
	type TestIdentity,
} from "./test.setup";

function getAppErrorData(error: unknown) {
	if (!(error instanceof ConvexError)) {
		return null;
	}

	if (typeof error.data === "string") {
		try {
			const parsed = JSON.parse(error.data) as unknown;
			if (isAppErrorData(parsed)) {
				return parsed;
			}
		} catch {
			return null;
		}
	}

	if (isAppErrorData(error.data)) {
		return error.data;
	}

	if (
		typeof error.data === "object" &&
		error.data !== null &&
		"data" in error.data
	) {
		const nestedData = (error.data as { data?: unknown }).data;
		if (isAppErrorData(nestedData)) {
			return nestedData;
		}
	}

	if (
		typeof error.data === "object" &&
		error.data !== null &&
		"errorData" in error.data
	) {
		const nestedData = (error.data as { errorData?: unknown }).errorData;
		if (isAppErrorData(nestedData)) {
			return nestedData;
		}
	}

	return null;
}

function expectConvexErrorCode(error: unknown, code: string) {
	expect(error).toBeInstanceOf(ConvexError);
	const appErrorData = getAppErrorData(error);
	expect(appErrorData).not.toBeNull();
	if (!appErrorData) {
		return;
	}
	expect(appErrorData.code).toBe(code);
}

describe("hard paywall", () => {
	let env: Awaited<ReturnType<typeof createTestEnv>>;
	let asAlice: TestIdentity;

	beforeEach(async () => {
		env = await createTestEnv();
		asAlice = env.asAlice;
	});

	it("unsubscribed users cannot create lists", async () => {
		try {
			await asAlice.mutation(api.lists.createList, { name: "My List" });
			throw new Error("Expected subscription required error");
		} catch (error) {
			expectConvexErrorCode(error, ERROR_CODES.SUBSCRIPTION_REQUIRED);
		}
	});

	it("unsubscribed users cannot create items", async () => {
		// Seed a list directly in DB (bypassing mutation checks)
		await seedSubscribedUser(asAlice);
		await asAlice.mutation(api.lists.createList, { name: "Shopping" });
		const lists = await asAlice.query(api.lists.getUserLists, {});
		const listId = lists[0]?._id;
		if (!listId) {
			throw new Error("Expected list");
		}

		// Expire the subscription
		const user = await asAlice.query(api.users.getCurrentUser, {});
		if (!user) throw new Error("Expected user");
		await env.t.run(async (ctx) => {
			const subscription = await ctx.db
				.query("subscriptions")
				.withIndex("by_user", (q) => q.eq("userId", user._id))
				.unique();
			if (!subscription) throw new Error("Expected subscription");
			await ctx.db.patch("subscriptions", subscription._id, {
				status: "inactive",
				isActive: false,
				planSlug: "tastik_pro",
				currentPeriodEnd: Date.now() - 1_000,
			});
		});

		try {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Item 1",
			});
			throw new Error("Expected subscription expired error");
		} catch (error) {
			expectConvexErrorCode(error, ERROR_CODES.SUBSCRIPTION_EXPIRED);
		}
	});

	it("subscribed users can create lists of any type", async () => {
		await seedSubscribedUser(asAlice);

		const kanbanId = await asAlice.mutation(api.lists.createList, {
			name: "Kanban Board",
			type: "kanban",
		});
		expect(kanbanId).toBeDefined();

		const stepperId = await asAlice.mutation(api.lists.createList, {
			name: "Stepper List",
			type: "stepper",
		});
		expect(stepperId).toBeDefined();

		const multiId = await asAlice.mutation(api.lists.createList, {
			name: "Multi List",
			type: "multi",
		});
		expect(multiId).toBeDefined();
	});

	it("subscribed users can create items up to 500 limit", async () => {
		await seedSubscribedUser(asAlice);
		await asAlice.mutation(api.lists.createList, { name: "Big List" });
		const lists = await asAlice.query(api.lists.getUserLists, {});
		const listId = lists[0]?._id;
		if (!listId) {
			throw new Error("Expected list");
		}

		// Seed 500 items directly
		await env.t.run(async (ctx) => {
			for (let i = 0; i < 500; i += 1) {
				await ctx.db.insert("items", {
					listId,
					name: `Item ${i + 1}`,
					type: "simple",
					completed: false,
					sortOrder: i + 1,
					updatedAt: Date.now(),
				});
			}
		});

		// 501st item should fail
		try {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Item 501",
			});
			throw new Error("Expected item limit error");
		} catch (error) {
			expectConvexErrorCode(error, ERROR_CODES.ITEMS_LIMIT_EXCEEDED);
		}
	});

	it("expired subscription blocks all mutations", async () => {
		await seedSubscribedUser(asAlice);
		const user = await asAlice.query(api.users.getCurrentUser, {});
		if (!user) throw new Error("Expected user");

		// Expire the subscription
		await env.t.run(async (ctx) => {
			const subscription = await ctx.db
				.query("subscriptions")
				.withIndex("by_user", (q) => q.eq("userId", user._id))
				.unique();
			if (!subscription) throw new Error("Expected subscription");
			await ctx.db.patch("subscriptions", subscription._id, {
				status: "inactive",
				isActive: false,
				planSlug: "tastik_pro",
				currentPeriodEnd: Date.now() - 1_000,
			});
		});

		try {
			await asAlice.mutation(api.lists.createList, { name: "New List" });
			throw new Error("Expected subscription expired error");
		} catch (error) {
			expectConvexErrorCode(error, ERROR_CODES.SUBSCRIPTION_EXPIRED);
		}
	});
});
