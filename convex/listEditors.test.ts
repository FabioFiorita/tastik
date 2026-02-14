import { ConvexError } from "convex/values";
import { beforeEach, describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
	createTestEnv,
	seedSubscribedUser,
	type TestIdentity,
} from "./test.setup";

async function addBobAsEditor(
	env: Awaited<ReturnType<typeof createTestEnv>>,
	asAlice: TestIdentity,
	listId: Id<"lists">,
	opts?: { nickname?: string },
) {
	const asBob = await env.createUserIdentity("Bob");
	await seedSubscribedUser(asBob);
	const bobUser = await asBob.query(api.users.getCurrentUser, {});
	if (!bobUser) throw new Error("expected Bob user");
	await env.t.run(async (ctx) => {
		await ctx.db.patch("users", bobUser._id, { email: "bob@example.com" });
	});
	await asAlice.mutation(api.listEditors.addListEditorByEmail, {
		listId,
		email: "bob@example.com",
		nickname: opts?.nickname,
	});
	return { asBob, bobUser };
}

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

	describe("listEditors.addListEditorByEmail", () => {
		it("owner adds editor by email; getListEditors returns editor", async () => {
			const { bobUser } = await addBobAsEditor(env, asAlice, listId);
			const editors = await asAlice.query(api.listEditors.getListEditors, {
				listId,
			});
			expect(editors).toHaveLength(1);
			expect(editors[0].userId).toBe(bobUser._id);
			expect(editors[0].user?._id).toBe(bobUser._id);
		});

		it("throws CANNOT_ADD_SELF_AS_EDITOR when owner adds self", async () => {
			const aliceUser = await asAlice.query(api.users.getCurrentUser, {});
			if (!aliceUser) throw new Error("expected Alice user");
			await env.t.run(async (ctx) => {
				await ctx.db.patch("users", aliceUser._id, {
					email: "alice@example.com",
				});
			});
			await expect(
				asAlice.mutation(api.listEditors.addListEditorByEmail, {
					listId,
					email: "alice@example.com",
				}),
			).rejects.toThrow(ConvexError);
		});

		it("throws USER_ALREADY_EDITOR when adding same user again", async () => {
			await addBobAsEditor(env, asAlice, listId);
			await expect(
				asAlice.mutation(api.listEditors.addListEditorByEmail, {
					listId,
					email: "bob@example.com",
				}),
			).rejects.toThrow(ConvexError);
		});

		it("adds editor by email when user exists with that email", async () => {
			const { bobUser } = await addBobAsEditor(env, asAlice, listId);
			const editors = await asAlice.query(api.listEditors.getListEditors, {
				listId,
			});
			expect(editors).toHaveLength(1);
			expect(editors[0].userId).toBe(bobUser._id);
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

	describe("listEditors.getListCollaborators", () => {
		it("returns nickname-safe collaborator data for editors", async () => {
			const { asBob } = await addBobAsEditor(env, asAlice, listId, {
				nickname: "Bobby",
			});

			const collaborators = await asBob.query(
				api.listEditors.getListCollaborators,
				{
					listId,
				},
			);
			expect(collaborators).toHaveLength(1);
			expect(collaborators[0]).toMatchObject({
				nickname: "Bobby",
				isCurrentUser: true,
			});
			expect("user" in collaborators[0]).toBe(false);
		});

		it("blocks editors from owner-only getListEditors", async () => {
			const { asBob } = await addBobAsEditor(env, asAlice, listId);

			await expect(
				asBob.query(api.listEditors.getListEditors, { listId }),
			).rejects.toThrow(ConvexError);
		});
	});

	describe("listEditors.removeListEditor", () => {
		it("owner removes editor; getListEditors no longer includes them", async () => {
			await addBobAsEditor(env, asAlice, listId);
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
			const { asBob } = await addBobAsEditor(env, asAlice, listId);
			await asBob.mutation(api.listEditors.leaveList, { listId });
			await expect(asBob.query(api.lists.getList, { listId })).rejects.toThrow(
				ConvexError,
			);
		});
	});
});
