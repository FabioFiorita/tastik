import { ConvexError } from "convex/values";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import schema from "../schema";
import { getConvexErrorCode } from "./helpers";
import { createConvexTest } from "./test.setup";

const modules = import.meta.glob("../**/*.ts");

describe("lists", () => {
	async function setup(t: ReturnType<typeof createConvexTest>, userId: string) {
		return t.withIdentity({ subject: userId });
	}

	describe("createList", () => {
		it("creates list with hideCheckbox and showTotal options", async () => {
			const t = createConvexTest(schema, modules);
			const asUser = await setup(t, "user-lists-create-opts");

			const listId = await asUser.mutation(api.lists.createList, {
				name: "Options",
				hideCheckbox: true,
				showTotal: true,
			});

			const list = await asUser.query(api.lists.getList, { listId });
			expect(list?.hideCheckbox).toBe(true);
			expect(list?.showTotal).toBe(true);
		});

		it("creates a list with custom type and icon", async () => {
			const t = createConvexTest(schema, modules);
			const asUser = await setup(t, "user-lists-create-custom");

			const listId = await asUser.mutation(api.lists.createList, {
				name: "Calculator",
				type: "calculator",
				icon: "📊",
			});

			const list = await asUser.query(api.lists.getList, { listId });
			expect(list?.type).toBe("calculator");
			expect(list?.icon).toBe("📊");
		});

		it("creates a list with default settings", async () => {
			const t = createConvexTest(schema, modules);
			const asUser = await setup(t, "user-lists-1");

			const listId = await asUser.mutation(api.lists.createList, {
				name: "My List",
			});

			const list = await asUser.query(api.lists.getList, { listId });
			expect(list).not.toBeNull();
			expect(list?.name).toBe("My List");
			expect(list?.type).toBe("simple");
			expect(list?.status).toBe("active");
			expect(list?.isOwner).toBe(true);
		});
	});

	describe("deleteList", () => {
		it("deletes a list and all cascading data", async () => {
			const t = createConvexTest(schema, modules);
			const asUser = await setup(t, "user-lists-2");

			const listId = await asUser.mutation(api.lists.createList, {
				name: "To Delete",
			});
			const itemId = (await asUser.mutation(api.items.createItem, {
				listId,
				name: "Item",
			})) as unknown as Id<"items">;
			const tagId = await asUser.mutation(api.tags.createTag, {
				listId,
				name: "tag",
			});

			// Add an editor entry directly
			await t.run((ctx) =>
				ctx.db.insert("listEditors", {
					listId,
					userId: "some-editor",
					addedAt: Date.now(),
				}),
			);

			await asUser.mutation(api.lists.deleteList, { listId });

			const remaining = await t.run(async (ctx: MutationCtx) => ({
				list: await ctx.db.get("lists", listId),
				item: await ctx.db.get("items", itemId),
				tag: await ctx.db.get("listTags", tagId),
				editors: await ctx.db
					.query("listEditors")
					.withIndex("by_list", (q) => q.eq("listId", listId))
					.collect(),
			}));

			expect(remaining.list).toBeNull();
			expect(remaining.item).toBeNull();
			expect(remaining.tag).toBeNull();
			expect(remaining.editors).toHaveLength(0);
		});
	});

	describe("archiveList / restoreList", () => {
		it("archives and restores a list", async () => {
			const t = createConvexTest(schema, modules);
			const asUser = await setup(t, "user-lists-3");

			const listId = await asUser.mutation(api.lists.createList, {
				name: "Archivable",
			});

			await asUser.mutation(api.lists.archiveList, { listId });
			const archived = await asUser.query(api.lists.getList, { listId });
			expect(archived?.status).toBe("archived");

			await asUser.mutation(api.lists.restoreList, { listId });
			const restored = await asUser.query(api.lists.getList, { listId });
			expect(restored?.status).toBe("active");
		});
	});

	describe("duplicateList", () => {
		it("creates a copy of a list with remapped tag IDs and correct item order", async () => {
			const t = createConvexTest(schema, modules);
			const asUser = await setup(t, "user-lists-4");

			const srcListId = await asUser.mutation(api.lists.createList, {
				name: "Original",
			});
			const tagId = await asUser.mutation(api.tags.createTag, {
				listId: srcListId,
				name: "urgent",
			});
			await asUser.mutation(api.items.createItem, {
				listId: srcListId,
				name: "Item A",
				tagId,
			});
			await asUser.mutation(api.items.createItem, {
				listId: srcListId,
				name: "Item B",
			});

			const newListId = await asUser.mutation(api.lists.duplicateList, {
				listId: srcListId,
			});
			expect(newListId).not.toBe(srcListId);

			const newList = await asUser.query(api.lists.getList, {
				listId: newListId,
			});
			expect(newList?.name).toBe("Original (copy)");

			const newTags = await asUser.query(api.tags.getListTags, {
				listId: newListId,
			});
			expect(newTags).toHaveLength(1);
			expect(newTags[0].name).toBe("urgent");
			// New tag should have a different ID from the source tag
			expect(newTags[0]._id).not.toBe(tagId);

			const newItems = await asUser.query(api.items.getListItems, {
				listId: newListId,
			});
			expect(newItems).toHaveLength(2);
			// Item A has a tag — its tagId should point to the new tag, not the old
			const itemA = newItems.find((i) => i.name === "Item A");
			expect(itemA?.tagId).toBe(newTags[0]._id);
		});

		it("does not copy editors", async () => {
			const t = createConvexTest(schema, modules);
			const asUser = await setup(t, "user-lists-5");

			const srcListId = await asUser.mutation(api.lists.createList, {
				name: "With Editors",
			});
			await t.run((ctx) =>
				ctx.db.insert("listEditors", {
					listId: srcListId,
					userId: "some-editor",
					addedAt: Date.now(),
				}),
			);

			const newListId = await asUser.mutation(api.lists.duplicateList, {
				listId: srcListId,
			});

			const editors = await t.run((ctx: MutationCtx) =>
				ctx.db
					.query("listEditors")
					.withIndex("by_list", (q) => q.eq("listId", newListId))
					.collect(),
			);
			expect(editors).toHaveLength(0);
		});
	});

	describe("updateList", () => {
		it("updates list name and icon", async () => {
			const t = createConvexTest(schema, modules);
			const asUser = await setup(t, "user-lists-update");

			const listId = await asUser.mutation(api.lists.createList, {
				name: "Original",
			});

			await asUser.mutation(api.lists.updateList, {
				listId,
				name: "Updated Name",
				icon: "📋",
			});

			const list = await asUser.query(api.lists.getList, { listId });
			expect(list?.name).toBe("Updated Name");
			expect(list?.icon).toBe("📋");
		});
	});

	describe("exportList", () => {
		it("throws LIST_NOT_FOUND when list does not exist", async () => {
			const t = createConvexTest(schema, modules);
			const asUser = await setup(t, "user-lists-export-nf");

			const listId = await asUser.mutation(api.lists.createList, {
				name: "To Delete",
			});
			await asUser.mutation(api.lists.deleteList, { listId });

			const error = await asUser
				.query(api.lists.exportList, { listId })
				.catch((e) => e);
			expect(error).toBeInstanceOf(ConvexError);
			expect(getConvexErrorCode(error)).toBe("LIST_NOT_FOUND");
		});

		it("exports as plain text by default", async () => {
			const t = createConvexTest(schema, modules);
			const asUser = await setup(t, "user-lists-export");

			const listId = await asUser.mutation(api.lists.createList, {
				name: "Export List",
			});
			await asUser.mutation(api.items.createItem, {
				listId,
				name: "Item 1",
			});

			const result = await asUser.query(api.lists.exportList, { listId });
			expect(typeof result).toBe("string");
			expect(result).toContain("Export List");
			expect(result).toContain("Item 1");
		});

		it("exports items with description, url, notes and different types", async () => {
			const t = createConvexTest(schema, modules);
			const asUser = await setup(t, "user-lists-export-rich");

			const listId = await asUser.mutation(api.lists.createList, {
				name: "Rich Export",
			});
			const tagId = await asUser.mutation(api.tags.createTag, {
				listId,
				name: "tag1",
			});
			await asUser.mutation(api.items.createItem, {
				listId,
				name: "Stepper",
				type: "stepper",
				step: 2,
				currentValue: 10,
				description: "desc",
				tagId,
			});
			await asUser.mutation(api.items.createItem, {
				listId,
				name: "Calculator",
				type: "calculator",
				calculatorValue: 100,
			});
			await asUser.mutation(api.items.createItem, {
				listId,
				name: "Kanban",
				type: "kanban",
				status: "in_progress",
				url: "https://example.com",
				notes: "my notes",
			});

			const txt = await asUser.query(api.lists.exportList, {
				listId,
				format: "txt",
			});
			expect(txt).toContain("Value: 10");
			expect(txt).toContain("tag1");
			expect(txt).toContain("in_progress");

			const csv = await asUser.query(api.lists.exportList, {
				listId,
				format: "csv",
			});
			expect(csv).toContain("Stepper");
			expect(csv).toContain("Calculator");
		});

		it("exports as markdown when format=md", async () => {
			const t = createConvexTest(schema, modules);
			const asUser = await setup(t, "user-lists-export-md");

			const listId = await asUser.mutation(api.lists.createList, {
				name: "MD List",
			});

			const result = await asUser.query(api.lists.exportList, {
				listId,
				format: "md",
			});
			expect(typeof result).toBe("string");
			expect(result).toContain("#");
		});

		it("exports as CSV when format=csv", async () => {
			const t = createConvexTest(schema, modules);
			const asUser = await setup(t, "user-lists-export-csv");

			const listId = await asUser.mutation(api.lists.createList, {
				name: "CSV List",
			});
			await asUser.mutation(api.items.createItem, {
				listId,
				name: "Row 1",
			});

			const result = await asUser.query(api.lists.exportList, {
				listId,
				format: "csv",
			});
			expect(typeof result).toBe("string");
			expect(result).toContain(",");
		});

		it("escapes special chars in CSV export", async () => {
			const t = createConvexTest(schema, modules);
			const asUser = await setup(t, "user-lists-export-csv-escape");

			const listId = await asUser.mutation(api.lists.createList, {
				name: "CSV Escape",
			});
			await asUser.mutation(api.items.createItem, {
				listId,
				name: 'Item "with" commas, and quotes',
				description: "desc with, comma",
			});

			const result = await asUser.query(api.lists.exportList, {
				listId,
				format: "csv",
			});
			expect(result).toContain('"');
		});
	});

	describe("getList", () => {
		it("returns null when caller has no access to the list", async () => {
			const t = createConvexTest(schema, modules);
			const ownerId = "user-list-getlist-owner";
			const strangerId = "user-list-getlist-stranger";
			const asOwner = await setup(t, ownerId);
			const asStranger = await setup(t, strangerId);

			const listId = await asOwner.mutation(api.lists.createList, {
				name: "Private List",
			});

			const result = await asStranger.query(api.lists.getList, { listId });
			expect(result).toBeNull();
		});
	});

	describe("getUserLists sorting", () => {
		it("sorts lists by name ascending when preference is set", async () => {
			const t = createConvexTest(schema, modules);
			const userId = "user-lists-sort";
			const asUser = await setup(t, userId);

			// Set sort preference
			await asUser.mutation(api.preferences.updateListsSortPreference, {
				sortBy: "name",
				sortAscending: true,
			});

			await asUser.mutation(api.lists.createList, { name: "Zebra" });
			await asUser.mutation(api.lists.createList, { name: "Apple" });
			await asUser.mutation(api.lists.createList, { name: "Mango" });

			const lists = await asUser.query(api.lists.getUserLists, {});
			const names = lists.map((l) => l.name);
			expect(names).toEqual([...names].sort());
		});

		it("returns only active lists when status filter is applied", async () => {
			const t = createConvexTest(schema, modules);
			const asUser = await setup(t, "user-lists-filter");

			const listId = await asUser.mutation(api.lists.createList, {
				name: "Active",
			});
			const archivedId = await asUser.mutation(api.lists.createList, {
				name: "Archived",
			});
			await asUser.mutation(api.lists.archiveList, { listId: archivedId });

			const active = await asUser.query(api.lists.getUserLists, {
				status: "active",
			});
			expect(active.every((l) => l.status === "active")).toBe(true);
			expect(active.map((l) => l._id)).toContain(listId);
			expect(active.map((l) => l._id)).not.toContain(archivedId);
		});
	});
});
