import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "../../../convex/_generated/api";

export function userListsQueryOptions(
	status: "active" | "archived" = "active",
) {
	return convexQuery(api.lists.getUserLists, { status });
}

export function useUserLists(status: "active" | "archived" = "active") {
	const { data } = useSuspenseQuery(userListsQueryOptions(status));
	return data;
}
