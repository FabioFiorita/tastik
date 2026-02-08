import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { appError } from "./lib/errors";
import {
	assertListsUnderLimit,
	FREE_ALLOWED_LIST_TYPES,
	MAX_ITEMS_PER_LIST,
} from "./lib/limits";
import {
	getListAccessOrNull,
	isUserSubscribed,
	requireAuth,
	requireListAccess,
	requireListOwner,
	requirePaidFeature,
} from "./lib/permissions";
import { assertRateLimit } from "./lib/rateLimiter";
import { validateListName } from "./lib/validation";
import {
	listStatusValidator,
	listTypeValidator,
	sortByValidator,
} from "./schema";

// ── Queries ──────────────────────────────────────────────────────────

/**
 * Get all lists the user owns or has access to as editor.
 */
export const getUserLists = query({
	args: {
		status: v.optional(listStatusValidator),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);

		// Get user to read sort preferences
		const user = await ctx.db.get(userId);
		const sortBy = user?.listsSortBy ?? "created_at";
		const sortAscending = user?.listsSortAscending ?? false;

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

		// Batch fetch lists (more efficient than N+1 queries)
		const listIds = editorEntries.map((entry) => entry.listId);
		const sharedLists = await Promise.all(
			listIds.map((id) => ctx.db.get("lists", id)),
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

		// Sort based on user preferences
		allLists.sort((a, b) => {
			let comparison = 0;

			if (sortBy === "created_at") {
				comparison = a._creationTime - b._creationTime;
			} else if (sortBy === "updated_at") {
				const aUpdated = a.updatedAt ?? a._creationTime;
				const bUpdated = b.updatedAt ?? b._creationTime;
				comparison = aUpdated - bUpdated;
			} else if (sortBy === "name") {
				comparison = a.name.localeCompare(b.name, undefined, {
					sensitivity: "base",
				});
			}

			return sortAscending ? comparison : -comparison;
		});

		return allLists;
	},
});

/**
 * Get a single list by ID.
 */
export const getList = query({
	args: {
		listId: v.id("lists"),
	},
	handler: async (ctx, args) => {
		const access = await getListAccessOrNull(ctx, args.listId);
		if (!access) {
			return null;
		}

		const { list, isOwner } = access;
		return { ...list, isOwner };
	},
});

/**
 * Export a list as plain text, markdown, or CSV.
 */
export const exportList = query({
	args: {
		listId: v.id("lists"),
		format: v.optional(
			v.union(v.literal("txt"), v.literal("md"), v.literal("csv")),
		),
	},
	handler: async (ctx, args) => {
		const { list } = await requireListAccess(ctx, args.listId);

		// Fetch items
		const items = await ctx.db
			.query("items")
			.withIndex("by_list", (q) => q.eq("listId", args.listId))
			.collect();

		// Fetch tags
		const tags = await ctx.db
			.query("listTags")
			.withIndex("by_list", (q) => q.eq("listId", args.listId))
			.collect();

		// Build tag map for quick lookup
		const tagMap = new Map(tags.map((tag) => [tag._id, tag]));

		// Sort items by sortOrder
		const sortedItems = items.sort((a, b) => a.sortOrder - b.sortOrder);

		// Format based on requested format
		const format = args.format ?? "txt";
		if (format === "txt") {
			return formatPlainText(list, sortedItems, tagMap);
		}
		if (format === "md") {
			return formatMarkdown(list, sortedItems, tagMap);
		}
		return formatCsv(sortedItems, tagMap);
	},
});

// ── Mutations ────────────────────────────────────────────────────────

/**
 * Create a new list.
 */
export const createList = mutation({
	args: {
		name: v.string(),
		type: v.optional(listTypeValidator),
		icon: v.optional(v.string()),
		hideCheckbox: v.optional(v.boolean()),
		showTotal: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		const isSubscribed = await isUserSubscribed(ctx, userId);
		await assertRateLimit(ctx, "createList", userId);
		await assertListsUnderLimit(ctx, userId, isSubscribed);

		const listType = args.type ?? "simple";
		if (!isSubscribed && !FREE_ALLOWED_LIST_TYPES.includes(listType)) {
			throw new ConvexError(
				appError("UPGRADE_REQUIRED", "Upgrade to Pro to use this list type"),
			);
		}

		validateListName(args.name);
		const listId = await ctx.db.insert("lists", {
			ownerId: userId,
			name: args.name.trim(),
			icon: args.icon,
			type: listType,
			status: "active",
			sortBy: "created_at",
			sortAscending: true,
			showCompleted: true,
			hideCheckbox: args.hideCheckbox ?? false,
			showTotal: args.showTotal ?? false,
			updatedAt: Date.now(),
		});
		return listId;
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
		hideCheckbox: v.optional(v.boolean()),
		showTotal: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const { userId } = await requireListOwner(ctx, args.listId);

		if (
			args.type !== undefined &&
			!FREE_ALLOWED_LIST_TYPES.includes(args.type)
		) {
			await requirePaidFeature(ctx, userId, "this list type");
		}

		// Validate name if provided
		if (args.name !== undefined) {
			validateListName(args.name);
		}

		const { listId, ...updates } = args;

		// Filter out undefined values and trim name
		const filteredUpdates = Object.fromEntries(
			Object.entries(updates).filter(([, value]) => value !== undefined),
		);

		// Trim name if it's being updated
		if (filteredUpdates.name && typeof filteredUpdates.name === "string") {
			filteredUpdates.name = filteredUpdates.name.trim();
		}

		if (Object.keys(filteredUpdates).length > 0) {
			await ctx.db.patch(listId, {
				...filteredUpdates,
				updatedAt: Date.now(),
			});
		}
	},
});

