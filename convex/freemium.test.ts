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

describe("freemium rules", () => {
	let env: Awaited<ReturnType<typeof createTestEnv>>;
	let asAlice: TestIdentity;

	beforeEach(async () => {
		env = await createTestEnv();
		asAlice = env.asAlice;
	});

	it("free users cannot create more than 5 lists", async () => {
		const user = await asAlice.query(api.users.getCurrentUser, {});
		if (!user) {
			throw new Error("Expected authenticated user");
		}

		await env.t.run(async (ctx) => {
			for (let i = 0; i < 5; i += 1) {
				await ctx.db.insert("lists", {
					ownerId: user._id,
					name: `List ${i + 1}`,
					type: "simple",
					status: "active",
					sortBy: "created_at",
					sortAscending: true,
					showCompleted: true,
					hideCheckbox: false,
					showTotal: false,
					updatedAt: Date.now(),
				});
			}
		});

		try {
			await asAlice.mutation(api.lists.createList, { name: "List 6" });
			throw new Error("Expected list limit error");
		} catch (error) {
			expectConvexErrorCode(error, ERROR_CODES.LISTS_LIMIT_EXCEEDED);
		}
	});

	it("free users cannot create pro list types", async () => {
		try {
			await asAlice.mutation(api.lists.createList, {
				name: "Kanban Board",
				type: "kanban",
			});
			throw new Error("Expected upgrade required error");
		} catch (error) {
			expectConvexErrorCode(error, ERROR_CODES.UPGRADE_REQUIRED);
		}
	});

	it("free users cannot exceed 50 items per list", async () => {
		await asAlice.mutation(api.lists.createList, { name: "Shopping" });
		const lists = await asAlice.query(api.lists.getUserLists, {});
		const listId = lists[0]?._id;
		if (!listId) {
			throw new Error("Expected list");
		}

		await env.t.run(async (ctx) => {
			for (let i = 0; i < 50; i += 1) {
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

		try {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Item 51",
			});
			throw new Error("Expected item limit error");
		} catch (error) {
			expectConvexErrorCode(error, ERROR_CODES.ITEMS_LIMIT_EXCEEDED);
		}
	});

	it("free users cannot use paid sharing and tags features", async () => {
		await asAlice.mutation(api.lists.createList, { name: "Shared List" });
		const lists = await asAlice.query(api.lists.getUserLists, {});
		const listId = lists[0]?._id;
		if (!listId) {
			throw new Error("Expected list");
		}

		try {
			await asAlice.mutation(api.tags.createTag, { listId, name: "Urgent" });
			throw new Error("Expected upgrade required error for tags");
		} catch (error) {
			expectConvexErrorCode(error, ERROR_CODES.UPGRADE_REQUIRED);
		}

		try {
			await asAlice.mutation(api.listEditors.addListEditorByEmail, {
				listId,
				email: "bob@example.com",
				nickname: "Bob",
			});
			throw new Error("Expected upgrade required error for sharing");
		} catch (error) {
			expectConvexErrorCode(error, ERROR_CODES.UPGRADE_REQUIRED);
		}
	});

	it("downgraded users cannot duplicate lists above free item limits", async () => {
		await seedSubscribedUser(asAlice);
		await asAlice.mutation(api.lists.createList, { name: "Big List" });
		const lists = await asAlice.query(api.lists.getUserLists, {});
		const listId = lists[0]?._id;
		if (!listId) {
			throw new Error("Expected list");
		}

		await env.t.run(async (ctx) => {
			for (let i = 0; i < 51; i += 1) {
				await ctx.db.insert("items", {
					listId,
					name: `Seeded ${i + 1}`,
					type: "simple",
					completed: false,
					sortOrder: i + 1,
					updatedAt: Date.now(),
				});
			}
		});

		const user = await asAlice.query(api.users.getCurrentUser, {});
		if (!user) {
			throw new Error("Expected authenticated user");
		}

		await env.t.run(async (ctx) => {
			const subscription = await ctx.db
				.query("subscriptions")
				.withIndex("by_user", (q) => q.eq("userId", user._id))
				.unique();
			if (!subscription) {
				throw new Error("Expected subscription");
			}
			await ctx.db.patch("subscriptions", subscription._id, {
				status: "inactive",
				isActive: false,
				freeTrial: false,
				planSlug: "free_user",
				currentPeriodEnd: Date.now() - 1_000,
			});
		});

		try {
			await asAlice.mutation(api.lists.duplicateList, { listId });
			throw new Error("Expected item limit error after downgrade");
		} catch (error) {
			expectConvexErrorCode(error, ERROR_CODES.ITEMS_LIMIT_EXCEEDED);
		}
	});
});
