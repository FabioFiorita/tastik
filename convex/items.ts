import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { appError } from "./lib/errors";
import { assertItemsUnderLimit } from "./lib/limits";
import {
	getListAccessOrNull,
	requireAuth,
	requireListAccess,
} from "./lib/permissions";
import { assertRateLimit } from "./lib/rateLimiter";
import { compareByDateNameSort } from "./lib/sorting";
import {
	validateDescription,
	validateItemName,
	validateNotes,
	validateStep,
	validateUrl,
} from "./lib/validation";
import { itemStatusValidator, itemTypeValidator } from "./schema";

// ── Queries ──────────────────────────────────────────────────────────

/**
 * Get all items in a list.
 */
export const getListItems = query({
	args: {
		listId: v.id("lists"),
		includeCompleted: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const access = await getListAccessOrNull(ctx, args.listId);
		if (!access) {
			return [];
		}
		const { list } = access;

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

		return items.sort((a, b) =>
			compareByDateNameSort(a, b, list.sortBy, list.sortAscending),
		);
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
		const item = await ctx.db.get("items", args.itemId);
		if (!item) return null;

		await requireListAccess(ctx, item.listId);
		return item;
	},
});

/**
 * Search items across all accessible lists.
 * Returns items with list info for grouping in search results.
 */
export const searchItems = query({
	args: {
		query: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);

		const searchQuery = args.query.trim();
		if (!searchQuery) {
			return [];
		}

		// Get user's owned lists
		const ownedLists = await ctx.db
			.query("lists")
			.withIndex("by_owner", (q) => q.eq("ownerId", userId))
			.collect();

		// Get lists where user is an editor
		const editorEntries = await ctx.db
			.query("listEditors")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.collect();

		// Batch fetch shared lists
		const sharedListIds = editorEntries.map((entry) => entry.listId);
		const sharedLists = await Promise.all(
			sharedListIds.map((id) => ctx.db.get("lists", id)),
		);

		// Build a map of accessible lists for quick lookup
		const accessibleListsMap = new Map<Id<"lists">, Doc<"lists">>();
		for (const list of ownedLists) {
			accessibleListsMap.set(list._id, list);
		}
		for (const list of sharedLists) {
			if (list) {
				accessibleListsMap.set(list._id, list);
			}
		}

		const normalizedQuery = searchQuery.toLocaleLowerCase();
		const accessibleListIds = Array.from(accessibleListsMap.keys());
		const listItems = await Promise.all(
			accessibleListIds.map((listId) =>
				ctx.db
					.query("items")
					.withIndex("by_list", (q) => q.eq("listId", listId))
					.collect(),
			),
		);

		const searchResults = listItems
			.flat()
			.filter((item) => {
				const nameMatches = item.name
					.toLocaleLowerCase()
					.includes(normalizedQuery);
				const descriptionMatches =
					item.description?.toLocaleLowerCase().includes(normalizedQuery) ??
					false;
				return nameMatches || descriptionMatches;
			})
			.sort((a, b) => {
				const aUpdatedAt = a.updatedAt ?? a._creationTime;
				const bUpdatedAt = b.updatedAt ?? b._creationTime;
				return bUpdatedAt - aUpdatedAt;
			})
			.slice(0, 50)
			.map((item) => {
				const list = accessibleListsMap.get(item.listId);
				return {
					...item,
					listName: list?.name ?? "Unknown",
					listIcon: list?.icon,
				};
			});

		return searchResults;
	},
});

// ── Mutations ────────────────────────────────────────────────────────

/**
 * Create a new item in a list.
 */
