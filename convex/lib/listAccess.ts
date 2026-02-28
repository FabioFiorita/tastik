import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

export async function getAccessibleLists(
	ctx: QueryCtx,
	userId: string,
): Promise<{
	ownedLists: Doc<"lists">[];
	sharedLists: Doc<"lists">[];
	accessibleListsMap: Map<Id<"lists">, Doc<"lists">>;
}> {
	const ownedLists = await ctx.db
		.query("lists")
		.withIndex("by_owner", (q) => q.eq("ownerId", userId))
		.collect();

	const editorEntries = await ctx.db
		.query("listEditors")
		.withIndex("by_user", (q) => q.eq("userId", userId))
		.collect();

	const sharedListIds = editorEntries.map((entry) => entry.listId);
	const sharedLists = (
		await Promise.all(sharedListIds.map((id) => ctx.db.get("lists", id)))
	).filter((list): list is Doc<"lists"> => list !== null);

	const accessibleListsMap = new Map<Id<"lists">, Doc<"lists">>();
	for (const list of ownedLists) {
		accessibleListsMap.set(list._id, list);
	}
	for (const list of sharedLists) {
		accessibleListsMap.set(list._id, list);
	}

	return {
		ownedLists,
		sharedLists,
		accessibleListsMap,
	};
}
