import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useIsAuthenticated } from "@/hooks/use-is-authenticated";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function listEditorsQueryOptions(
	listId: Id<"lists">,
	isAuthenticated: boolean = true,
) {
	return convexQuery(
		api.listEditors.getListEditors,
		isAuthenticated ? { listId } : "skip",
	);
}

export function useListEditors(listId: Id<"lists">) {
	const isAuthenticated = useIsAuthenticated();
	const { data } = useQuery(listEditorsQueryOptions(listId, isAuthenticated));

	return {
		editors: data ?? [],
	};
}
