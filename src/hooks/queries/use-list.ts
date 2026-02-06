import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function listQueryOptions(listId: Id<"lists"> | undefined) {
	return convexQuery(api.lists.getList, listId ? { listId } : "skip");
}

export function useList(listId: Id<"lists"> | undefined) {
	const { data } = useQuery(listQueryOptions(listId));
	return data;
}
