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

		it("creates stepper item with currentValue, targetValue, step", async () => {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Stepper",
				type: "stepper",
				targetValue: 10,
				step: 2,
			});
			const items = await asAlice.query(api.items.getListItems, { listId });
			expect(items[0]).toMatchObject({
				name: "Stepper",
				type: "stepper",
				currentValue: 0,
				targetValue: 10,
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
		it("increments by delta and marks completed when target reached", async () => {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Stepper",
				type: "stepper",
				targetValue: 4,
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
			expect(item?.completed).toBe(true);
		});

		it("setValue sets current value directly", async () => {
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Stepper",
				type: "stepper",
				targetValue: 10,
			});
			const items = await asAlice.query(api.items.getListItems, { listId });
			const itemId = items[0]._id;
			await asAlice.mutation(api.items.incrementItemValue, {
				itemId,
				setValue: 10,
			});
			const item = await asAlice.query(api.items.getItem, { itemId });
			expect(item?.currentValue).toBe(10);
			expect(item?.completed).toBe(true);
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
