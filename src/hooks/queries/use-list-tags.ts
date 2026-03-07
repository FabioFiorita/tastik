import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function listTagsQueryOptions(listId: Id<"lists"> | undefined) {
	return convexQuery(api.tags.getListTags, listId ? { listId } : "skip");
}

export function useListTags(listId: Id<"lists"> | undefined) {
	const { data } = useQuery(listTagsQueryOptions(listId));
	return data ?? [];
}
