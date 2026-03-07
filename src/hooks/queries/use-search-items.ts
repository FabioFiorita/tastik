import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../convex/_generated/api";

export function searchItemsQueryOptions(query: string = "") {
	const trimmedQuery = query.trim();
	return convexQuery(
		api.items.searchItems,
		trimmedQuery.length > 0 ? { query: trimmedQuery } : "skip",
	);
}

export function useSearchItems(query: string = "") {
	const { data } = useQuery(searchItemsQueryOptions(query));
	return data;
}
