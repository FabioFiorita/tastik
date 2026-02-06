import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function useList(listId: Id<"lists"> | undefined) {
	const data = useQuery(api.lists.getList, listId ? { listId } : "skip");
	return data;
}
