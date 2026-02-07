import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useIsAuthenticated } from "@/hooks/use-is-authenticated";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function listItemsQueryOptions(
	listId: Id<"lists">,
	includeCompleted: boolean,
	isAuthenticated: boolean = true,
) {
	return convexQuery(
		api.items.getListItems,
		isAuthenticated ? { listId, includeCompleted } : "skip",
	);
}

export function useListItems(listId: Id<"lists">, includeCompleted: boolean) {
	const isAuthenticated = useIsAuthenticated();
	const { data } = useQuery(
		listItemsQueryOptions(listId, includeCompleted, isAuthenticated),
	);
	return data;
}
