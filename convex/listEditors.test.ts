import { ConvexError } from "convex/values";
import { beforeEach, describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
	createTestEnv,
	seedSubscribedUser,
	type TestIdentity,
} from "./test.setup";

describe("listEditors", () => {
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

	describe("listEditors.addListEditor", () => {
		it("owner adds editor by userId; getListEditors returns editor", async () => {
			const asBob = await env.createUserIdentity("Bob");
			await seedSubscribedUser(asBob);
			const bobUser = await asBob.query(api.users.getCurrentUser, {});
			if (!bobUser) throw new Error("expected Bob user");
			const bobUserId = bobUser._id;
			await asAlice.mutation(api.listEditors.addListEditor, {
				listId,
				userId: bobUserId,
			});
			const editors = await asAlice.query(api.listEditors.getListEditors, {
				listId,
			});
			expect(editors).toHaveLength(1);
			expect(editors[0].userId).toBe(bobUserId);
		});

		it("throws CANNOT_ADD_SELF_AS_EDITOR when owner adds self", async () => {
			const aliceUser = await asAlice.query(api.users.getCurrentUser, {});
			if (!aliceUser) throw new Error("expected Alice user");
			await expect(
				asAlice.mutation(api.listEditors.addListEditor, {
					listId,
					userId: aliceUser._id,
				}),
			).rejects.toThrow(ConvexError);
		});

		it("throws USER_ALREADY_EDITOR when adding same user again", async () => {
			const asBob = await env.createUserIdentity("Bob");
			await seedSubscribedUser(asBob);
			const bobUser = await asBob.query(api.users.getCurrentUser, {});
			if (!bobUser) throw new Error("expected Bob user");
			await asAlice.mutation(api.listEditors.addListEditor, {
				listId,
				userId: bobUser._id,
			});
			await expect(
				asAlice.mutation(api.listEditors.addListEditor, {
					listId,
					userId: bobUser._id,
				}),
			).rejects.toThrow(ConvexError);
		});
	});

	describe("listEditors.addListEditorByEmail", () => {
		it("adds editor by email when user exists with that email", async () => {
			const asBob = await env.createUserIdentity("Bob");
			await seedSubscribedUser(asBob);
			const bobUser = await asBob.query(api.users.getCurrentUser, {});
			if (!bobUser) throw new Error("expected Bob user");
			await env.t.run(async (ctx) => {
				await ctx.db.patch(bobUser._id, { email: "bob@example.com" });
			});
			await asAlice.mutation(api.listEditors.addListEditorByEmail, {
				listId,
				email: "bob@example.com",
			});
			const editors = await asAlice.query(api.listEditors.getListEditors, {
				listId,
			});
			expect(editors).toHaveLength(1);
		});

		it("throws INVALID_EMAIL for invalid email", async () => {
			await expect(
				asAlice.mutation(api.listEditors.addListEditorByEmail, {
					listId,
					email: "not-an-email",
				}),
			).rejects.toThrow(ConvexError);
		});
	});

	describe("listEditors.removeListEditor", () => {
		it("owner removes editor; getListEditors no longer includes them", async () => {
			const asBob = await env.createUserIdentity("Bob");
			await seedSubscribedUser(asBob);
			const bobUser = await asBob.query(api.users.getCurrentUser, {});
			if (!bobUser) throw new Error("expected Bob user");
			await asAlice.mutation(api.listEditors.addListEditor, {
				listId,
				userId: bobUser._id,
			});
			let editors = await asAlice.query(api.listEditors.getListEditors, {
				listId,
			});
			expect(editors).toHaveLength(1);
			const editorId = editors[0]._id;
			await asAlice.mutation(api.listEditors.removeListEditor, { editorId });
			editors = await asAlice.query(api.listEditors.getListEditors, {
				listId,
			});
			expect(editors).toHaveLength(0);
		});
	});

	describe("listEditors.leaveList", () => {
		it("editor leaves list; they no longer have access", async () => {
			const asBob = await env.createUserIdentity("Bob");
			await seedSubscribedUser(asBob);
			const bobUser = await asBob.query(api.users.getCurrentUser, {});
			if (!bobUser) throw new Error("expected Bob user");
			await asAlice.mutation(api.listEditors.addListEditor, {
				listId,
				userId: bobUser._id,
			});
			await asBob.mutation(api.listEditors.leaveList, { listId });
			await expect(asBob.query(api.lists.getList, { listId })).rejects.toThrow(
				ConvexError,
			);
		});
	});
});
