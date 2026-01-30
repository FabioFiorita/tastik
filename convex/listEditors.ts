import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireListAccess, requireListOwner } from "./lib/auth";
import { requireSubscription } from "./lib/subscription";

const editorReturnValidator = v.object({
	_id: v.id("listEditors"),
	_creationTime: v.number(),
	listId: v.id("lists"),
	userId: v.id("users"),
	nickname: v.optional(v.string()),
	addedAt: v.number(),
});

/**
 * Get all editors for a list with their user details.
 */
export const getListEditors = query({
	args: {
		listId: v.id("lists"),
	},
	returns: v.array(
		v.object({
			...editorReturnValidator.fields,
			user: v.union(
				v.object({
					_id: v.id("users"),
					email: v.optional(v.string()),
					name: v.optional(v.string()),
				}),
				v.null(),
			),
		}),
	),
	handler: async (ctx, args) => {
		const { userId } = await requireListAccess(ctx, args.listId);
		await requireSubscription(ctx, userId);

		const editors = await ctx.db
			.query("listEditors")
			.withIndex("by_list", (q) => q.eq("listId", args.listId))
			.collect();

		// Fetch user details for each editor
		const editorsWithUsers = await Promise.all(
			editors.map(async (editor) => {
				const user = await ctx.db.get(editor.userId);
				return {
					...editor,
					user: user
						? {
								_id: user._id,
								email: user.email,
								name: user.name,
							}
						: null,
				};
			}),
		);

		return editorsWithUsers;
	},
});

/**
 * Add an editor to a list by user ID (owner only).
 */
export const addListEditor = mutation({
	args: {
		listId: v.id("lists"),
		userId: v.id("users"),
		nickname: v.optional(v.string()),
	},
	returns: v.id("listEditors"),
	handler: async (ctx, args) => {
		const { userId: ownerId } = await requireListOwner(ctx, args.listId);
		await requireSubscription(ctx, ownerId);

		// Can't add yourself as editor
		if (args.userId === ownerId) {
			throw new Error("Cannot add yourself as an editor");
		}

		// Check if already an editor
		const existingEditor = await ctx.db
			.query("listEditors")
			.withIndex("by_list_and_user", (q) =>
				q.eq("listId", args.listId).eq("userId", args.userId),
			)
			.unique();

		if (existingEditor) {
			throw new Error("User is already an editor of this list");
		}

		// Verify user exists
		const user = await ctx.db.get(args.userId);
		if (!user) {
			throw new Error("User not found");
		}

		return await ctx.db.insert("listEditors", {
			listId: args.listId,
			userId: args.userId,
			nickname: args.nickname,
			addedAt: Date.now(),
		});
	},
});

/**
 * Add an editor to a list by email (owner only).
 */
export const addListEditorByEmail = mutation({
	args: {
		listId: v.id("lists"),
		email: v.string(),
		nickname: v.optional(v.string()),
	},
	returns: v.union(v.id("listEditors"), v.null()),
	handler: async (ctx, args) => {
		const { userId: ownerId } = await requireListOwner(ctx, args.listId);
		await requireSubscription(ctx, ownerId);

		// Find user by email
		const users = await ctx.db.query("users").collect();
		const user = users.find(
			(u) => u.email?.toLowerCase() === args.email.toLowerCase(),
		);

		if (!user) {
			// User not found - could return null or throw depending on desired behavior
			return null;
		}

		// Can't add yourself as editor
		if (user._id === ownerId) {
			throw new Error("Cannot add yourself as an editor");
		}

		// Check if already an editor
		const existingEditor = await ctx.db
			.query("listEditors")
			.withIndex("by_list_and_user", (q) =>
				q.eq("listId", args.listId).eq("userId", user._id),
			)
			.unique();

		if (existingEditor) {
			throw new Error("User is already an editor of this list");
		}

		return await ctx.db.insert("listEditors", {
			listId: args.listId,
			userId: user._id,
			nickname: args.nickname,
			addedAt: Date.now(),
		});
	},
});

/**
 * Update an editor's nickname (owner only).
 */
export const updateEditorNickname = mutation({
	args: {
		editorId: v.id("listEditors"),
		nickname: v.union(v.string(), v.null()),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const editor = await ctx.db.get(args.editorId);
		if (!editor) {
			throw new Error("Editor entry not found");
		}

		const { userId } = await requireListOwner(ctx, editor.listId);
		await requireSubscription(ctx, userId);

		await ctx.db.patch(args.editorId, {
			nickname: args.nickname === null ? undefined : args.nickname,
		});

		return null;
	},
});

/**
 * Remove an editor from a list (owner only).
 */
export const removeListEditor = mutation({
	args: {
		editorId: v.id("listEditors"),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const editor = await ctx.db.get(args.editorId);
		if (!editor) {
			throw new Error("Editor entry not found");
		}

		const { userId } = await requireListOwner(ctx, editor.listId);
		await requireSubscription(ctx, userId);
		await ctx.db.delete(args.editorId);

		return null;
	},
});

/**
 * Leave a list you're an editor of (self-removal).
 */
export const leaveList = mutation({
	args: {
		listId: v.id("lists"),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireSubscription(ctx, userId);

		// Find the editor entry for current user
		const editorEntry = await ctx.db
			.query("listEditors")
			.withIndex("by_list_and_user", (q) =>
				q.eq("listId", args.listId).eq("userId", userId),
			)
			.unique();

		if (!editorEntry) {
			throw new Error("You are not an editor of this list");
		}

		await ctx.db.delete(editorEntry._id);

		return null;
	},
});