export const createItem = mutation({
	args: {
		listId: v.id("lists"),
		name: v.string(),
		type: v.optional(itemTypeValidator),
		currentValue: v.optional(v.number()),
		step: v.optional(v.number()),
		calculatorValue: v.optional(v.number()),
		status: v.optional(itemStatusValidator),
		completed: v.optional(v.boolean()),
		tagId: v.optional(v.id("listTags")),
		description: v.optional(v.string()),
		url: v.optional(v.string()),
		notes: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { userId } = await requireListAccess(ctx, args.listId);
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
		if (args.tagId) {
			await assertTagBelongsToList(ctx, args.listId, args.tagId);
		}

		// Get the highest sort order in the list (optimized with index)
		const lastItem = await ctx.db
			.query("items")
			.withIndex("by_list_and_sortOrder", (q) => q.eq("listId", args.listId))
			.order("desc")
			.first();

		const maxSortOrder = lastItem?.sortOrder ?? 0;
		const itemType = args.type ?? "simple";

		const now = Date.now();
		const initialStatus =
			itemType === "kanban" ? (args.status ?? "todo") : undefined;
		const initialCurrentValue =
			itemType === "stepper" ? (args.currentValue ?? 0) : undefined;
		const initialCompleted = args.completed ?? initialStatus === "done";

		const itemId = await ctx.db.insert("items", {
			listId: args.listId,
			name: args.name.trim(),
			type: itemType,
			completed: initialCompleted,
			completedAt: initialCompleted ? now : undefined,
			sortOrder: maxSortOrder + 1,
			// Stepper defaults
			currentValue: initialCurrentValue,
			step: itemType === "stepper" ? (args.step ?? 1.0) : undefined,
			// Calculator defaults
			calculatorValue:
				itemType === "calculator" ? (args.calculatorValue ?? 0) : undefined,
			// Kanban defaults
			status: initialStatus,
			// Optional fields
			tagId: args.tagId,
			description: args.description,
			url: args.url,
			notes: args.notes,
			updatedAt: now,
		});

		await ctx.db.patch(args.listId, { updatedAt: now });
		return itemId;
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
		currentValue: v.optional(v.union(v.number(), v.null())),
		step: v.optional(v.union(v.number(), v.null())),
		calculatorValue: v.optional(v.union(v.number(), v.null())),
		status: v.optional(v.union(itemStatusValidator, v.null())),
		completed: v.optional(v.boolean()),
		tagId: v.optional(v.union(v.id("listTags"), v.null())),
		description: v.optional(v.union(v.string(), v.null())),
		url: v.optional(v.union(v.string(), v.null())),
		notes: v.optional(v.union(v.string(), v.null())),
		sortOrder: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const item = await ctx.db.get("items", args.itemId);
		if (!item) {
			throw new ConvexError(appError("ITEM_NOT_FOUND", "Item not found"));
		}

		await requireListAccess(ctx, item.listId);

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
		if (args.tagId !== undefined && args.tagId !== null) {
			await assertTagBelongsToList(ctx, item.listId, args.tagId);
		}

		const {
			itemId,
			tagId,
			description,
			url,
			notes,
			step,
			currentValue,
			calculatorValue,
			status,
			completed,
			...updates
		} = args;

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
		if (currentValue !== undefined) {
			patchData.currentValue = currentValue === null ? undefined : currentValue;
		}
		if (calculatorValue !== undefined) {
			patchData.calculatorValue =
				calculatorValue === null ? undefined : calculatorValue;
		}
		if (status !== undefined) {
			patchData.status = status === null ? undefined : status;
		}
		if (completed !== undefined) {
			patchData.completed = completed;
		} else if (status !== undefined && status !== null) {
			patchData.completed = status === "done";
		}

		if (Object.keys(patchData).length > 0) {
			const now = Date.now();
			const nextCompleted = patchData.completed;
			if (nextCompleted === true && !item.completed) {
				patchData.completedAt = now;
			}
			if (nextCompleted === false && item.completed) {
				patchData.completedAt = undefined;
			}

			await ctx.db.patch(itemId, {
				...patchData,
				updatedAt: now,
			});

			// Update parent list's updatedAt
			await ctx.db.patch(item.listId, { updatedAt: now });
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
		const item = await ctx.db.get("items", args.itemId);
		if (!item) {
			throw new ConvexError(appError("ITEM_NOT_FOUND", "Item not found"));
		}

		await requireListAccess(ctx, item.listId);

		const newCompleted = !item.completed;
		const now = Date.now();
		await ctx.db.patch(args.itemId, {
			completed: newCompleted,
			completedAt: newCompleted ? now : undefined,
			updatedAt: now,
		});

		// Update parent list's updatedAt
		await ctx.db.patch(item.listId, { updatedAt: now });
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
		const item = await ctx.db.get("items", args.itemId);
		if (!item) {
			throw new ConvexError(appError("ITEM_NOT_FOUND", "Item not found"));
		}

		if (item.type !== "stepper" && item.type !== "calculator") {
			throw new ConvexError(
				appError(
					"ITEM_NOT_STEPPER_TYPE",
					"Item is not a numeric type (stepper or calculator)",
				),
			);
		}

		await requireListAccess(ctx, item.listId);
		const now = Date.now();

		if (item.type === "calculator") {
			const newValue =
				args.setValue !== undefined
					? args.setValue
					: (item.calculatorValue ?? 0) + (args.delta ?? 0);

			await ctx.db.patch(args.itemId, {
				calculatorValue: newValue,
				updatedAt: now,
			});

			// Update parent list's updatedAt
			await ctx.db.patch(item.listId, { updatedAt: now });
			return;
		}

		let newValue: number;
		if (args.setValue !== undefined) {
			newValue = args.setValue;
		} else {
			// Use custom step if provided, otherwise fall back to item.step, then 1
			const delta = args.delta ?? item.step ?? 1;
			newValue = (item.currentValue ?? 0) + delta;
		}

		await ctx.db.patch(args.itemId, {
			currentValue: newValue,
			updatedAt: now,
		});

		// Update parent list's updatedAt
		await ctx.db.patch(item.listId, { updatedAt: now });
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
		const item = await ctx.db.get("items", args.itemId);
		if (!item) {
			throw new ConvexError(appError("ITEM_NOT_FOUND", "Item not found"));
		}

		if (item.type !== "kanban") {
			throw new ConvexError(
				appError("ITEM_NOT_KANBAN_TYPE", "Item is not a kanban type"),
			);
		}

		await requireListAccess(ctx, item.listId);

		const completed = args.status === "done";
		const now = Date.now();
		await ctx.db.patch(args.itemId, {
			status: args.status,
			completed,
			completedAt: completed && !item.completed ? now : item.completedAt,
			updatedAt: now,
		});

		// Update parent list's updatedAt
		await ctx.db.patch(item.listId, { updatedAt: now });
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
		const item = await ctx.db.get("items", args.itemId);
		if (!item) {
			throw new ConvexError(appError("ITEM_NOT_FOUND", "Item not found"));
		}

		await requireListAccess(ctx, item.listId);
		await ctx.db.delete(args.itemId);

		// Update parent list's updatedAt
		await ctx.db.patch(item.listId, { updatedAt: Date.now() });
	},
});

// ── Helpers ──────────────────────────────────────────────────────────

async function assertTagBelongsToList(
	ctx: MutationCtx,
	listId: Id<"lists">,
	tagId: Id<"listTags">,
): Promise<void> {
	const tag = await ctx.db.get(tagId);
	if (!tag || tag.listId !== listId) {
		throw new ConvexError(
			appError("TAG_NOT_IN_LIST", "Tag does not belong to this list"),
		);
	}
}
