import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useIsAuthenticated } from "@/hooks/use-is-authenticated";
import { api } from "../../../convex/_generated/api";

export function searchItemsQueryOptions(
	query: string = "",
	isAuthenticated: boolean = true,
) {
	const trimmedQuery = query.trim();
	return convexQuery(
		api.items.searchItems,
		isAuthenticated && trimmedQuery.length > 0
			? { query: trimmedQuery }
			: "skip",
	);
}

export function useSearchItems(query: string = "") {
	const isAuthenticated = useIsAuthenticated();
	const { data } = useQuery(searchItemsQueryOptions(query, isAuthenticated));
	return data;
}
