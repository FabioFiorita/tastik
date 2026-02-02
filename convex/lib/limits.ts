import { ConvexError } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { appError } from "./errors";

export const MAX_LISTS_PER_USER = 50;
export const MAX_ITEMS_PER_LIST = 500;
export const MAX_TAGS_PER_LIST = 50;
export const MAX_EDITORS_PER_LIST = 10;

export async function assertListsUnderLimit(
	ctx: MutationCtx,
	userId: Id<"users">,
): Promise<void> {
	const lists = await ctx.db
		.query("lists")
		.withIndex("by_owner", (q) => q.eq("ownerId", userId))
		.collect();
	if (lists.length >= MAX_LISTS_PER_USER) {
		throw new ConvexError(
			appError(
				"LISTS_LIMIT_EXCEEDED",
				`You've reached the maximum number of lists (${MAX_LISTS_PER_USER}).`,
			),
		);
	}
}

export async function assertItemsUnderLimit(
	ctx: MutationCtx,
	listId: Id<"lists">,
): Promise<void> {
	const items = await ctx.db
		.query("items")
		.withIndex("by_list", (q) => q.eq("listId", listId))
		.collect();
	if (items.length >= MAX_ITEMS_PER_LIST) {
		throw new ConvexError(
			appError(
				"ITEMS_LIMIT_EXCEEDED",
				`This list has reached the maximum number of items (${MAX_ITEMS_PER_LIST}).`,
			),
		);
	}
}

export async function assertTagsUnderLimit(
	ctx: MutationCtx,
	listId: Id<"lists">,
): Promise<void> {
	const tags = await ctx.db
		.query("listTags")
		.withIndex("by_list", (q) => q.eq("listId", listId))
		.collect();
	if (tags.length >= MAX_TAGS_PER_LIST) {
		throw new ConvexError(
			appError(
				"TAGS_LIMIT_EXCEEDED",
				`This list has reached the maximum number of tags (${MAX_TAGS_PER_LIST}).`,
			),
		);
	}
}

export async function assertEditorsUnderLimit(
	ctx: MutationCtx,
	listId: Id<"lists">,
): Promise<void> {
	const editors = await ctx.db
		.query("listEditors")
		.withIndex("by_list", (q) => q.eq("listId", listId))
		.collect();
	if (editors.length >= MAX_EDITORS_PER_LIST) {
		throw new ConvexError(
			appError(
				"EDITORS_LIMIT_EXCEEDED",
				`This list has reached the maximum number of editors (${MAX_EDITORS_PER_LIST}).`,
			),
		);
	}
}
