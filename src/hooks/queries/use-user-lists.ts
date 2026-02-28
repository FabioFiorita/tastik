import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useIsAuthenticated } from "@/hooks/use-is-authenticated";
import type { ListStatus } from "@/lib/types/list-status";
import { api } from "../../../convex/_generated/api";

export function userListsQueryOptions(
	status: ListStatus = "active",
	isAuthenticated: boolean = true,
) {
	return convexQuery(
		api.lists.getUserLists,
		isAuthenticated ? { status } : "skip",
	);
}

export function useUserLists(status: ListStatus = "active") {
	const isAuthenticated = useIsAuthenticated();
	const { data } = useQuery(userListsQueryOptions(status, isAuthenticated));
	return data;
}
