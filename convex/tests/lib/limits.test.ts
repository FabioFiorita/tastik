import { ConvexError } from "convex/values";
import { api, components } from "../../_generated/api";
import schema from "../../schema";
import { getConvexErrorCode } from "../helpers";
import { createConvexTest } from "../test.setup";

const modules = import.meta.glob("../../**/*.ts");

describe("limits", () => {
	describe("list limit (MAX_LISTS_PER_USER = 50)", () => {
		it("allows the 50th list", async () => {
			const t = createConvexTest(schema, modules);
			const userId = "user-list-limit-ok";
			const asUser = t.withIdentity({ subject: userId });

			// Seed 49 lists directly, then create the 50th via the mutation
			await t.run(async (ctx) => {
				for (let i = 0; i < 49; i++) {
					await ctx.db.insert("lists", {
						ownerId: userId,
						name: `Seeded ${i}`,
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

			await expect(
				asUser.mutation(api.lists.createList, { name: "List 50" }),
			).resolves.toBeDefined();
		});

		it("rejects the 51st list", async () => {
			const t = createConvexTest(schema, modules);
			const userId = "user-list-limit-fail";
			const asUser = t.withIdentity({ subject: userId });

			await t.run(async (ctx) => {
				for (let i = 0; i < 50; i++) {
					await ctx.db.insert("lists", {
						ownerId: userId,
						name: `Seeded ${i}`,
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

			const error = await asUser
				.mutation(api.lists.createList, { name: "List 51" })
				.catch((e) => e);
			expect(error).toBeInstanceOf(ConvexError);
			expect(getConvexErrorCode(error)).toBe("LISTS_LIMIT_EXCEEDED");
		});
	});

	describe("item limit (MAX_ITEMS_PER_LIST = 500)", () => {
		it("rejects the 501st item", async () => {
			const t = createConvexTest(schema, modules);
			const userId = "user-item-limit";
			const asUser = t.withIdentity({ subject: userId });

			const listId = await asUser.mutation(api.lists.createList, {
				name: "Big List",
			});

			await t.run(async (ctx) => {
				for (let i = 0; i < 500; i++) {
					await ctx.db.insert("items", {
						listId,
						name: `Item ${i}`,
						type: "simple",
						completed: false,
						sortOrder: i,
					});
				}
			});

			const error = await asUser
				.mutation(api.items.createItem, { listId, name: "Item 501" })
				.catch((e) => e);
			expect(error).toBeInstanceOf(ConvexError);
			expect(getConvexErrorCode(error)).toBe("ITEMS_LIMIT_EXCEEDED");
		});
	});

	describe("tag limit (MAX_TAGS_PER_LIST = 50)", () => {
		it("rejects the 51st tag", async () => {
			const t = createConvexTest(schema, modules);
			const userId = "user-tag-limit";
			const asUser = t.withIdentity({ subject: userId });

			const listId = await asUser.mutation(api.lists.createList, {
				name: "Tagged List",
			});

			await t.run(async (ctx) => {
				for (let i = 0; i < 50; i++) {
					await ctx.db.insert("listTags", { listId, name: `tag-${i}` });
				}
			});

			const error = await asUser
				.mutation(api.tags.createTag, { listId, name: "tag-51" })
				.catch((e) => e);
			expect(error).toBeInstanceOf(ConvexError);
			expect(getConvexErrorCode(error)).toBe("TAGS_LIMIT_EXCEEDED");
		});
	});

	describe("editor limit (MAX_EDITORS_PER_LIST = 10)", () => {
		it("rejects the 11th editor", async () => {
			const t = createConvexTest(schema, modules);
			const ownerId = "owner-editor-limit";
			const asOwner = t.withIdentity({ subject: ownerId });

			const listId = await asOwner.mutation(api.lists.createList, {
				name: "Shared List",
			});

			// Seed 10 editors directly
			await t.run(async (ctx) => {
				for (let i = 0; i < 10; i++) {
					await ctx.db.insert("listEditors", {
						listId,
						userId: `editor-${i}`,
						addedAt: Date.now(),
					});
				}
			});

			// Create an 11th user in the betterAuth adapter and try to add them
			const editorEmail = "editor-11@example.com";
			await t.mutation(components.betterAuth.adapter.create, {
				input: {
					model: "user",
					data: {
						email: editorEmail,
						name: "Editor 11",
						emailVerified: true,
						createdAt: Date.now(),
						updatedAt: Date.now(),
					},
				},
			});

			const error = await asOwner
				.mutation(api.listEditors.addListEditorByEmail, {
					listId,
					email: editorEmail,
				})
				.catch((e) => e);
			expect(error).toBeInstanceOf(ConvexError);
			expect(getConvexErrorCode(error)).toBe("EDITORS_LIMIT_EXCEEDED");
		});
	});
});
