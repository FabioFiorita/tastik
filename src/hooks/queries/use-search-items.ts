import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../convex/_generated/api";

export function searchItemsQueryOptions(query = "") {
	return convexQuery(api.items.searchItems, { query: query.trim() });
}

export function useSearchItems(query: string = "") {
	const { data } = useQuery(searchItemsQueryOptions(query));
	return data;
}
