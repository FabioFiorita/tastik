import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import type { ListStatus } from "@/lib/types/list-status";
import { api } from "../../../convex/_generated/api";

export function userListsQueryOptions(status: ListStatus = "active") {
	return convexQuery(api.lists.getUserLists, { status });
}

export function useUserLists(status: ListStatus = "active") {
	const { data } = useQuery(userListsQueryOptions(status));
	return data;
}
