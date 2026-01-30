import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireListAccess, requireListOwner } from "./lib/auth";
import { requireSubscription } from "./lib/subscription";
import {
	listStatusValidator,
	listTypeValidator,
	sortByValidator,
} from "./schema";

const listReturnValidator = v.object({
	_id: v.id("lists"),
	_creationTime: v.number(),
	ownerId: v.id("users"),
	name: v.string(),
	icon: v.optional(v.string()),
	type: listTypeValidator,
	status: listStatusValidator,
	sortBy: sortByValidator,
	sortAscending: v.boolean(),
	showCompleted: v.boolean(),
});

/**
 * Get all lists the user owns or has access to as editor.
 */
export const getUserLists = query({
	args: {
		status: v.optional(listStatusValidator),
	},
	returns: v.array(
		v.object({
			...listReturnValidator.fields,
			isOwner: v.boolean(),
		}),
	),
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireSubscription(ctx, userId);

		// Get owned lists
		const ownedListsQuery = ctx.db
			.query("lists")
			.withIndex("by_owner", (q) => q.eq("ownerId", userId));

		const ownedLists = await ownedListsQuery.collect();

		// Filter by status if specified
		const filteredOwnedLists = args.status
			? ownedLists.filter((list) => list.status === args.status)
			: ownedLists;

		// Get lists where user is an editor
		const editorEntries = await ctx.db
			.query("listEditors")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.collect();

		const sharedLists = await Promise.all(
			editorEntries.map(async (entry) => {
				const list = await ctx.db.get(entry.listId);
				return list;
			}),
		);

		// Filter out nulls and apply status filter
		const validSharedLists = sharedLists.filter(
			(list): list is NonNullable<typeof list> => {
				if (!list) return false;
				if (args.status && list.status !== args.status) return false;
				return true;
			},
		);

		// Combine and mark ownership
		const allLists = [
			...filteredOwnedLists.map((list) => ({ ...list, isOwner: true })),
			...validSharedLists.map((list) => ({ ...list, isOwner: false })),
		];

		// Sort by creation time, newest first
		return allLists.sort((a, b) => b._creationTime - a._creationTime);
	},
});

/**
 * Get a single list by ID.
 */
export const getList = query({
	args: {
		listId: v.id("lists"),
	},
	returns: v.union(
		v.object({
			...listReturnValidator.fields,
			isOwner: v.boolean(),
		}),
		v.null(),
	),
	handler: async (ctx, args) => {
		const { userId, list, isOwner } = await requireListAccess(ctx, args.listId);
		await requireSubscription(ctx, userId);
		return { ...list, isOwner };
	},
});

/**
 * Create a new list.
 */
export const createList = mutation({
	args: {
		name: v.string(),
		type: v.optional(listTypeValidator),
		icon: v.optional(v.string()),
	},
	returns: v.id("lists"),
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireSubscription(ctx, userId);

		return await ctx.db.insert("lists", {
			ownerId: userId,
			name: args.name,
			icon: args.icon,
			type: args.type ?? "simple",
			status: "active",
			sortBy: "created_at",
			sortAscending: true,
			showCompleted: true,
		});
	},
});

/**
 * Update a list (owner only).
 */
export const updateList = mutation({
	args: {
		listId: v.id("lists"),
		name: v.optional(v.string()),
		icon: v.optional(v.string()),
		type: v.optional(listTypeValidator),
		sortBy: v.optional(sortByValidator),
		sortAscending: v.optional(v.boolean()),
		showCompleted: v.optional(v.boolean()),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const { userId } = await requireListOwner(ctx, args.listId);
		await requireSubscription(ctx, userId);

		const { listId, ...updates } = args;

		// Filter out undefined values
		const filteredUpdates = Object.fromEntries(
			Object.entries(updates).filter(([, value]) => value !== undefined),
		);

		if (Object.keys(filteredUpdates).length > 0) {
			await ctx.db.patch(listId, filteredUpdates);
		}

		return null;
	},
});

/**
 * Delete a list and all associated data (owner only).
 */
export const deleteList = mutation({
	args: {
		listId: v.id("lists"),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const { userId } = await requireListOwner(ctx, args.listId);
		await requireSubscription(ctx, userId);

		// Delete all items in the list
		const items = await ctx.db
			.query("items")
			.withIndex("by_list", (q) => q.eq("listId", args.listId))
			.collect();

		for (const item of items) {
			await ctx.db.delete(item._id);
		}

		// Delete all tags in the list
		const tags = await ctx.db
			.query("listTags")
			.withIndex("by_list", (q) => q.eq("listId", args.listId))
			.collect();

		for (const tag of tags) {
			await ctx.db.delete(tag._id);
		}

		// Delete all editor entries
		const editors = await ctx.db
			.query("listEditors")
			.withIndex("by_list", (q) => q.eq("listId", args.listId))
			.collect();

		for (const editor of editors) {
			await ctx.db.delete(editor._id);
		}

		// Delete the list itself
		await ctx.db.delete(args.listId);

		return null;
	},
});

/**
 * Archive a list (owner only).
 */
export const archiveList = mutation({
	args: {
		listId: v.id("lists"),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const { userId } = await requireListOwner(ctx, args.listId);
		await requireSubscription(ctx, userId);
		await ctx.db.patch(args.listId, { status: "archived" });
		return null;
	},
});

/**
 * Restore an archived list (owner only).
 */
export const restoreList = mutation({
	args: {
		listId: v.id("lists"),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const { userId } = await requireListOwner(ctx, args.listId);
		await requireSubscription(ctx, userId);
		await ctx.db.patch(args.listId, { status: "active" });
		return null;
	},
});
