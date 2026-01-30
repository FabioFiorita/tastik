import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { requireListAccess } from "./lib/auth";
import { requireSubscription } from "./lib/subscription";
import { itemStatusValidator, itemTypeValidator } from "./schema";

const itemReturnValidator = v.object({
	_id: v.id("items"),
	_creationTime: v.number(),
	listId: v.id("lists"),
	name: v.string(),
	type: itemTypeValidator,
	completed: v.boolean(),
	completedAt: v.optional(v.number()),
	currentValue: v.optional(v.number()),
	targetValue: v.optional(v.number()),
	calculatorValue: v.optional(v.number()),
	status: v.optional(itemStatusValidator),
	tagId: v.optional(v.id("listTags")),
	notes: v.optional(v.string()),
	sortOrder: v.number(),
});

/**
 * Get all items in a list.
 */
export const getListItems = query({
	args: {
		listId: v.id("lists"),
		includeCompleted: v.optional(v.boolean()),
	},
	returns: v.array(itemReturnValidator),
	handler: async (ctx, args) => {
		const { userId } = await requireListAccess(ctx, args.listId);
		await requireSubscription(ctx, userId);

		let items: Doc<"items">[];
		if (args.includeCompleted === false) {
			items = await ctx.db
				.query("items")
				.withIndex("by_list_and_completed", (q) =>
					q.eq("listId", args.listId).eq("completed", false),
				)
				.collect();
		} else {
			items = await ctx.db
				.query("items")
				.withIndex("by_list", (q) => q.eq("listId", args.listId))
				.collect();
		}

		// Sort by sortOrder
		return items.sort((a, b) => a.sortOrder - b.sortOrder);
	},
});

/**
 * Get a single item by ID.
 */
export const getItem = query({
	args: {
		itemId: v.id("items"),
	},
	returns: v.union(itemReturnValidator, v.null()),
	handler: async (ctx, args) => {
		const item = await ctx.db.get(args.itemId);
		if (!item) return null;

		const { userId } = await requireListAccess(ctx, item.listId);
		await requireSubscription(ctx, userId);
		return item;
	},
});

/**
 * Create a new item in a list.
 */
export const createItem = mutation({
	args: {
		listId: v.id("lists"),
		name: v.string(),
		type: v.optional(itemTypeValidator),
		targetValue: v.optional(v.number()),
		tagId: v.optional(v.id("listTags")),
		notes: v.optional(v.string()),
	},
	returns: v.id("items"),
	handler: async (ctx, args) => {
		const { userId } = await requireListAccess(ctx, args.listId);
		await requireSubscription(ctx, userId);

		// Get the highest sort order in the list
		const existingItems = await ctx.db
			.query("items")
			.withIndex("by_list", (q) => q.eq("listId", args.listId))
			.collect();

		const maxSortOrder = existingItems.reduce(
			(max, item) => Math.max(max, item.sortOrder),
			0,
		);

		const itemType = args.type ?? "simple";

		return await ctx.db.insert("items", {
			listId: args.listId,
			name: args.name,
			type: itemType,
			completed: false,
			sortOrder: maxSortOrder + 1,
			// Stepper defaults
			currentValue: itemType === "stepper" ? 0 : undefined,
			targetValue: itemType === "stepper" ? args.targetValue : undefined,
			// Calculator defaults
			calculatorValue: itemType === "calculator" ? 0 : undefined,
			// Kanban defaults
			status: itemType === "kanban" ? "todo" : undefined,
			// Optional fields
			tagId: args.tagId,
			notes: args.notes,
		});
	},
});

/**
 * Update an item's fields.
 */
