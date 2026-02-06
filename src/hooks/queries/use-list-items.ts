import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function useListItems(listId: Id<"lists">, includeCompleted: boolean) {
	const data = useQuery(api.items.getListItems, { listId, includeCompleted });
	return data;
}
