import { ConvexError } from "convex/values";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import schema from "../schema";
import { getConvexErrorCode } from "./helpers";
import { createConvexTest } from "./test.setup";

const modules = import.meta.glob("../**/*.ts");

describe("items", () => {
	async function setup(t: ReturnType<typeof createConvexTest>, userId: string) {
		const asUser = t.withIdentity({ subject: userId });
		const listId = await asUser.mutation(api.lists.createList, {
			name: "Item Test List",
		});
		return { asUser, listId };
	}

	describe("createItem", () => {
		it("creates a simple item with defaults", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setup(t, "user-item-1");

			const itemId = await asUser.mutation(api.items.createItem, {
				listId,
				name: "Buy milk",
			});

			const items = await asUser.query(api.items.getListItems, { listId });
			expect(items).toHaveLength(1);
			expect(items[0]._id).toBe(itemId);
			expect(items[0].type).toBe("simple");
			expect(items[0].completed).toBe(false);
		});

		it("creates a stepper item with currentValue=0 and step=1 by default", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setup(t, "user-item-2");

			await asUser.mutation(api.items.createItem, {
				listId,
				name: "Water glasses",
				type: "stepper",
			});

			const items = await asUser.query(api.items.getListItems, { listId });
			expect(items[0].currentValue).toBe(0);
			expect(items[0].step).toBe(1);
		});

		it("creates a calculator item with calculatorValue=0 by default", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setup(t, "user-item-3");

			await asUser.mutation(api.items.createItem, {
				listId,
				name: "Budget",
				type: "calculator",
			});

			const items = await asUser.query(api.items.getListItems, { listId });
			expect(items[0].calculatorValue).toBe(0);
		});

		it("creates a kanban item with status=todo by default", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setup(t, "user-item-4");

			await asUser.mutation(api.items.createItem, {
				listId,
				name: "Task",
				type: "kanban",
			});

			const items = await asUser.query(api.items.getListItems, { listId });
			expect(items[0].status).toBe("todo");
			expect(items[0].completed).toBe(false);
		});
	});

	describe("toggleItemComplete", () => {
		it("toggles completion and sets completedAt", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setup(t, "user-item-5");

			const itemId = (await asUser.mutation(api.items.createItem, {
				listId,
				name: "Task",
			})) as unknown as Id<"items">;

			await asUser.mutation(api.items.toggleItemComplete, { itemId });
			const items = await asUser.query(api.items.getListItems, { listId });
			expect(items[0].completed).toBe(true);
			expect(items[0].completedAt).toBeTypeOf("number");

			await asUser.mutation(api.items.toggleItemComplete, { itemId });
			const items2 = await asUser.query(api.items.getListItems, { listId });
			expect(items2[0].completed).toBe(false);
			expect(items2[0].completedAt).toBeUndefined();
		});
	});

	describe("incrementItemValue", () => {
		it("increments stepper by default step", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setup(t, "user-item-6");

			const itemId = (await asUser.mutation(api.items.createItem, {
				listId,
				name: "Counter",
				type: "stepper",
				step: 5,
				currentValue: 10,
			})) as unknown as Id<"items">;

			await asUser.mutation(api.items.incrementItemValue, { itemId });

			const items = await asUser.query(api.items.getListItems, { listId });
			expect(items[0].currentValue).toBe(15);
		});

		it("sets value directly via setValue", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setup(t, "user-item-7");

			const itemId = (await asUser.mutation(api.items.createItem, {
				listId,
				name: "Counter",
				type: "stepper",
			})) as unknown as Id<"items">;

			await asUser.mutation(api.items.incrementItemValue, {
				itemId,
				setValue: 42,
			});

			const items = await asUser.query(api.items.getListItems, { listId });
			expect(items[0].currentValue).toBe(42);
		});

		it("rejects non-stepper/calculator items", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setup(t, "user-item-8");

			const itemId = (await asUser.mutation(api.items.createItem, {
				listId,
				name: "Simple",
			})) as unknown as Id<"items">;

			const error = await asUser
				.mutation(api.items.incrementItemValue, { itemId })
				.catch((e) => e);
			expect(error).toBeInstanceOf(ConvexError);
			expect(getConvexErrorCode(error)).toBe("ITEM_NOT_STEPPER_TYPE");
		});
	});

	describe("updateItem", () => {
		it("clears optional fields when null is passed", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setup(t, "user-item-9");

			const itemId = (await asUser.mutation(api.items.createItem, {
				listId,
				name: "Documented Task",
				description: "some description",
				notes: "some notes",
				url: "https://example.com",
			})) as unknown as Id<"items">;

			await asUser.mutation(api.items.updateItem, {
				itemId,
				description: null,
				notes: null,
				url: null,
			});

			const item = await asUser.query(api.items.getItem, { itemId });
			expect(item?.description).toBeUndefined();
			expect(item?.notes).toBeUndefined();
			expect(item?.url).toBeUndefined();
		});
	});

	describe("searchItems", () => {
		it("returns only items from accessible lists", async () => {
			const t = createConvexTest(schema, modules);
			const userId = "user-item-search";
			const strangerUserId = "stranger-item-search";
			const { asUser, listId } = await setup(t, userId);
			const asStranger = t.withIdentity({ subject: strangerUserId });

			await asUser.mutation(api.items.createItem, {
				listId,
				name: "My personal task",
			});

			const strangerListId = await asStranger.mutation(api.lists.createList, {
				name: "Stranger List",
			});
			await asStranger.mutation(api.items.createItem, {
				listId: strangerListId,
				name: "My personal task",
			});

			const results = await asUser.query(api.items.searchItems, {
				query: "personal task",
			});
			// Only the item from the user's own list should appear
			expect(results).toHaveLength(1);
			expect(results[0].listId).toBe(listId);
		});
	});
});