export const updateItem = mutation({
	args: {
		itemId: v.id("items"),
		name: v.optional(v.string()),
		type: v.optional(itemTypeValidator),
		targetValue: v.optional(v.number()),
		tagId: v.optional(v.union(v.id("listTags"), v.null())),
		notes: v.optional(v.union(v.string(), v.null())),
		sortOrder: v.optional(v.number()),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const item = await ctx.db.get(args.itemId);
		if (!item) {
			throw new Error("Item not found");
		}

		const { userId } = await requireListAccess(ctx, item.listId);
		await requireSubscription(ctx, userId);

		const { itemId, tagId, notes, ...updates } = args;

		// Build updates object, handling null values for optional fields
		const patchData: Record<string, unknown> = { ...updates };
		if (tagId !== undefined) {
			patchData.tagId = tagId === null ? undefined : tagId;
		}
		if (notes !== undefined) {
			patchData.notes = notes === null ? undefined : notes;
		}

		// Filter out undefined values from updates
		const filteredUpdates = Object.fromEntries(
			Object.entries(patchData).filter(([, value]) => value !== undefined),
		);

		if (Object.keys(filteredUpdates).length > 0) {
			await ctx.db.patch(itemId, filteredUpdates);
		}

		return null;
	},
});

/**
 * Toggle an item's completion status.
 */
export const toggleItemComplete = mutation({
	args: {
		itemId: v.id("items"),
	},
	returns: v.boolean(),
	handler: async (ctx, args) => {
		const item = await ctx.db.get(args.itemId);
		if (!item) {
			throw new Error("Item not found");
		}

		const { userId } = await requireListAccess(ctx, item.listId);
		await requireSubscription(ctx, userId);

		const newCompleted = !item.completed;
		await ctx.db.patch(args.itemId, {
			completed: newCompleted,
			completedAt: newCompleted ? Date.now() : undefined,
		});

		return newCompleted;
	},
});

/**
 * Increment or set the current value for stepper items.
 */
export const incrementItemValue = mutation({
	args: {
		itemId: v.id("items"),
		delta: v.optional(v.number()),
		setValue: v.optional(v.number()),
	},
	returns: v.number(),
	handler: async (ctx, args) => {
		const item = await ctx.db.get(args.itemId);
		if (!item) {
			throw new Error("Item not found");
		}

		if (item.type !== "stepper") {
			throw new Error("Item is not a stepper type");
		}

		const { userId } = await requireListAccess(ctx, item.listId);
		await requireSubscription(ctx, userId);

		let newValue: number;
		if (args.setValue !== undefined) {
			newValue = args.setValue;
		} else {
			const delta = args.delta ?? 1;
			newValue = (item.currentValue ?? 0) + delta;
		}

		// Check if completed (reached target)
		const completed =
			item.targetValue !== undefined && newValue >= item.targetValue;

		await ctx.db.patch(args.itemId, {
			currentValue: newValue,
			completed,
			completedAt: completed && !item.completed ? Date.now() : item.completedAt,
		});

		return newValue;
	},
});

/**
 * Update the status for kanban items.
 */
export const updateItemStatus = mutation({
	args: {
		itemId: v.id("items"),
		status: itemStatusValidator,
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const item = await ctx.db.get(args.itemId);
		if (!item) {
			throw new Error("Item not found");
		}

		if (item.type !== "kanban") {
			throw new Error("Item is not a kanban type");
		}

		const { userId } = await requireListAccess(ctx, item.listId);
		await requireSubscription(ctx, userId);

		const completed = args.status === "done";
		await ctx.db.patch(args.itemId, {
			status: args.status,
			completed,
			completedAt: completed && !item.completed ? Date.now() : item.completedAt,
		});

		return null;
	},
});

/**
 * Delete a single item.
 */
export const deleteItem = mutation({
	args: {
		itemId: v.id("items"),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const item = await ctx.db.get(args.itemId);
		if (!item) {
			throw new Error("Item not found");
		}

		const { userId } = await requireListAccess(ctx, item.listId);
		await requireSubscription(ctx, userId);
		await ctx.db.delete(args.itemId);

		return null;
	},
});

/**
 * Delete all completed items in a list.
 */
export const deleteCompletedItems = mutation({
	args: {
		listId: v.id("lists"),
	},
	returns: v.number(),
	handler: async (ctx, args) => {
		const { userId } = await requireListAccess(ctx, args.listId);
		await requireSubscription(ctx, userId);

		const completedItems = await ctx.db
			.query("items")
			.withIndex("by_list_and_completed", (q) =>
				q.eq("listId", args.listId).eq("completed", true),
			)
			.collect();

		for (const item of completedItems) {
			await ctx.db.delete(item._id);
		}

		return completedItems.length;
	},
});
