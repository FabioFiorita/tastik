import { ConvexError } from "convex/values";
import { api, internal } from "../_generated/api";
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
			expect(items[0].searchText).toBe("buy milk");
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

		it("rejects updateItem with ITEM_NOT_FOUND for deleted item", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setup(t, "user-item-upd-nf");

			const itemId = (await asUser.mutation(api.items.createItem, {
				listId,
				name: "Temp",
			})) as unknown as Id<"items">;
			await asUser.mutation(api.items.deleteItem, { itemId });

			const error = await asUser
				.mutation(api.items.updateItem, { itemId, name: "New" })
				.catch((e) => e);
			expect(error).toBeInstanceOf(ConvexError);
			expect(getConvexErrorCode(error)).toBe("ITEM_NOT_FOUND");
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

		it("recomputes searchText when name or description changes", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setup(t, "user-item-10");

			const itemId = (await asUser.mutation(api.items.createItem, {
				listId,
				name: "Plan sprint",
				description: "weekly goals",
			})) as unknown as Id<"items">;

			await asUser.mutation(api.items.updateItem, {
				itemId,
				name: "Plan roadmap",
				description: "quarter goals",
			});

			const item = await asUser.query(api.items.getItem, { itemId });
			expect(item?.searchText).toBe("plan roadmap quarter goals");
		});
	});

	describe("getListItems", () => {
		it("filters by tagId when provided", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setup(t, "user-item-tag-filter");

			const tagId = await asUser.mutation(api.tags.createTag, {
				listId,
				name: "urgent",
			});
			await asUser.mutation(api.items.createItem, {
				listId,
				name: "Tagged",
				tagId,
			});
			await asUser.mutation(api.items.createItem, {
				listId,
				name: "Untagged",
			});

			const filtered = await asUser.query(api.items.getListItems, {
				listId,
				tagId,
			});
			expect(filtered).toHaveLength(1);
			expect(filtered[0].name).toBe("Tagged");
		});

		it("excludes completed items when includeCompleted is false", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setup(t, "user-item-completed-filter");

			const itemId = (await asUser.mutation(api.items.createItem, {
				listId,
				name: "Complete me",
			})) as unknown as Id<"items">;
			await asUser.mutation(api.items.toggleItemComplete, { itemId });

			const active = await asUser.query(api.items.getListItems, {
				listId,
				includeCompleted: false,
			});
			expect(active).toHaveLength(0);
		});

		it("returns empty array when caller has no access", async () => {
			const t = createConvexTest(schema, modules);
			const ownerId = "user-item-access-owner";
			const strangerId = "user-item-access-stranger";
			const { asUser, listId } = await setup(t, ownerId);
			const asStranger = t.withIdentity({ subject: strangerId });

			await asUser.mutation(api.items.createItem, {
				listId,
				name: "Private",
			});

			const results = await asStranger.query(api.items.getListItems, {
				listId,
			});
			expect(results).toHaveLength(0);
		});
	});

	describe("getItem", () => {
		it("returns null when item does not exist", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setup(t, "user-item-get-null");

			const itemId = (await asUser.mutation(api.items.createItem, {
				listId,
				name: "Temp",
			})) as unknown as Id<"items">;
			await asUser.mutation(api.items.deleteItem, { itemId });

			const item = await asUser.query(api.items.getItem, { itemId });
			expect(item).toBeNull();
		});
	});

	describe("updateItemStatus", () => {
		it("updates kanban item status", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setup(t, "user-item-status");

			const itemId = (await asUser.mutation(api.items.createItem, {
				listId,
				name: "Task",
				type: "kanban",
			})) as unknown as Id<"items">;

			await asUser.mutation(api.items.updateItem, {
				itemId,
				status: "in_progress",
			});

			const items = await asUser.query(api.items.getListItems, { listId });
			expect(items[0].status).toBe("in_progress");
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

		it("returns empty when query has no matches", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setup(t, "user-item-search-empty");

			await asUser.mutation(api.items.createItem, {
				listId,
				name: "Unrelated",
			});

			const results = await asUser.query(api.items.searchItems, {
				query: "xyznonexistent",
			});
			expect(results).toHaveLength(0);
		});

		it("matches terms that are only in description", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setup(t, "user-item-search-2");

			await asUser.mutation(api.items.createItem, {
				listId,
				name: "Roadmap",
				description: "quarterly planning session",
			});

			const results = await asUser.query(api.items.searchItems, {
				query: "planning",
			});
			expect(results).toHaveLength(1);
			expect(results[0].name).toBe("Roadmap");
		});
	});

	describe("backfillItemSearchText", () => {
		it("fills missing searchText fields for existing items", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setup(t, "user-item-backfill-1");

			const legacyItemId = await t.run(async (ctx) =>
				ctx.db.insert("items", {
					listId,
					name: "Legacy item",
					type: "simple",
					completed: false,
					sortOrder: 1,
					description: "missing search field",
				}),
			);

			const result = await t.action(internal.items.backfillItemSearchText, {});
			expect(result.updatedCount).toBeGreaterThan(0);

			const legacyItem = await asUser.query(api.items.getItem, {
				itemId: legacyItemId,
			});
			expect(legacyItem?.searchText).toBe("legacy item missing search field");
		});
	});
});