/**
 * Delete a list and all associated data (owner only).
 */
export const deleteList = mutation({
	args: {
		listId: v.id("lists"),
	},
	handler: async (ctx, args) => {
		await requireListOwner(ctx, args.listId);

		// Delete all items in the list
		const items = await ctx.db
			.query("items")
			.withIndex("by_list", (q) => q.eq("listId", args.listId))
			.collect();

		for (const item of items) {
			await ctx.db.delete("items", item._id);
		}

		// Delete all tags in the list
		const tags = await ctx.db
			.query("listTags")
			.withIndex("by_list", (q) => q.eq("listId", args.listId))
			.collect();

		for (const tag of tags) {
			await ctx.db.delete("listTags", tag._id);
		}

		// Delete all editor entries
		const editors = await ctx.db
			.query("listEditors")
			.withIndex("by_list", (q) => q.eq("listId", args.listId))
			.collect();

		for (const editor of editors) {
			await ctx.db.delete("listEditors", editor._id);
		}

		await ctx.db.delete("lists", args.listId);
	},
});

/**
 * Archive a list (owner only).
 */
export const archiveList = mutation({
	args: {
		listId: v.id("lists"),
	},
	handler: async (ctx, args) => {
		await requireListOwner(ctx, args.listId);
		await ctx.db.patch(args.listId, {
			status: "archived",
			updatedAt: Date.now(),
		});
	},
});

/**
 * Restore an archived list (owner only).
 */
export const restoreList = mutation({
	args: {
		listId: v.id("lists"),
	},
	handler: async (ctx, args) => {
		await requireListOwner(ctx, args.listId);
		await ctx.db.patch(args.listId, {
			status: "active",
			updatedAt: Date.now(),
		});
	},
});

/**
 * Duplicate a list with all its items and tags (owner only).
 * Editors are NOT copied for privacy.
 */
export const duplicateList = mutation({
	args: {
		listId: v.id("lists"),
	},
	handler: async (ctx, args) => {
		const { userId, list } = await requireListOwner(ctx, args.listId);
		const isSubscribed = await isUserSubscribed(ctx, userId);
		await assertRateLimit(ctx, "duplicateList", userId);
		await assertListsUnderLimit(ctx, userId, isSubscribed);

		if (!isSubscribed && !FREE_ALLOWED_LIST_TYPES.includes(list.type)) {
			throw new ConvexError(
				appError(
					"UPGRADE_REQUIRED",
					"Upgrade to Pro to duplicate this list type",
				),
			);
		}

		// Fetch source items
		const sourceItems = await ctx.db
			.query("items")
			.withIndex("by_list", (q) => q.eq("listId", args.listId))
			.collect();

		// Check items limit
		if (sourceItems.length > MAX_ITEMS_PER_LIST) {
			throw new ConvexError(
				appError(
					"ITEMS_LIMIT_EXCEEDED",
					`Cannot duplicate list with more than ${MAX_ITEMS_PER_LIST} items`,
				),
			);
		}

		// Fetch source tags
		const sourceTags = await ctx.db
			.query("listTags")
			.withIndex("by_list", (q) => q.eq("listId", args.listId))
			.collect();

		// Create new list with " (copy)" suffix
		const newListId = await ctx.db.insert("lists", {
			ownerId: userId,
			name: `${list.name} (copy)`,
			icon: list.icon,
			type: list.type,
			status: list.status,
			sortBy: list.sortBy,
			sortAscending: list.sortAscending,
			showCompleted: list.showCompleted,
			hideCheckbox: list.hideCheckbox,
			showTotal: list.showTotal,
			updatedAt: Date.now(),
		});

		// Duplicate tags and build ID mapping
		const tagIdMap = new Map<Id<"listTags">, Id<"listTags">>();
		for (const sourceTag of sourceTags) {
			const newTagId = await ctx.db.insert("listTags", {
				listId: newListId,
				name: sourceTag.name,
				color: sourceTag.color,
			});
			tagIdMap.set(sourceTag._id, newTagId);
		}

		// Copy all items with remapped tag IDs
		for (const item of sourceItems) {
			await ctx.db.insert("items", {
				listId: newListId,
				name: item.name,
				type: item.type,
				completed: item.completed,
				completedAt: item.completedAt,
				currentValue: item.currentValue,
				targetValue: item.targetValue,
				step: item.step,
				calculatorValue: item.calculatorValue,
				status: item.status,
				tagId: item.tagId ? tagIdMap.get(item.tagId) : undefined,
				description: item.description,
				url: item.url,
				notes: item.notes,
				sortOrder: item.sortOrder,
			});
		}

		return newListId;
	},
});

