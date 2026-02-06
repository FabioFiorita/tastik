import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { appError } from "./lib/errors";
import { requireAuth } from "./lib/permissions";
import { normalizeEmail, validateUserName } from "./lib/validation";

export const getById = internalQuery({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.userId);
	},
});

export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return null;
		const user = await ctx.db.get(userId);
		if (!user) return null;
		const imageUrl = user.imageStorageId
			? await ctx.storage.getUrl(user.imageStorageId)
			: (user.image ?? null);
		return { ...user, imageUrl };
	},
});

export const generateUploadUrl = mutation({
	args: {},
	handler: async (ctx) => {
		await requireAuth(ctx);
		return await ctx.storage.generateUploadUrl();
	},
});

export const setProfileImage = mutation({
	args: { storageId: v.id("_storage") },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		const user = await ctx.db.get(userId);
		if (!user) {
			throw new ConvexError(appError("USER_NOT_FOUND", "User not found"));
		}
		if (user.imageStorageId) {
			await ctx.storage.delete(user.imageStorageId);
		}
		await ctx.db.patch(userId, { imageStorageId: args.storageId });
	},
});

export const clearProfileImage = mutation({
	args: {},
	handler: async (ctx) => {
		const userId = await requireAuth(ctx);
		const user = await ctx.db.get(userId);
		if (!user) {
			throw new ConvexError(appError("USER_NOT_FOUND", "User not found"));
		}
		if (user.imageStorageId) {
			await ctx.storage.delete(user.imageStorageId);
			await ctx.db.patch(userId, { imageStorageId: undefined });
		}
	},
});

export const updateProfile = mutation({
	args: { name: v.optional(v.string()) },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		const user = await ctx.db.get(userId);
		if (!user) {
			throw new ConvexError(appError("USER_NOT_FOUND", "User not found"));
		}
		if (args.name !== undefined) {
			validateUserName(args.name);
			const trimmed = args.name.trim();
			await ctx.db.patch(userId, {
				name: trimmed === "" ? undefined : trimmed,
			});
		}
	},
});

export const deleteAccount = mutation({
	args: {
		confirmEmail: v.string(),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		const user = await ctx.db.get(userId);
		if (!user) {
			throw new ConvexError(appError("USER_NOT_FOUND", "User not found"));
		}
		if (!user.email) {
			throw new ConvexError(
				appError(
					"INVALID_INPUT",
					"Account has no email address. Please contact support for account deletion.",
				),
			);
		}
		const normalizedUserEmail = normalizeEmail(user.email);
		const normalizedConfirmEmail = normalizeEmail(args.confirmEmail);
		if (normalizedConfirmEmail !== normalizedUserEmail) {
			throw new ConvexError(
				appError(
					"INVALID_INPUT",
					"Email confirmation does not match your account email",
				),
			);
		}
		if (user.imageStorageId) {
			await ctx.storage.delete(user.imageStorageId);
		}
		const ownedListsQuery = ctx.db
			.query("lists")
			.withIndex("by_owner", (q) => q.eq("ownerId", userId));
		for await (const list of ownedListsQuery) {
			const itemsQuery = ctx.db
				.query("items")
				.withIndex("by_list", (q) => q.eq("listId", list._id));
			for await (const item of itemsQuery) {
				await ctx.db.delete(item._id);
			}
			const tagsQuery = ctx.db
				.query("listTags")
				.withIndex("by_list", (q) => q.eq("listId", list._id));
			for await (const tag of tagsQuery) {
				await ctx.db.delete(tag._id);
			}
			const editorsQuery = ctx.db
				.query("listEditors")
				.withIndex("by_list", (q) => q.eq("listId", list._id));
			for await (const editor of editorsQuery) {
				await ctx.db.delete(editor._id);
			}
			await ctx.db.delete(list._id);
		}
		const editorEntriesQuery = ctx.db
			.query("listEditors")
			.withIndex("by_user", (q) => q.eq("userId", userId));
		for await (const entry of editorEntriesQuery) {
			await ctx.db.delete(entry._id);
		}
		const subscription = await ctx.db
			.query("subscriptions")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.unique();
		if (subscription) {
			await ctx.db.delete(subscription._id);
		}
		await ctx.db.delete(userId);
		return null;
	},
});
