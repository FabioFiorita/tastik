import { ConvexError } from "convex/values";
import { beforeEach, describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import {
	createTestEnv,
	seedSubscribedUser,
	type TestIdentity,
} from "./test.setup";

describe("tags", () => {
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

	describe("tags.createTag", () => {
		it("creates tag and it appears in getListTags", async () => {
			await asAlice.mutation(api.tags.createTag, {
				listId,
				name: "TagA",
				color: "#ff0000",
			});
			const tags = await asAlice.query(api.tags.getListTags, { listId });
			expect(tags).toHaveLength(1);
			expect(tags[0]).toMatchObject({ name: "TagA", color: "#ff0000" });
		});

		it("throws TAG_NAME_EXISTS for duplicate name in same list", async () => {
			await asAlice.mutation(api.tags.createTag, { listId, name: "TagA" });
			await expect(
				asAlice.mutation(api.tags.createTag, { listId, name: "TagA" }),
			).rejects.toThrow(ConvexError);
		});
	});

	describe("tags.getListTags", () => {
		it("returns tags sorted by name", async () => {
			await asAlice.mutation(api.tags.createTag, { listId, name: "Zebra" });
			await asAlice.mutation(api.tags.createTag, { listId, name: "Alpha" });
			const tags = await asAlice.query(api.tags.getListTags, { listId });
			expect(tags).toHaveLength(2);
			expect(tags[0].name).toBe("Alpha");
			expect(tags[1].name).toBe("Zebra");
		});
	});

	describe("tags.updateTag", () => {
		it("updates name and color", async () => {
			await asAlice.mutation(api.tags.createTag, {
				listId,
				name: "Original",
				color: "#000",
			});
			const tags = await asAlice.query(api.tags.getListTags, { listId });
			const tagId = tags[0]._id;
			await asAlice.mutation(api.tags.updateTag, {
				tagId,
				name: "Updated",
				color: "#fff",
			});
			const after = await asAlice.query(api.tags.getListTags, { listId });
			expect(after[0]).toMatchObject({ name: "Updated", color: "#fff" });
		});
	});

	describe("tags.deleteTag", () => {
		it("deletes tag and unsets tagId on items", async () => {
			await asAlice.mutation(api.tags.createTag, { listId, name: "TagA" });
			const tags = await asAlice.query(api.tags.getListTags, { listId });
			const tagId = tags[0]._id;
			await asAlice.mutation(api.items.createItem, {
				listId,
				name: "Item",
				tagId,
			});
			await asAlice.mutation(api.tags.deleteTag, { tagId });
			const tagsAfter = await asAlice.query(api.tags.getListTags, { listId });
			expect(tagsAfter).toHaveLength(0);
			const items = await asAlice.query(api.items.getListItems, { listId });
			expect(items[0].tagId).toBeUndefined();
		});
	});
});
