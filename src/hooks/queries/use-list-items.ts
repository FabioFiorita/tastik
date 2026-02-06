import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function listItemsQueryOptions(
	listId: Id<"lists">,
	includeCompleted: boolean,
) {
	return convexQuery(api.items.getListItems, { listId, includeCompleted });
}

export function useListItems(listId: Id<"lists">, includeCompleted: boolean) {
	const { data } = useQuery(listItemsQueryOptions(listId, includeCompleted));
	return data;
}
