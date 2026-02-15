import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { appError } from "./lib/errors";
import { assertTagsUnderLimit } from "./lib/limits";
import {
	requireListAccess,
	requireListOwner,
	requireSubscription,
} from "./lib/permissions";
import { validateTagName } from "./lib/validation";

/**
 * Get all tags for a list.
 */
export const getListTags = query({
	args: {
		listId: v.id("lists"),
	},
	handler: async (ctx, args) => {
		await requireListAccess(ctx, args.listId);

		const tags = await ctx.db
			.query("listTags")
			.withIndex("by_list", (q) => q.eq("listId", args.listId))
			.collect();

		// Sort alphabetically by name
		return tags.sort((a, b) => a.name.localeCompare(b.name));
	},
});

/**
 * Create a new tag for a list (owner only).
 */
export const createTag = mutation({
	args: {
		listId: v.id("lists"),
		name: v.string(),
		color: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { userId } = await requireListOwner(ctx, args.listId);
		await requireSubscription(ctx, userId);
		await assertTagsUnderLimit(ctx, args.listId);
		validateTagName(args.name);

		const trimmedName = args.name.trim();

		const existingTag = await ctx.db
			.query("listTags")
			.withIndex("by_list_and_name", (q) =>
				q.eq("listId", args.listId).eq("name", trimmedName),
			)
			.unique();

		if (existingTag) {
			throw new ConvexError(
				appError("TAG_NAME_EXISTS", "Tag with this name already exists"),
			);
		}

		return await ctx.db.insert("listTags", {
			listId: args.listId,
			name: trimmedName,
			color: args.color,
		});
	},
});

/**
 * Update a tag (owner only).
 */
export const updateTag = mutation({
	args: {
		tagId: v.id("listTags"),
		name: v.optional(v.string()),
		color: v.optional(v.union(v.string(), v.null())),
	},
	handler: async (ctx, args) => {
		const tag = await ctx.db.get("listTags", args.tagId);
		if (!tag) {
			throw new ConvexError(appError("TAG_NOT_FOUND", "Tag not found"));
		}

		const { userId } = await requireListOwner(ctx, tag.listId);
		await requireSubscription(ctx, userId);

		if (args.name !== undefined) {
			validateTagName(args.name);
		}

		const newName = args.name?.trim();
		if (newName && newName !== tag.name) {
			const existingTag = await ctx.db
				.query("listTags")
				.withIndex("by_list_and_name", (q) =>
					q.eq("listId", tag.listId).eq("name", newName),
				)
				.unique();

			if (existingTag) {
				throw new ConvexError(
					appError("TAG_NAME_EXISTS", "Tag with this name already exists"),
				);
			}
		}

		const updates: { name?: string; color?: string } = {};
		if (newName !== undefined) {
			updates.name = newName;
		}
		if (args.color !== undefined) {
			updates.color = args.color === null ? undefined : args.color;
		}

		if (Object.keys(updates).length > 0) {
			await ctx.db.patch("listTags", args.tagId, updates);
		}
	},
});

/**
 * Delete a tag and unset it from all items (owner only).
 */
export const deleteTag = mutation({
	args: {
		tagId: v.id("listTags"),
	},
	handler: async (ctx, args) => {
		const tag = await ctx.db.get("listTags", args.tagId);
		if (!tag) {
			throw new ConvexError(appError("TAG_NOT_FOUND", "Tag not found"));
		}

		const { userId } = await requireListOwner(ctx, tag.listId);
		await requireSubscription(ctx, userId);

		const itemsWithTag = await ctx.db
			.query("items")
			.withIndex("by_list_and_tag", (q) =>
				q.eq("listId", tag.listId).eq("tagId", args.tagId),
			)
			.collect();

		for (const item of itemsWithTag) {
			await ctx.db.patch("items", item._id, { tagId: undefined });
		}

		await ctx.db.delete("listTags", args.tagId);
	},
});
