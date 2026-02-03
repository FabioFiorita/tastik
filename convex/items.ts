import { ConvexError, v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { appError } from "./lib/errors";
import { assertItemsUnderLimit } from "./lib/limits";
import { requireListAccess, requireSubscription } from "./lib/permissions";
import { assertRateLimit } from "./lib/rateLimiter";
import {
	validateDescription,
	validateItemName,
	validateNotes,
	validateStep,
	validateUrl,
} from "./lib/validation";
import { itemStatusValidator, itemTypeValidator } from "./schema";

/**
 * Get all items in a list.
 */
export const getListItems = query({
	args: {
		listId: v.id("lists"),
		includeCompleted: v.optional(v.boolean()),
	},
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
		step: v.optional(v.number()),
		tagId: v.optional(v.id("listTags")),
		description: v.optional(v.string()),
		url: v.optional(v.string()),
		notes: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { userId } = await requireListAccess(ctx, args.listId);
		await requireSubscription(ctx, userId);
		await assertRateLimit(ctx, "createItem", userId);
		await assertItemsUnderLimit(ctx, args.listId);
		validateItemName(args.name);

		// Validate optional fields if provided
		if (args.notes) {
			validateNotes(args.notes);
		}
		if (args.description) {
			validateDescription(args.description);
		}
		if (args.url) {
			validateUrl(args.url);
		}
		if (args.step !== undefined) {
			validateStep(args.step);
		}

		// Get the highest sort order in the list (optimized with index)
		const lastItem = await ctx.db
			.query("items")
			.withIndex("by_list_and_sortOrder", (q) => q.eq("listId", args.listId))
			.order("desc")
			.first();

		const maxSortOrder = lastItem?.sortOrder ?? 0;

		const itemType = args.type ?? "simple";

		await ctx.db.insert("items", {
			listId: args.listId,
			name: args.name.trim(),
			type: itemType,
			completed: false,
			sortOrder: maxSortOrder + 1,
			// Stepper defaults
			currentValue: itemType === "stepper" ? 0 : undefined,
			targetValue: itemType === "stepper" ? args.targetValue : undefined,
			step: itemType === "stepper" ? (args.step ?? 1.0) : undefined,
			// Calculator defaults
			calculatorValue: itemType === "calculator" ? 0 : undefined,
			// Kanban defaults
			status: itemType === "kanban" ? "todo" : undefined,
			// Optional fields
			tagId: args.tagId,
			description: args.description,
			url: args.url,
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
		step: v.optional(v.union(v.number(), v.null())),
		tagId: v.optional(v.union(v.id("listTags"), v.null())),
		description: v.optional(v.union(v.string(), v.null())),
		url: v.optional(v.union(v.string(), v.null())),
		notes: v.optional(v.union(v.string(), v.null())),
		sortOrder: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const item = await ctx.db.get(args.itemId);
		if (!item) {
			throw new ConvexError(appError("ITEM_NOT_FOUND", "Item not found"));
		}

		const { userId } = await requireListAccess(ctx, item.listId);
		await requireSubscription(ctx, userId);

		// Validate name if provided
		if (args.name !== undefined) {
			validateItemName(args.name);
		}

		// Validate optional fields if provided (and not null)
		if (args.notes !== undefined && args.notes !== null) {
			validateNotes(args.notes);
		}
		if (args.description !== undefined && args.description !== null) {
			validateDescription(args.description);
		}
		if (args.url !== undefined && args.url !== null) {
			validateUrl(args.url);
		}
		if (args.step !== undefined && args.step !== null) {
			validateStep(args.step);
		}

		const { itemId, tagId, description, url, notes, step, ...updates } = args;

		// Build updates object, handling null values for optional fields
		const patchData: Record<string, unknown> = { ...updates };

		// Trim name if it's being updated
		if (patchData.name && typeof patchData.name === "string") {
			patchData.name = patchData.name.trim();
		}

		if (tagId !== undefined) {
			patchData.tagId = tagId === null ? undefined : tagId;
		}
		if (description !== undefined) {
			patchData.description = description === null ? undefined : description;
		}
		if (url !== undefined) {
			patchData.url = url === null ? undefined : url;
		}
		if (notes !== undefined) {
			patchData.notes = notes === null ? undefined : notes;
		}
		if (step !== undefined) {
			patchData.step = step === null ? undefined : step;
		}

		// Filter out undefined values from updates
		const filteredUpdates = Object.fromEntries(
			Object.entries(patchData).filter(([, value]) => value !== undefined),
		);

		if (Object.keys(filteredUpdates).length > 0) {
			await ctx.db.patch(itemId, filteredUpdates);
		}
	},
});

/**
 * Toggle an item's completion status.
 */
export const toggleItemComplete = mutation({
	args: {
		itemId: v.id("items"),
	},
	handler: async (ctx, args) => {
		const item = await ctx.db.get(args.itemId);
		if (!item) {
			throw new ConvexError(appError("ITEM_NOT_FOUND", "Item not found"));
		}

		const { userId } = await requireListAccess(ctx, item.listId);
		await requireSubscription(ctx, userId);

		const newCompleted = !item.completed;
		await ctx.db.patch(args.itemId, {
			completed: newCompleted,
			completedAt: newCompleted ? Date.now() : undefined,
		});
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
	handler: async (ctx, args) => {
		const item = await ctx.db.get(args.itemId);
		if (!item) {
			throw new ConvexError(appError("ITEM_NOT_FOUND", "Item not found"));
		}

		if (item.type !== "stepper") {
			throw new ConvexError(
				appError("ITEM_NOT_STEPPER_TYPE", "Item is not a stepper type"),
			);
		}

		const { userId } = await requireListAccess(ctx, item.listId);
		await requireSubscription(ctx, userId);

		let newValue: number;
		if (args.setValue !== undefined) {
			newValue = args.setValue;
		} else {
			// Use custom step if provided, otherwise fall back to item.step, then 1
			const delta = args.delta ?? item.step ?? 1;
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
	handler: async (ctx, args) => {
		const item = await ctx.db.get(args.itemId);
		if (!item) {
			throw new ConvexError(appError("ITEM_NOT_FOUND", "Item not found"));
		}

		if (item.type !== "kanban") {
			throw new ConvexError(
				appError("ITEM_NOT_KANBAN_TYPE", "Item is not a kanban type"),
			);
		}

		const { userId } = await requireListAccess(ctx, item.listId);
		await requireSubscription(ctx, userId);

		const completed = args.status === "done";
		await ctx.db.patch(args.itemId, {
			status: args.status,
			completed,
			completedAt: completed && !item.completed ? Date.now() : item.completedAt,
		});
	},
});

/**
 * Delete a single item.
 */
export const deleteItem = mutation({
	args: {
		itemId: v.id("items"),
	},
	handler: async (ctx, args) => {
		const item = await ctx.db.get(args.itemId);
		if (!item) {
			throw new ConvexError(appError("ITEM_NOT_FOUND", "Item not found"));
		}

		const { userId } = await requireListAccess(ctx, item.listId);
		await requireSubscription(ctx, userId);
		await ctx.db.delete(args.itemId);
	},
});
