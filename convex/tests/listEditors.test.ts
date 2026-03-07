import { ConvexError } from "convex/values";
import { api, components } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import schema from "../schema";
import { getConvexErrorCode } from "./helpers";
import { createConvexTest } from "./test.setup";

const modules = import.meta.glob("../**/*.ts");

describe("listEditors", () => {
	async function setupOwnerList(
		t: ReturnType<typeof createConvexTest>,
		ownerId: string,
	) {
		const asOwner = t.withIdentity({ subject: ownerId });
		const listId = await asOwner.mutation(api.lists.createList, {
			name: "Shared List",
		});
		return { asOwner, listId };
	}

	async function createUser(
		t: ReturnType<typeof createConvexTest>,
		email: string,
		name: string,
	) {
		await t.mutation(components.betterAuth.adapter.create, {
			input: {
				model: "user",
				data: {
					email,
					name,
					emailVerified: true,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				},
			},
		});
	}

	describe("addListEditorByEmail", () => {
		it("adds an editor by email (happy path)", async () => {
			const t = createConvexTest(schema, modules);
			const ownerId = "owner-editors-1";
			const { asOwner, listId } = await setupOwnerList(t, ownerId);

			await createUser(t, "editor@example.com", "Editor User");

			await asOwner.mutation(api.listEditors.addListEditorByEmail, {
				listId,
				email: "editor@example.com",
			});

			const editors = await asOwner.query(api.listEditors.getListEditors, {
				listId,
			});
			expect(editors).toHaveLength(1);
		});

		it("rejects invalid email format", async () => {
			const t = createConvexTest(schema, modules);
			const ownerId = "owner-editors-invalid-email";
			const { asOwner, listId } = await setupOwnerList(t, ownerId);

			const error = await asOwner
				.mutation(api.listEditors.addListEditorByEmail, {
					listId,
					email: "not-an-email",
				})
				.catch((e) => e);
			expect(error).toBeInstanceOf(ConvexError);
			expect(getConvexErrorCode(error)).toBe("INVALID_EMAIL");
		});

		it("rejects adding an unknown email", async () => {
			const t = createConvexTest(schema, modules);
			const ownerId = "owner-editors-2";
			const { asOwner, listId } = await setupOwnerList(t, ownerId);

			const error = await asOwner
				.mutation(api.listEditors.addListEditorByEmail, {
					listId,
					email: "nobody@example.com",
				})
				.catch((e) => e);
			expect(error).toBeInstanceOf(ConvexError);
			expect(getConvexErrorCode(error)).toBe("USER_NOT_FOUND");
		});

		it("rejects adding self as editor", async () => {
			const t = createConvexTest(schema, modules);
			const ownerEmail = "owner3@example.com";

			const createdUser = await t.mutation(
				components.betterAuth.adapter.create,
				{
					input: {
						model: "user",
						data: {
							email: ownerEmail,
							name: "Owner",
							emailVerified: true,
							createdAt: Date.now(),
							updatedAt: Date.now(),
						},
					},
				},
			);
			const ownerId = (createdUser as { _id: string })._id;
			const { asOwner, listId } = await setupOwnerList(t, ownerId);

			const error = await asOwner
				.mutation(api.listEditors.addListEditorByEmail, {
					listId,
					email: ownerEmail,
				})
				.catch((e) => e);
			expect(error).toBeInstanceOf(ConvexError);
			expect(getConvexErrorCode(error)).toBe("CANNOT_ADD_SELF_AS_EDITOR");
		});

		it("rejects adding the same editor twice", async () => {
			const t = createConvexTest(schema, modules);
			const ownerId = "owner-editors-4";
			const { asOwner, listId } = await setupOwnerList(t, ownerId);

			await createUser(t, "dup-editor@example.com", "Dup Editor");

			await asOwner.mutation(api.listEditors.addListEditorByEmail, {
				listId,
				email: "dup-editor@example.com",
			});

			const error = await asOwner
				.mutation(api.listEditors.addListEditorByEmail, {
					listId,
					email: "dup-editor@example.com",
				})
				.catch((e) => e);
			expect(error).toBeInstanceOf(ConvexError);
			expect(getConvexErrorCode(error)).toBe("USER_ALREADY_EDITOR");
		});
	});

	describe("leaveList", () => {
		it("removes the editor's own entry", async () => {
			const t = createConvexTest(schema, modules);
			const ownerId = "owner-editors-5";
			const editorId = "editor-leave-5";
			const { asOwner, listId } = await setupOwnerList(t, ownerId);
			const asEditor = t.withIdentity({ subject: editorId });

			await t.run(async (ctx) => {
				await ctx.db.insert("listEditors", {
					listId,
					userId: editorId,
					addedAt: Date.now(),
				});
			});

			await asEditor.mutation(api.listEditors.leaveList, { listId });

			const editors = await asOwner.query(api.listEditors.getListEditors, {
				listId,
			});
			expect(editors).toHaveLength(0);
		});

		it("rejects if caller is not an editor of the list", async () => {
			const t = createConvexTest(schema, modules);
			const ownerId = "owner-editors-6";
			const strangerId = "stranger-6";
			const { listId } = await setupOwnerList(t, ownerId);
			const asStranger = t.withIdentity({ subject: strangerId });

			const error = await asStranger
				.mutation(api.listEditors.leaveList, { listId })
				.catch((e) => e);
			expect(error).toBeInstanceOf(ConvexError);
			expect(getConvexErrorCode(error)).toBe("NOT_LIST_EDITOR");
		});
	});

	describe("removeListEditor", () => {
		it("throws EDITOR_ENTRY_NOT_FOUND for non-existent editor", async () => {
			const t = createConvexTest(schema, modules);
			const ownerId = "owner-remove-nf";
			const { asOwner, listId } = await setupOwnerList(t, ownerId);

			const editors = await asOwner.query(api.listEditors.getListEditors, {
				listId,
			});
			expect(editors).toHaveLength(0);

			const fakeEditorId = (await t.run(async (ctx) => {
				const id = await ctx.db.insert("listEditors", {
					listId,
					userId: "someone",
					addedAt: Date.now(),
				});
				await ctx.db.delete("listEditors", id);
				return id;
			})) as Id<"listEditors">;

			const error = await asOwner
				.mutation(api.listEditors.removeListEditor, {
					editorId: fakeEditorId,
				})
				.catch((e) => e);
			expect(error).toBeInstanceOf(ConvexError);
			expect(getConvexErrorCode(error)).toBe("EDITOR_ENTRY_NOT_FOUND");
		});
		it("removes an editor when owner calls it", async () => {
			const t = createConvexTest(schema, modules);
			const ownerId = "owner-remove-1";
			const { asOwner, listId } = await setupOwnerList(t, ownerId);

			await createUser(t, "to-remove@example.com", "To Remove");
			await asOwner.mutation(api.listEditors.addListEditorByEmail, {
				listId,
				email: "to-remove@example.com",
			});

			const editorsBefore = await asOwner.query(
				api.listEditors.getListEditors,
				{ listId },
			);
			expect(editorsBefore).toHaveLength(1);
			const editorId = editorsBefore[0]._id;

			await asOwner.mutation(api.listEditors.removeListEditor, {
				editorId,
			});

			const editorsAfter = await asOwner.query(api.listEditors.getListEditors, {
				listId,
			});
			expect(editorsAfter).toHaveLength(0);
		});
	});

	describe("updateEditorNickname", () => {
		it("updates an editor nickname", async () => {
			const t = createConvexTest(schema, modules);
			const ownerId = "owner-nick-1";
			const { asOwner, listId } = await setupOwnerList(t, ownerId);

			await createUser(t, "nick-editor@example.com", "Nick Editor");
			await asOwner.mutation(api.listEditors.addListEditorByEmail, {
				listId,
				email: "nick-editor@example.com",
			});

			const editors = await asOwner.query(api.listEditors.getListEditors, {
				listId,
			});
			const editorId = editors[0]._id;

			await asOwner.mutation(api.listEditors.updateEditorNickname, {
				editorId,
				nickname: "Custom Nick",
			});

			const collaborators = await asOwner.query(
				api.listEditors.getListCollaborators,
				{ listId },
			);
			expect(collaborators[0].nickname).toBe("Custom Nick");
		});
	});

	describe("getListCollaborators", () => {
		it("returns nickname without exposing real user identity", async () => {
			const t = createConvexTest(schema, modules);
			const ownerId = "owner-editors-7";
			const editorId = "editor-collab-7";
			const { asOwner, listId } = await setupOwnerList(t, ownerId);

			await t.run(async (ctx) => {
				await ctx.db.insert("listEditors", {
					listId,
					userId: editorId,
					nickname: "Anon",
					addedAt: Date.now(),
				});
			});

			const collaborators = await asOwner.query(
				api.listEditors.getListCollaborators,
				{ listId },
			);
			expect(collaborators).toHaveLength(1);
			expect(collaborators[0].nickname).toBe("Anon");
			// email should NOT be on the collaborator object
			expect(collaborators[0]).not.toHaveProperty("email");
		});
	});
});
