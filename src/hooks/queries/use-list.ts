import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useIsAuthenticated } from "@/hooks/use-is-authenticated";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function listQueryOptions(
	listId: Id<"lists"> | undefined,
	isAuthenticated: boolean = true,
) {
	return convexQuery(
		api.lists.getList,
		listId && isAuthenticated ? { listId } : "skip",
	);
}

export function useList(listId: Id<"lists"> | undefined) {
	const isAuthenticated = useIsAuthenticated();
	const { data } = useQuery(listQueryOptions(listId, isAuthenticated));
	return data;
}
