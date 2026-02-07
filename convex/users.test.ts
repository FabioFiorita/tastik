import { beforeEach, describe, expect, it } from "vitest";
import { api, internal } from "./_generated/api";
import {
	createTestEnv,
	seedSubscribedUser,
	type TestIdentity,
} from "./test.setup";

describe("users", () => {
	let env: Awaited<ReturnType<typeof createTestEnv>>;
	let asAlice: TestIdentity;

	beforeEach(async () => {
		env = await createTestEnv();
		asAlice = env.asAlice;
		await seedSubscribedUser(asAlice);
	});

	describe("getCurrentUser", () => {
		it("returns null when not authenticated", async () => {
			const user = await env.t.query(api.users.getCurrentUser, {});
			expect(user).toBeNull();
		});

		it("returns user when authenticated", async () => {
			const user = await asAlice.query(api.users.getCurrentUser, {});
			expect(user).not.toBeNull();
		});
	});

	describe("clerkWebhook.deleteUserData", () => {
		it("deletes user and related data", async () => {
			const aliceUser = await asAlice.query(api.users.getCurrentUser, {});
			if (!aliceUser) throw new Error("expected Alice user");
			const userId = aliceUser._id;

			await asAlice.mutation(api.lists.createList, { name: "My List" });
			const lists = await asAlice.query(api.lists.getUserLists, {});
			const listId = lists[0]._id;
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Item",
			});

			await env.t.mutation(internal.clerkWebhook.deleteUserData, {
				clerkId: aliceUser.clerkId,
			});

			const result = await env.t.run(async (ctx) => {
				const user = await ctx.db.get("users", userId);
				const listsForUser = await ctx.db
					.query("lists")
					.withIndex("by_owner", (q) => q.eq("ownerId", userId))
					.collect();
				return { user, listsCount: listsForUser.length };
			});
			expect(result.user).toBeNull();
			expect(result.listsCount).toBe(0);
		});

		it("does nothing when user not found", async () => {
			await env.t.mutation(internal.clerkWebhook.deleteUserData, {
				clerkId: "nonexistent_clerk_id",
			});
			// Should not throw
		});
	});
});
