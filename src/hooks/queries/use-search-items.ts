import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function useSearchItems(query: string = "") {
	const data = useQuery(api.items.searchItems, { query: query.trim() });
	return data;
}
