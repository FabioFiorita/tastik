import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import { appError } from "./lib/errors";
import { assertListsUnderLimit, MAX_ITEMS_PER_LIST } from "./lib/limits";
import {
	getListAccessOrNull,
	requireAuth,
	requireListAccess,
	requireListOwner,
} from "./lib/permissions";
import { assertRateLimit } from "./lib/rateLimiter";
import { compareByDateNameSort } from "./lib/sorting";
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

		// Get profile to read sort preferences
		const profile = await ctx.db
			.query("profiles")
			.withIndex("by_user_id", (q) => q.eq("userId", userId))
			.unique();
		const sortBy = profile?.listsSortBy ?? "created_at";
		const sortAscending = profile?.listsSortAscending ?? false;

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
		allLists.sort((a, b) => compareByDateNameSort(a, b, sortBy, sortAscending));

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
		await assertRateLimit(ctx, "createList", userId);
		await assertListsUnderLimit(ctx, userId);

		const listType = args.type ?? "simple";

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
			showTotal: args.showTotal ?? listType === "calculator",
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
		await requireListOwner(ctx, args.listId);

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
 * Duplicate a list with all its items and tags.
 * Editors are NOT copied for privacy.
 */
export const duplicateList = mutation({
	args: {
		listId: v.id("lists"),
	},
	handler: async (ctx, args) => {
		const { userId, list } = await requireListAccess(ctx, args.listId);
		await assertRateLimit(ctx, "duplicateList", userId);
		await assertListsUnderLimit(ctx, userId);

		// Fetch source items
		const sourceItems = await ctx.db
			.query("items")
			.withIndex("by_list", (q) => q.eq("listId", args.listId))
			.collect();

		// Check item count against plan limits
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

const ONBOARDING_ITEMS: Array<{
	name: string;
	description: string;
	type: "simple" | "stepper" | "calculator" | "kanban";
	currentValue?: number;
	step?: number;
	calculatorValue?: number;
	status?: "todo" | "in_progress" | "done";
}> = [
	{
		name: "Welcome to Tastik",
		description:
			"Lists without deadlines — a quiet companion for ongoing tasks that don't need due dates.",
		type: "simple",
	},
	{
		name: "Simple lists",
		description:
			"Checkbox items. Toggle complete/incomplete. Perfect for grocery lists, packing, or quick to-dos.",
		type: "simple",
	},
	{
		name: "Stepper lists",
		description:
			"Items with quantities and +/- controls. Great for shopping with amounts or tracking inventory.",
		type: "stepper",
		currentValue: 0,
		step: 1,
	},
	{
		name: "Calculator lists",
		description:
			"Track numbers with a running total. Ideal for expenses, budgets, or splitting costs.",
		type: "calculator",
		calculatorValue: 0,
	},
	{
		name: "Kanban lists",
		description:
			"Three columns: To do, In progress, Done. Drag items as you work.",
		type: "kanban",
		status: "todo",
	},
	{
		name: "Multi lists",
		description:
			"Mix simple, stepper, calculator, and kanban items in one list. Pick the type per item.",
		type: "simple",
	},
	{
		name: "Tags",
		description:
			"Add tags to organize items. Use colors to group by priority, category, or custom labels.",
		type: "simple",
	},
	{
		name: "Sharing",
		description:
			"Share lists with others by email. They see nicknames only — privacy-first.",
		type: "simple",
	},
	{
		name: "Archive",
		description:
			"Done with a list? Archive it. Restore anytime from the Archive.",
		type: "simple",
	},
	{
		name: "Keyboard shortcuts",
		description:
			"Press C to create a list. Use shortcuts in list views for fast navigation.",
		type: "simple",
	},
];

export const createOnboardingList = internalMutation({
	args: { userId: v.string() },
	handler: async (ctx, args) => {
		const now = Date.now();
		const listId = await ctx.db.insert("lists", {
			ownerId: args.userId,
			name: "Start Here",
			icon: "Multi",
			type: "multi",
			status: "active",
			sortBy: "created_at",
			sortAscending: true,
			showCompleted: true,
			hideCheckbox: false,
			showTotal: true,
			updatedAt: now,
		});

		for (let i = 0; i < ONBOARDING_ITEMS.length; i++) {
			const item = ONBOARDING_ITEMS[i];
			const initialCompleted = item.type === "kanban" && item.status === "done";
			await ctx.db.insert("items", {
				listId,
				name: item.name,
				type: item.type,
				completed: initialCompleted,
				completedAt: initialCompleted ? now : undefined,
				currentValue: item.currentValue,
				step: item.step,
				calculatorValue: item.calculatorValue,
				status: item.status,
				description: item.description,
				sortOrder: i + 1,
				updatedAt: now,
			});
		}
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
			const step = item.step ?? 1;
			output += `    Value: ${current} (step: ${step})\n`;
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
			const step = item.step ?? 1;
			output += `  - Value: ${current} (step: ${step})\n`;
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
		"Name,Completed,Type,Tag,Description,URL,Notes,CurrentValue,Step,CalculatorValue,Status\n";

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
