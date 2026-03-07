import { ConvexError } from "convex/values";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import schema from "../schema";
import { getConvexErrorCode } from "./helpers";
import { createConvexTest } from "./test.setup";

const modules = import.meta.glob("../**/*.ts");

describe("tags", () => {
	async function setupSubscribedList(
		t: ReturnType<typeof createConvexTest>,
		userId: string,
	) {
		const asUser = t.withIdentity({ subject: userId });
		const listId = await asUser.mutation(api.lists.createList, {
			name: "Tag Test List",
		});
		return { asUser, listId };
	}

	describe("createTag", () => {
		it("creates a tag with a valid name", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setupSubscribedList(t, "user-tag-1");

			const tagId = await asUser.mutation(api.tags.createTag, {
				listId,
				name: "urgent",
			});
			expect(tagId).toBeDefined();

			const tags = await asUser.query(api.tags.getListTags, { listId });
			expect(tags).toHaveLength(1);
			expect(tags[0].name).toBe("urgent");
		});

		it("creates a tag with a valid hex color", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setupSubscribedList(t, "user-tag-2");

			await expect(
				asUser.mutation(api.tags.createTag, {
					listId,
					name: "colored",
					color: "#ff0000",
				}),
			).resolves.toBeDefined();
		});

		it("rejects a tag with an invalid color", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setupSubscribedList(t, "user-tag-3");

			const error = await asUser
				.mutation(api.tags.createTag, {
					listId,
					name: "bad-color",
					color: "red",
				})
				.catch((e) => e);
			expect(error).toBeInstanceOf(ConvexError);
			expect(getConvexErrorCode(error)).toBe("INVALID_INPUT");
		});

		it("rejects duplicate tag names in the same list", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setupSubscribedList(t, "user-tag-4");

			await asUser.mutation(api.tags.createTag, { listId, name: "dup" });

			const error = await asUser
				.mutation(api.tags.createTag, { listId, name: "dup" })
				.catch((e) => e);
			expect(error).toBeInstanceOf(ConvexError);
			expect(getConvexErrorCode(error)).toBe("TAG_NAME_EXISTS");
		});

		it("allows same tag name in different lists", async () => {
			const t = createConvexTest(schema, modules);
			const userId = "user-tag-5";
			const asUser = t.withIdentity({ subject: userId });

			const listId1 = await asUser.mutation(api.lists.createList, {
				name: "List A",
			});
			const listId2 = await asUser.mutation(api.lists.createList, {
				name: "List B",
			});

			await asUser.mutation(api.tags.createTag, {
				listId: listId1,
				name: "shared",
			});
			await expect(
				asUser.mutation(api.tags.createTag, {
					listId: listId2,
					name: "shared",
				}),
			).resolves.toBeDefined();
		});
	});

	describe("updateTag", () => {
		it("rejects when tag does not exist", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setupSubscribedList(
				t,
				"user-tag-upd-nf",
			);

			const tagId = await asUser.mutation(api.tags.createTag, {
				listId,
				name: "to-delete",
			});
			await asUser.mutation(api.tags.deleteTag, { tagId });

			const error = await asUser
				.mutation(api.tags.updateTag, { tagId, name: "new" })
				.catch((e) => e);
			expect(error).toBeInstanceOf(ConvexError);
			expect(getConvexErrorCode(error)).toBe("TAG_NOT_FOUND");
		});

		it("clears color when color is null", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setupSubscribedList(t, "user-tag-clr");

			const tagId = await asUser.mutation(api.tags.createTag, {
				listId,
				name: "withcolor",
				color: "#ff0000",
			});
			await asUser.mutation(api.tags.updateTag, { tagId, color: null });

			const tags = await asUser.query(api.tags.getListTags, { listId });
			expect(tags[0].color).toBeUndefined();
		});

		it("updates tag name successfully", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setupSubscribedList(t, "user-tag-6");

			const tagId = await asUser.mutation(api.tags.createTag, {
				listId,
				name: "old",
			});
			await asUser.mutation(api.tags.updateTag, { tagId, name: "new" });

			const tags = await asUser.query(api.tags.getListTags, { listId });
			expect(tags[0].name).toBe("new");
		});

		it("rejects renaming to a name that collides with another tag", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setupSubscribedList(t, "user-tag-7");

			await asUser.mutation(api.tags.createTag, { listId, name: "alpha" });
			const betaId = await asUser.mutation(api.tags.createTag, {
				listId,
				name: "beta",
			});

			const error = await asUser
				.mutation(api.tags.updateTag, { tagId: betaId, name: "alpha" })
				.catch((e) => e);
			expect(error).toBeInstanceOf(ConvexError);
			expect(getConvexErrorCode(error)).toBe("TAG_NAME_EXISTS");
		});

		it("allows renaming a tag to its own name (no-op collision)", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setupSubscribedList(t, "user-tag-8");

			const tagId = await asUser.mutation(api.tags.createTag, {
				listId,
				name: "same",
			});

			await expect(
				asUser.mutation(api.tags.updateTag, { tagId, name: "same" }),
			).resolves.not.toThrow();
		});

		it("rejects an invalid color on update", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setupSubscribedList(t, "user-tag-9");

			const tagId = await asUser.mutation(api.tags.createTag, {
				listId,
				name: "colored",
			});

			const error = await asUser
				.mutation(api.tags.updateTag, { tagId, color: "notacolor" })
				.catch((e) => e);
			expect(error).toBeInstanceOf(ConvexError);
			expect(getConvexErrorCode(error)).toBe("INVALID_INPUT");
		});
	});

	describe("deleteTag", () => {
		it("rejects when tag does not exist", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setupSubscribedList(
				t,
				"user-tag-del-nf",
			);

			const tagId = await asUser.mutation(api.tags.createTag, {
				listId,
				name: "to-delete",
			});
			await asUser.mutation(api.tags.deleteTag, { tagId });

			const error = await asUser
				.mutation(api.tags.deleteTag, { tagId })
				.catch((e) => e);
			expect(error).toBeInstanceOf(ConvexError);
			expect(getConvexErrorCode(error)).toBe("TAG_NOT_FOUND");
		});

		it("deletes tag and unsets it from all items", async () => {
			const t = createConvexTest(schema, modules);
			const { asUser, listId } = await setupSubscribedList(t, "user-tag-10");

			const tagId = await asUser.mutation(api.tags.createTag, {
				listId,
				name: "to-delete",
			});
			const itemId = (await asUser.mutation(api.items.createItem, {
				listId,
				name: "Tagged Item",
				tagId,
			})) as unknown as Id<"items">;

			await asUser.mutation(api.tags.deleteTag, { tagId });

			const tags = await asUser.query(api.tags.getListTags, { listId });
			expect(tags).toHaveLength(0);

			const item = await t.run((ctx) => ctx.db.get("items", itemId));
			expect(item?.tagId).toBeUndefined();
		});
	});
});
