import { vi } from "vitest";
import { api, internal } from "../_generated/api";
import type { MutationCtx } from "../_generated/server";
import schema from "../schema";
import { createConvexTest } from "./test.setup";

const modules = import.meta.glob("../**/*.ts");

describe("users", () => {
	describe("ensureCurrentUser", () => {
		it("creates a profile when one does not exist", async () => {
			vi.useFakeTimers();
			const t = createConvexTest(schema, modules);
			const userId = "user-ensure-1";
			const asUser = t.withIdentity({ subject: userId });

			const profile = await asUser.mutation(api.users.ensureCurrentUser, {});
			expect(profile).not.toBeNull();
			expect(profile?.userId).toBe(userId);

			vi.runAllTimers();
			await t.finishInProgressScheduledFunctions();
			vi.useRealTimers();
		});

		it("returns the existing profile if one already exists", async () => {
			vi.useFakeTimers();
			const t = createConvexTest(schema, modules);
			const userId = "user-ensure-2";
			const asUser = t.withIdentity({ subject: userId });

			const first = await asUser.mutation(api.users.ensureCurrentUser, {});
			const second = await asUser.mutation(api.users.ensureCurrentUser, {});

			expect(first?._id).toBe(second?._id);

			vi.runAllTimers();
			await t.finishInProgressScheduledFunctions();
			vi.useRealTimers();
		});

		it("returns null for unauthenticated caller", async () => {
			const t = createConvexTest(schema, modules);
			const result = await t.mutation(api.users.ensureCurrentUser, {});
			expect(result).toBeNull();
		});

		it("returns the full profile object, not just the ID", async () => {
			vi.useFakeTimers();
			const t = createConvexTest(schema, modules);
			const userId = "user-ensure-3";
			const asUser = t.withIdentity({ subject: userId });

			const profile = await asUser.mutation(api.users.ensureCurrentUser, {});
			expect(profile).toMatchObject({ userId, lastSeenAt: expect.any(Number) });
			expect(typeof profile?._id).toBe("string");

			vi.runAllTimers();
			await t.finishInProgressScheduledFunctions();
			vi.useRealTimers();
		});
	});

	describe("deleteUserData", () => {
		it("removes all lists, items, tags, editors, profile, and profile image", async () => {
			const t = createConvexTest(schema, modules);
			const userId = "user-delete-1";
			const asUser = t.withIdentity({ subject: userId });

			// Create a list with an item and a tag
			const listId = await asUser.mutation(api.lists.createList, {
				name: "To Delete",
			});
			await asUser.mutation(api.items.createItem, {
				listId,
				name: "Item 1",
			});
			const tagId = await asUser.mutation(api.tags.createTag, {
				listId,
				name: "urgent",
			});
			expect(tagId).toBeDefined();

			// Add an editor (profile exists from createList)
			await t.run(async (ctx: MutationCtx) => {
				await ctx.db.insert("listEditors", {
					listId,
					userId: "other-user",
					addedAt: Date.now(),
				});
			});

			// Delete all user data
			await t.mutation(internal.users.deleteUserData, { userId });

			// Verify everything is gone
			const remaining = await t.run(async (ctx: MutationCtx) => ({
				lists: await ctx.db
					.query("lists")
					.withIndex("by_owner", (q) => q.eq("ownerId", userId))
					.collect(),
				items: await ctx.db
					.query("items")
					.filter((q) => q.eq(q.field("listId"), listId))
					.collect(),
				tags: await ctx.db
					.query("listTags")
					.filter((q) => q.eq(q.field("listId"), listId))
					.collect(),
				editors: await ctx.db
					.query("listEditors")
					.withIndex("by_list", (q) => q.eq("listId", listId))
					.collect(),
				profile: await ctx.db
					.query("profiles")
					.withIndex("by_user_id", (q) => q.eq("userId", userId))
					.unique(),
			}));

			expect(remaining.lists).toHaveLength(0);
			expect(remaining.items).toHaveLength(0);
			expect(remaining.tags).toHaveLength(0);
			expect(remaining.editors).toHaveLength(0);
			expect(remaining.profile).toBeNull();
		});

		it("handles empty account without errors", async () => {
			const t = createConvexTest(schema, modules);
			const userId = "user-delete-empty";

			// No data seeded — should complete cleanly
			await expect(
				t.mutation(internal.users.deleteUserData, { userId }),
			).resolves.not.toThrow();
		});

		it("also removes editor entries where the user is an editor (not owner)", async () => {
			const t = createConvexTest(schema, modules);
			const ownerId = "owner-for-delete";
			const editorId = "editor-to-delete";

			const asOwner = t.withIdentity({ subject: ownerId });

			const listId = await asOwner.mutation(api.lists.createList, {
				name: "Owner List",
			});

			await t.run(async (ctx) => {
				await ctx.db.insert("listEditors", {
					listId,
					userId: editorId,
					addedAt: Date.now(),
				});
			});

			await t.mutation(internal.users.deleteUserData, { userId: editorId });

			const editorEntries = await t.run((ctx: MutationCtx) =>
				ctx.db
					.query("listEditors")
					.withIndex("by_user", (q) => q.eq("userId", editorId))
					.collect(),
			);
			expect(editorEntries).toHaveLength(0);

			// Owner's list should still be intact
			const list = await t.run((ctx) => ctx.db.get("lists", listId));
			expect(list).not.toBeNull();
		});
	});
});
