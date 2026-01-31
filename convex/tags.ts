import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { appError } from "./lib/errors";
import { requireListAccess, requireListOwner } from "./lib/permissions";
import { requireSubscription } from "./lib/subscription";

/**
 * Get all tags for a list.
 */
export const getListTags = query({
	args: {
		listId: v.id("lists"),
	},
	handler: async (ctx, args) => {
		const { userId } = await requireListAccess(ctx, args.listId);
		await requireSubscription(ctx, userId);

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

		const existingTag = await ctx.db
			.query("listTags")
			.withIndex("by_list_and_name", (q) =>
				q.eq("listId", args.listId).eq("name", args.name),
			)
			.unique();

		if (existingTag) {
			throw new ConvexError(
				appError("TAG_NAME_EXISTS", "Tag with this name already exists"),
			);
		}

		await ctx.db.insert("listTags", {
			listId: args.listId,
			name: args.name,
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
		const tag = await ctx.db.get(args.tagId);
		if (!tag) {
			throw new ConvexError(appError("TAG_NOT_FOUND", "Tag not found"));
		}

		const { userId } = await requireListOwner(ctx, tag.listId);
		await requireSubscription(ctx, userId);

		const newName = args.name;
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
		if (args.name !== undefined) {
			updates.name = args.name;
		}
		if (args.color !== undefined) {
			updates.color = args.color === null ? undefined : args.color;
		}

		if (Object.keys(updates).length > 0) {
			await ctx.db.patch(args.tagId, updates);
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
		const tag = await ctx.db.get(args.tagId);
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
			await ctx.db.patch(item._id, { tagId: undefined });
		}

		await ctx.db.delete(args.tagId);
	},
});
