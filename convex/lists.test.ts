import { ConvexError } from "convex/values";
import { beforeEach, describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { VALIDATION_LIMITS } from "./lib/validation";
import {
	createTestEnv,
	seedSubscribedUser,
	type TestIdentity,
} from "./test.setup";

describe("lists", () => {
	let env: Awaited<ReturnType<typeof createTestEnv>>;
	let asAlice: TestIdentity;
	let listId: Id<"lists">;

	beforeEach(async () => {
		env = await createTestEnv();
		asAlice = env.asAlice;
		await seedSubscribedUser(asAlice);
		await asAlice.mutation(api.lists.createList, { name: "List" });
		const lists = await asAlice.query(api.lists.getUserLists, {});
		listId = lists[0]._id;
	});

	describe("lists.createList", () => {
		it("creates list and it appears in getUserLists with isOwner true and defaults", async () => {
			const lists = await asAlice.query(api.lists.getUserLists, {});
			expect(lists).toHaveLength(1);
			expect(lists[0]).toMatchObject({
				name: "List",
				isOwner: true,
				type: "simple",
				sortBy: "created_at",
				sortAscending: true,
				showCompleted: true,
			});
		});

		it("throws on empty list name", async () => {
			await expect(
				asAlice.mutation(api.lists.createList, { name: "" }),
			).rejects.toThrow(ConvexError);
		});

		it("throws on list name longer than limit", async () => {
			const longName = "a".repeat(VALIDATION_LIMITS.LIST_NAME_MAX + 1);
			await expect(
				asAlice.mutation(api.lists.createList, { name: longName }),
			).rejects.toThrow(ConvexError);
		});
	});

	describe("lists.getUserLists", () => {
		it("returns empty array when user has no lists", async () => {
			const env = await createTestEnv();
			const asAliceEmpty = env.asAlice;
			await seedSubscribedUser(asAliceEmpty);
			const lists = await asAliceEmpty.query(api.lists.getUserLists, {});
			expect(lists).toEqual([]);
		});

		it("returns all lists ordered by creation time newest first with isOwner", async () => {
			await asAlice.mutation(api.lists.createList, { name: "First" });
			await asAlice.mutation(api.lists.createList, { name: "Second" });
			const lists = await asAlice.query(api.lists.getUserLists, {});
			expect(lists).toHaveLength(3);
			expect(lists[0].name).toBe("Second");
			expect(lists[1].name).toBe("First");
			expect(lists[2].name).toBe("List");
			expect(lists.every((l) => l.isOwner === true)).toBe(true);
		});
	});

	describe("lists.getList", () => {
		it("returns list with isOwner when owner requests", async () => {
			const list = await asAlice.query(api.lists.getList, { listId });
			expect(list).toMatchObject({ name: "List", isOwner: true });
		});

		it("throws NOT_LIST_ACCESS when another user requests list", async () => {
			const asBob = await env.createUserIdentity("Bob");
			await seedSubscribedUser(asBob);
			await expect(asBob.query(api.lists.getList, { listId })).rejects.toThrow(
				ConvexError,
			);
		});

		it("returns null for non-existent list id", async () => {
			await env.t.run(async (ctx) => {
				await ctx.db.delete("lists", listId);
			});
			const list = await asAlice.query(api.lists.getList, { listId });
			expect(list).toBeNull();
		});
	});

	describe("lists.updateList", () => {
		it("patches name, sortBy, showCompleted", async () => {
			await asAlice.mutation(api.lists.updateList, {
				listId,
				name: "Updated",
				sortBy: "name",
				showCompleted: false,
			});
			const list = await asAlice.query(api.lists.getList, { listId });
			if (!list) throw new Error("expected list");
			expect(list).toMatchObject({
				name: "Updated",
				sortBy: "name",
				showCompleted: false,
			});
		});
	});

	describe("lists.deleteList", () => {
		it("deletes list and its items", async () => {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Item",
			});
			await asAlice.mutation(api.lists.deleteList, { listId });
			const list = await asAlice.query(api.lists.getList, { listId });
			expect(list).toBeNull();
		});
	});

	describe("lists.archiveList and restoreList", () => {
		it("archives then restores list", async () => {
			await asAlice.mutation(api.lists.archiveList, { listId });
			const activeOnly = await asAlice.query(api.lists.getUserLists, {
				status: "active",
			});
			expect(activeOnly.find((l) => l._id === listId)).toBeUndefined();
			await asAlice.mutation(api.lists.restoreList, { listId });
			const list = await asAlice.query(api.lists.getList, { listId });
			if (!list) throw new Error("expected list");
			expect(list.status).toBe("active");
		});
	});

	describe("lists.duplicateList", () => {
		it("duplicates list with items and tag; editors not copied", async () => {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Item One",
			});
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Item Two",
			});
			await asAlice.mutation(api.tags.createTag, {
				listId,
				name: "TagA",
			});
			const newListId = await asAlice.mutation(api.lists.duplicateList, {
				listId,
			});
			expect(newListId).toBeDefined();
			const newLists = await asAlice.query(api.lists.getUserLists, {});
			const newList = newLists.find((l) => l._id === newListId);
			expect(newList).toBeDefined();
			expect(newList?.name).toBe("List (copy)");
			const items = await asAlice.query(api.items.getListItems, {
				listId: newListId,
			});
			expect(items).toHaveLength(2);
			const tags = await asAlice.query(api.tags.getListTags, {
				listId: newListId,
			});
			expect(tags).toHaveLength(1);
			expect(tags[0].name).toBe("TagA");
		});

		it("allows editors to duplicate shared lists into their own account", async () => {
			const asBob = await env.createUserIdentity("Bob");
			await seedSubscribedUser(asBob);
			const bob = await asBob.query(api.users.getCurrentUser, {});
			if (!bob) throw new Error("expected Bob user");
			await env.t.run(async (ctx) => {
				await ctx.db.patch("users", bob._id, { email: "bob@example.com" });
			});

			await asAlice.mutation(api.listEditors.addListEditorByEmail, {
				listId,
				email: "bob@example.com",
				nickname: "Bob",
			});

			const duplicatedListId = await asBob.mutation(api.lists.duplicateList, {
				listId,
			});
			const bobLists = await asBob.query(api.lists.getUserLists, {});
			const duplicated = bobLists.find((list) => list._id === duplicatedListId);

			expect(duplicated).toBeDefined();
			expect(duplicated?.isOwner).toBe(true);
			expect(duplicated?.name).toBe("List (copy)");
		});

		it("copies item fields and remaps tag ids when duplicating", async () => {
			await asAlice.mutation(api.tags.createTag, {
				listId,
				name: "TagA",
			});
			const [tag] = await asAlice.query(api.tags.getListTags, { listId });

			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Stepper Item",
				type: "stepper",
				currentValue: 4,
				step: 2,
				description: "progress",
				url: "https://example.com",
				tagId: tag._id,
			});

			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Calculator Item",
				type: "calculator",
				calculatorValue: -3,
				tagId: tag._id,
			});

			const newListId = await asAlice.mutation(api.lists.duplicateList, {
				listId,
			});
			const duplicatedItems = await asAlice.query(api.items.getListItems, {
				listId: newListId,
			});
			const duplicatedTags = await asAlice.query(api.tags.getListTags, {
				listId: newListId,
			});

			expect(duplicatedTags).toHaveLength(1);
			expect(duplicatedItems).toHaveLength(2);
			expect(
				duplicatedItems.every((item) => item.tagId === duplicatedTags[0]._id),
			).toBe(true);
			expect(duplicatedItems).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						name: "Stepper Item",
						type: "stepper",
						currentValue: 4,
						step: 2,
						description: "progress",
						url: "https://example.com",
					}),
					expect.objectContaining({
						name: "Calculator Item",
						type: "calculator",
						calculatorValue: -3,
					}),
				]),
			);
		});
	});

	describe("lists.exportList", () => {
		it("exports list as txt, md, and csv with list name and item names", async () => {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Task A",
			});
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Stepper A",
				type: "stepper",
				currentValue: 6,
				step: 2,
			});
			const txt = await asAlice.query(api.lists.exportList, {
				listId,
				format: "txt",
			});
			expect(txt).toContain("List");
			expect(txt).toContain("Task A");
			expect(txt).toContain("Value: 6 (step: 2)");
			const md = await asAlice.query(api.lists.exportList, {
				listId,
				format: "md",
			});
			expect(md).toContain("# List");
			expect(md).toContain("Task A");
			expect(md).toContain("Value: 6 (step: 2)");
			const csv = await asAlice.query(api.lists.exportList, {
				listId,
				format: "csv",
			});
			expect(csv).toContain("Task A");
			expect(csv).toContain("Name,Completed");
			expect(csv).not.toContain("TargetValue");
		});
	});
});
