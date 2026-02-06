import { ConvexError } from "convex/values";
import { beforeEach, describe, expect, it } from "vitest";
import { api } from "./_generated/api";
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

	describe("users.deleteAccount", () => {
		it("throws when confirmEmail does not match account email", async () => {
			const aliceUser = await asAlice.query(api.users.getCurrentUser, {});
			if (!aliceUser) throw new Error("expected Alice user");
			await env.t.run(async (ctx) => {
				await ctx.db.patch(aliceUser._id, { email: "alice@example.com" });
			});
			await expect(
				asAlice.mutation(api.users.deleteAccount, {
					confirmEmail: "wrong@example.com",
				}),
			).rejects.toThrow(ConvexError);
		});

		it("deletes user and related data when confirmEmail matches", async () => {
			const aliceUser = await asAlice.query(api.users.getCurrentUser, {});
			if (!aliceUser) throw new Error("expected Alice user");
			const userId = aliceUser._id;
			await env.t.run(async (ctx) => {
				await ctx.db.patch(userId, { email: "alice@example.com" });
			});
			await asAlice.mutation(api.lists.createList, { name: "My List" });
			const lists = await asAlice.query(api.lists.getUserLists, {});
			const listId = lists[0]._id;
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Item",
			});
			await asAlice.mutation(api.users.deleteAccount, {
				confirmEmail: "alice@example.com",
			});
			const userGone = await env.t.run(async (ctx) => {
				const user = await ctx.db.get(userId);
				const listsForUser = await ctx.db
					.query("lists")
					.withIndex("by_owner", (q) => q.eq("ownerId", userId))
					.collect();
				return { user, listsCount: listsForUser.length };
			});
			expect(userGone.user).toBeNull();
			expect(userGone.listsCount).toBe(0);
		});

		it("throws when account has no email", async () => {
			await expect(
				asAlice.mutation(api.users.deleteAccount, {
					confirmEmail: "any@example.com",
				}),
			).rejects.toThrow(ConvexError);
		});
	});
});