// ── Export Helpers ────────────────────────────────────────────────────

function formatPlainText(
	list: Doc<"lists">,
	items: Doc<"items">[],
	tagMap: Map<string, Doc<"listTags">>,
): string {
	let output = `${list.name}\n`;
	output += `${"=".repeat(list.name.length)}\n\n`;

	for (const item of items) {
		const checkbox = item.completed ? "[x]" : "[ ]";
		const tag = item.tagId ? tagMap.get(item.tagId) : undefined;
		const tagStr = tag ? ` [${tag.name}]` : "";

		output += `${checkbox} ${item.name}${tagStr}\n`;

		if (item.description) {
			output += `    ${item.description}\n`;
		}

		if (item.type === "stepper") {
			const current = item.currentValue ?? 0;
			const target = item.targetValue ?? 0;
			const step = item.step ?? 1;
			output += `    Progress: ${current}/${target} (step: ${step})\n`;
		} else if (item.type === "calculator") {
			output += `    Value: ${item.calculatorValue ?? 0}\n`;
		} else if (item.type === "kanban") {
			output += `    Status: ${item.status ?? "todo"}\n`;
		}

		if (item.url) {
			output += `    URL: ${item.url}\n`;
		}

		if (item.notes) {
			output += `    Notes: ${item.notes}\n`;
		}

		output += "\n";
	}

	return output;
}

function formatMarkdown(
	list: Doc<"lists">,
	items: Doc<"items">[],
	tagMap: Map<string, Doc<"listTags">>,
): string {
	let output = `# ${list.name}\n\n`;

	for (const item of items) {
		const checkbox = item.completed ? "[x]" : "[ ]";
		const tag = item.tagId ? tagMap.get(item.tagId) : undefined;
		const tagStr = tag ? ` \`${tag.name}\`` : "";

		output += `- ${checkbox} **${item.name}**${tagStr}\n`;

		if (item.description) {
			output += `  - ${item.description}\n`;
		}

		if (item.type === "stepper") {
			const current = item.currentValue ?? 0;
			const target = item.targetValue ?? 0;
			const step = item.step ?? 1;
			output += `  - Progress: ${current}/${target} (step: ${step})\n`;
		} else if (item.type === "calculator") {
			output += `  - Value: ${item.calculatorValue ?? 0}\n`;
		} else if (item.type === "kanban") {
			output += `  - Status: ${item.status ?? "todo"}\n`;
		}

		if (item.url) {
			output += `  - [Link](${item.url})\n`;
		}

		if (item.notes) {
			output += `  - Notes: ${item.notes}\n`;
		}

		output += "\n";
	}

	return output;
}

function formatCsv(
	items: Doc<"items">[],
	tagMap: Map<string, Doc<"listTags">>,
): string {
	// CSV header
	let output =
		"Name,Completed,Type,Tag,Description,URL,Notes,CurrentValue,TargetValue,Step,CalculatorValue,Status\n";

	for (const item of items) {
		const tag = item.tagId ? tagMap.get(item.tagId) : undefined;

		const row = [
			csvEscape(item.name),
			item.completed ? "Yes" : "No",
			item.type,
			tag ? csvEscape(tag.name) : "",
			item.description ? csvEscape(item.description) : "",
			item.url ? csvEscape(item.url) : "",
			item.notes ? csvEscape(item.notes) : "",
			item.currentValue?.toString() ?? "",
			item.targetValue?.toString() ?? "",
			item.step?.toString() ?? "",
			item.calculatorValue?.toString() ?? "",
			item.status ?? "",
		];

		output += `${row.join(",")}\n`;
	}

	return output;
}

function csvEscape(value: string): string {
	if (value.includes(",") || value.includes('"') || value.includes("\n")) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}
