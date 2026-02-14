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

describe("items", () => {
	let asAlice: TestIdentity;
	let listId: Id<"lists">;

	beforeEach(async () => {
		const env = await createTestEnv();
		asAlice = env.asAlice;
		await seedSubscribedUser(asAlice);
		await asAlice.mutation(api.lists.createList, { name: "List" });
		const lists = await asAlice.query(api.lists.getUserLists, {});
		listId = lists[0]._id;
	});

	describe("items.createItem", () => {
		it("creates item and it appears in getListItems with defaults", async () => {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Item One",
			});
			const items = await asAlice.query(api.items.getListItems, { listId });
			expect(items).toHaveLength(1);
			expect(items[0]).toMatchObject({
				name: "Item One",
				type: "simple",
				completed: false,
			});
		});

		it("creates stepper item with currentValue and step", async () => {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Stepper",
				type: "stepper",
				step: 2,
			});
			const items = await asAlice.query(api.items.getListItems, { listId });
			expect(items[0]).toMatchObject({
				name: "Stepper",
				type: "stepper",
				currentValue: 0,
				step: 2,
			});
		});

		it("creates kanban item with status", async () => {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Kanban",
				type: "kanban",
			});
			const items = await asAlice.query(api.items.getListItems, { listId });
			expect(items[0]).toMatchObject({
				name: "Kanban",
				type: "kanban",
				status: "todo",
			});
		});

		it("creates calculator item with provided value", async () => {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Calculator",
				type: "calculator",
				calculatorValue: -12,
			});
			const items = await asAlice.query(api.items.getListItems, { listId });
			expect(items[0]).toMatchObject({
				name: "Calculator",
				type: "calculator",
				calculatorValue: -12,
			});
		});

		it("throws on empty item name", async () => {
			await expect(
				asAlice.mutation(api.items.createItem, { listId, name: "" }),
			).rejects.toThrow(ConvexError);
		});

		it("throws on item name longer than limit", async () => {
			const longName = "a".repeat(VALIDATION_LIMITS.ITEM_NAME_MAX + 1);
			await expect(
				asAlice.mutation(api.items.createItem, { listId, name: longName }),
			).rejects.toThrow(ConvexError);
		});

		it("throws on invalid step (zero)", async () => {
			await expect(
				asAlice.mutation(api.items.createItem, {
					listId,
					name: "Stepper",
					type: "stepper",
					step: 0,
				}),
			).rejects.toThrow(ConvexError);
		});

		it("throws when tagId belongs to another list", async () => {
			await asAlice.mutation(api.lists.createList, { name: "Second List" });
			const lists = await asAlice.query(api.lists.getUserLists, {});
			const secondListId = lists.find((list) => list._id !== listId)?._id;
			if (!secondListId) throw new Error("expected second list");

			await asAlice.mutation(api.tags.createTag, {
				listId: secondListId,
				name: "Foreign Tag",
			});
			const secondListTags = await asAlice.query(api.tags.getListTags, {
				listId: secondListId,
			});

			await expect(
				asAlice.mutation(api.items.createItem, {
					listId,
					name: "Item with wrong tag",
					tagId: secondListTags[0]._id,
				}),
			).rejects.toThrow(ConvexError);
		});
	});

	describe("items.getListItems", () => {
		it("filters by includeCompleted false", async () => {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Done",
			});
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Todo",
			});
			const items = await asAlice.query(api.items.getListItems, { listId });
			const doneItem = items.find((i) => i.name === "Done");
			if (!doneItem) throw new Error("expected Done item");
			await asAlice.mutation(api.items.toggleItemComplete, {
				itemId: doneItem._id,
			});
			const incomplete = await asAlice.query(api.items.getListItems, {
				listId,
				includeCompleted: false,
			});
			expect(incomplete).toHaveLength(1);
			expect(incomplete[0].name).toBe("Todo");
		});

		it("returns empty array when list no longer exists", async () => {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Item",
			});

			await asAlice.mutation(api.lists.deleteList, { listId });
			const items = await asAlice.query(api.items.getListItems, { listId });
			expect(items).toEqual([]);
		});

		it("respects list sort preferences", async () => {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Bravo",
			});
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Alpha",
			});

			await asAlice.mutation(api.lists.updateList, {
				listId,
				sortBy: "name",
				sortAscending: true,
			});
			const byNameAsc = await asAlice.query(api.items.getListItems, { listId });
			expect(byNameAsc.map((item) => item.name)).toEqual(["Alpha", "Bravo"]);

			await asAlice.mutation(api.lists.updateList, {
				listId,
				sortBy: "created_at",
				sortAscending: false,
			});
			const byCreatedDesc = await asAlice.query(api.items.getListItems, {
				listId,
			});
			expect(byCreatedDesc.map((item) => item.name)).toEqual([
				"Alpha",
				"Bravo",
			]);
		});
	});

	describe("items.getItem", () => {
		it("returns item when user has list access", async () => {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Item",
			});
			const items = await asAlice.query(api.items.getListItems, { listId });
			const item = await asAlice.query(api.items.getItem, {
				itemId: items[0]._id,
			});
			expect(item).toMatchObject({ name: "Item" });
		});
	});

	describe("items.updateItem", () => {
		it("patches name, description, url, notes", async () => {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Original",
			});
			const items = await asAlice.query(api.items.getListItems, { listId });
			const itemId = items[0]._id;
			await asAlice.mutation(api.items.updateItem, {
				itemId,
				name: "Updated",
				description: "Desc",
				url: "https://example.com",
				notes: "Notes",
			});
			const item = await asAlice.query(api.items.getItem, { itemId });
			expect(item).toMatchObject({
				name: "Updated",
				description: "Desc",
				url: "https://example.com",
				notes: "Notes",
			});
		});

		it("throws when updating tagId to a tag from another list", async () => {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Original",
			});
			const items = await asAlice.query(api.items.getListItems, { listId });
			const itemId = items[0]._id;

			await asAlice.mutation(api.lists.createList, { name: "Second List" });
			const lists = await asAlice.query(api.lists.getUserLists, {});
			const secondListId = lists.find((list) => list._id !== listId)?._id;
			if (!secondListId) throw new Error("expected second list");
			await asAlice.mutation(api.tags.createTag, {
				listId: secondListId,
				name: "Foreign Tag",
			});
			const secondListTags = await asAlice.query(api.tags.getListTags, {
				listId: secondListId,
			});

			await expect(
				asAlice.mutation(api.items.updateItem, {
					itemId,
					tagId: secondListTags[0]._id,
				}),
			).rejects.toThrow(ConvexError);
		});

		it("updates calculator value and kanban status", async () => {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Track",
				type: "calculator",
			});
			const items = await asAlice.query(api.items.getListItems, { listId });
			const itemId = items[0]._id;

			await asAlice.mutation(api.items.updateItem, {
				itemId,
				calculatorValue: 25,
			});
			let item = await asAlice.query(api.items.getItem, { itemId });
			expect(item?.calculatorValue).toBe(25);

			await asAlice.mutation(api.items.updateItem, {
				itemId,
				type: "kanban",
				status: "done",
			});
			item = await asAlice.query(api.items.getItem, { itemId });
			expect(item?.status).toBe("done");
			expect(item?.completed).toBe(true);
		});
	});

	describe("items.toggleItemComplete", () => {
		it("toggles completed and completedAt", async () => {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Item",
			});
			const items = await asAlice.query(api.items.getListItems, { listId });
			const itemId = items[0]._id;
			await asAlice.mutation(api.items.toggleItemComplete, { itemId });
			let item = await asAlice.query(api.items.getItem, { itemId });
			expect(item?.completed).toBe(true);
			expect(item?.completedAt).toBeDefined();
			await asAlice.mutation(api.items.toggleItemComplete, { itemId });
			item = await asAlice.query(api.items.getItem, { itemId });
			expect(item?.completed).toBe(false);
		});
	});

	describe("items.incrementItemValue", () => {
		it("increments by delta without auto-completing stepper items", async () => {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Stepper",
				type: "stepper",
				step: 2,
			});
			const items = await asAlice.query(api.items.getListItems, { listId });
			const itemId = items[0]._id;
			await asAlice.mutation(api.items.incrementItemValue, {
				itemId,
				delta: 2,
			});
			let item = await asAlice.query(api.items.getItem, { itemId });
			expect(item?.currentValue).toBe(2);
			expect(item?.completed).toBe(false);
			await asAlice.mutation(api.items.incrementItemValue, {
				itemId,
				delta: 2,
			});
			item = await asAlice.query(api.items.getItem, { itemId });
			expect(item?.currentValue).toBe(4);
			expect(item?.completed).toBe(false);
		});

		it("setValue sets current value directly without auto-completing", async () => {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Stepper",
				type: "stepper",
			});
			const items = await asAlice.query(api.items.getListItems, { listId });
			const itemId = items[0]._id;
			await asAlice.mutation(api.items.incrementItemValue, {
				itemId,
				setValue: 10,
			});
			const item = await asAlice.query(api.items.getItem, { itemId });
			expect(item?.currentValue).toBe(10);
			expect(item?.completed).toBe(false);
		});

		it("supports calculator setValue updates", async () => {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Calculator",
				type: "calculator",
				calculatorValue: 7,
			});
			const items = await asAlice.query(api.items.getListItems, { listId });
			const itemId = items[0]._id;
			await asAlice.mutation(api.items.incrementItemValue, {
				itemId,
				setValue: -7,
			});
			const item = await asAlice.query(api.items.getItem, { itemId });
			expect(item?.calculatorValue).toBe(-7);
		});
	});

	describe("items.searchItems", () => {
		it("matches items by description as well as name", async () => {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Groceries",
				description: "Buy almond milk",
			});

			const results = await asAlice.query(api.items.searchItems, {
				query: "almond",
			});

			expect(results).toHaveLength(1);
			expect(results[0].name).toBe("Groceries");
		});
	});

	describe("items.updateItemStatus", () => {
		it("updates kanban status and marks completed when done", async () => {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Kanban",
				type: "kanban",
			});
			const items = await asAlice.query(api.items.getListItems, { listId });
			const itemId = items[0]._id;
			await asAlice.mutation(api.items.updateItemStatus, {
				itemId,
				status: "in_progress",
			});
			let item = await asAlice.query(api.items.getItem, { itemId });
			expect(item?.status).toBe("in_progress");
			expect(item?.completed).toBe(false);
			await asAlice.mutation(api.items.updateItemStatus, {
				itemId,
				status: "done",
			});
			item = await asAlice.query(api.items.getItem, { itemId });
			expect(item?.status).toBe("done");
			expect(item?.completed).toBe(true);
		});
	});

	describe("items.deleteItem", () => {
		it("removes item from list", async () => {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "To Delete",
			});
			const items = await asAlice.query(api.items.getListItems, { listId });
			const itemId = items[0]._id;
			await asAlice.mutation(api.items.deleteItem, { itemId });
			const after = await asAlice.query(api.items.getListItems, { listId });
			expect(after).toHaveLength(0);
		});
	});
});
