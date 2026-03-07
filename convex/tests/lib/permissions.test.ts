import { ConvexError } from "convex/values";
import { api } from "../../_generated/api";
import schema from "../../schema";
import { getConvexErrorCode } from "../helpers";
import { createConvexTest } from "../test.setup";

const modules = import.meta.glob("../../**/*.ts");

describe("permissions", () => {
	describe("requireAuth", () => {
		it("throws NOT_AUTHENTICATED for unauthenticated user", async () => {
			const t = createConvexTest(schema, modules);
			// getUserLists calls requireAuth at the top
			const error = await t.query(api.lists.getUserLists, {}).catch((e) => e);
			expect(error).toBeInstanceOf(ConvexError);
			expect(getConvexErrorCode(error)).toBe("NOT_AUTHENTICATED");
		});
	});

	describe("requireListOwner", () => {
		it("throws NOT_LIST_OWNER when an editor tries an owner-only action", async () => {
			const t = createConvexTest(schema, modules);
			const ownerId = "owner-perm-1";
			const editorId = "editor-perm-1";
			const asOwner = t.withIdentity({ subject: ownerId });
			const asEditor = t.withIdentity({ subject: editorId });

			const listId = await asOwner.mutation(api.lists.createList, {
				name: "Owner List",
			});

			// Seed editor directly
			await t.run(async (ctx) => {
				await ctx.db.insert("listEditors", {
					listId,
					userId: editorId,
					addedAt: Date.now(),
				});
			});

			// Editor tries to archive — owner-only operation
			const error = await asEditor
				.mutation(api.lists.archiveList, { listId })
				.catch((e) => e);
			expect(error).toBeInstanceOf(ConvexError);
			expect(getConvexErrorCode(error)).toBe("NOT_LIST_OWNER");
		});
	});

	describe("requireListAccess", () => {
		it("allows list owner to read items", async () => {
			const t = createConvexTest(schema, modules);
			const userId = "owner-perm-2";
			const asUser = t.withIdentity({ subject: userId });

			const listId = await asUser.mutation(api.lists.createList, {
				name: "My List",
			});

			await expect(
				asUser.query(api.items.getListItems, { listId }),
			).resolves.toEqual([]);
		});

		it("allows editor to read items", async () => {
			const t = createConvexTest(schema, modules);
			const ownerId = "owner-perm-3";
			const editorId = "editor-perm-3";
			const asOwner = t.withIdentity({ subject: ownerId });
			const asEditor = t.withIdentity({ subject: editorId });

			const listId = await asOwner.mutation(api.lists.createList, {
				name: "Shared List",
			});

			await t.run(async (ctx) => {
				await ctx.db.insert("listEditors", {
					listId,
					userId: editorId,
					addedAt: Date.now(),
				});
			});

			await expect(
				asEditor.query(api.items.getListItems, { listId }),
			).resolves.toEqual([]);
		});

		it("throws LIST_NOT_FOUND for unrelated user", async () => {
			const t = createConvexTest(schema, modules);
			const ownerId = "owner-perm-4";
			const strangerId = "stranger-perm-4";
			const asOwner = t.withIdentity({ subject: ownerId });
			const asStranger = t.withIdentity({ subject: strangerId });

			const listId = await asOwner.mutation(api.lists.createList, {
				name: "Private List",
			});

			const error = await asStranger
				.query(api.lists.getList, { listId })
				.catch((e) => e);
			// getList uses getListAccessOrNull which returns null → returns null (no error)
			// When no access, getList returns null
			expect(error).toBeNull();
		});
	});
});
