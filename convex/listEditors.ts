import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { appError } from "./lib/errors";
import { assertEditorsUnderLimit } from "./lib/limits";
import {
	requireAuth,
	requireListAccess,
	requireListOwner,
	requireSubscription,
} from "./lib/permissions";
import { assertRateLimit } from "./lib/rateLimiter";
import {
	isValidEmail,
	normalizeEmail,
	validateNickname,
} from "./lib/validation";

/**
 * Owner-only editor management view with user details.
 */
export const getListEditors = query({
	args: {
		listId: v.id("lists"),
	},
	handler: async (ctx, args) => {
		await requireListOwner(ctx, args.listId);

		const editors = await ctx.db
			.query("listEditors")
			.withIndex("by_list", (q) => q.eq("listId", args.listId))
			.collect();

		// Batch fetch user details for each editor
		const userIds = editors.map((editor) => editor.userId);
		const users = await Promise.all(
			userIds.map((id) => ctx.db.get("users", id)),
		);

		const editorsWithUsers = editors.map((editor, index) => {
			const user = users[index];
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
		});

		return editorsWithUsers;
	},
});

/**
 * List collaborators with privacy-safe fields.
 * Editors can view collaborator nicknames but not real identities.
 */
export const getListCollaborators = query({
	args: {
		listId: v.id("lists"),
	},
	handler: async (ctx, args) => {
		const { userId } = await requireListAccess(ctx, args.listId);

		const editors = await ctx.db
			.query("listEditors")
			.withIndex("by_list", (q) => q.eq("listId", args.listId))
			.collect();

		return editors.map((editor) => ({
			_id: editor._id,
			listId: editor.listId,
			nickname: editor.nickname,
			addedAt: editor.addedAt,
			isCurrentUser: editor.userId === userId,
		}));
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
	handler: async (ctx, args) => {
		const { userId: ownerId } = await requireListOwner(ctx, args.listId);
		await requireSubscription(ctx, ownerId);
		await assertRateLimit(ctx, "addListEditor", ownerId);

		if (!isValidEmail(args.email)) {
			throw new ConvexError(appError("INVALID_EMAIL", "Invalid email address"));
		}

		// Use email index for efficient lookup
		const normalizedEmail = normalizeEmail(args.email);
		const user = await ctx.db
			.query("users")
			.withIndex("email", (q) => q.eq("email", normalizedEmail))
			.unique();

		if (!user) {
			throw new ConvexError(
				appError("USER_NOT_FOUND", "No user found with that email address"),
			);
		}

		// Validate nickname if provided
		if (args.nickname) {
			validateNickname(args.nickname);
		}

		if (user._id === ownerId) {
			throw new ConvexError(
				appError(
					"CANNOT_ADD_SELF_AS_EDITOR",
					"Cannot add yourself as an editor",
				),
			);
		}

		const existingEditor = await ctx.db
			.query("listEditors")
			.withIndex("by_list_and_user", (q) =>
				q.eq("listId", args.listId).eq("userId", user._id),
			)
			.unique();

		if (existingEditor) {
			throw new ConvexError(
				appError(
					"USER_ALREADY_EDITOR",
					"User is already an editor of this list",
				),
			);
		}
		await assertEditorsUnderLimit(ctx, args.listId);
		await ctx.db.insert("listEditors", {
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
	handler: async (ctx, args) => {
		const editor = await ctx.db.get("listEditors", args.editorId);
		if (!editor) {
			throw new ConvexError(
				appError("EDITOR_ENTRY_NOT_FOUND", "Editor entry not found"),
			);
		}

		await requireListOwner(ctx, editor.listId);

		// Validate nickname if it's a string
		if (args.nickname !== null && args.nickname !== undefined) {
			validateNickname(args.nickname);
		}

		await ctx.db.patch("listEditors", args.editorId, {
			nickname: args.nickname === null ? undefined : args.nickname,
		});
	},
});

export const removeListEditor = mutation({
	args: {
		editorId: v.id("listEditors"),
	},
	handler: async (ctx, args) => {
		const editor = await ctx.db.get("listEditors", args.editorId);
		if (!editor) {
			throw new ConvexError(
				appError("EDITOR_ENTRY_NOT_FOUND", "Editor entry not found"),
			);
		}

		await requireListOwner(ctx, editor.listId);
		await ctx.db.delete("listEditors", args.editorId);
	},
});

/**
 * Leave a list you're an editor of (self-removal).
 */
export const leaveList = mutation({
	args: {
		listId: v.id("lists"),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);

		// Find the editor entry for current user
		const editorEntry = await ctx.db
			.query("listEditors")
			.withIndex("by_list_and_user", (q) =>
				q.eq("listId", args.listId).eq("userId", userId),
			)
			.unique();

		if (!editorEntry) {
			throw new ConvexError(
				appError("NOT_LIST_EDITOR", "You are not an editor of this list"),
			);
		}

		await ctx.db.delete("listEditors", editorEntry._id);
	},
});
