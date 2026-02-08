import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useIsAuthenticated } from "@/hooks/use-is-authenticated";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function listCollaboratorsQueryOptions(
	listId: Id<"lists">,
	isAuthenticated: boolean = true,
) {
	return convexQuery(
		api.listEditors.getListCollaborators,
		isAuthenticated ? { listId } : "skip",
	);
}

export function useListCollaborators(listId: Id<"lists">) {
	const isAuthenticated = useIsAuthenticated();
	const { data } = useQuery(
		listCollaboratorsQueryOptions(listId, isAuthenticated),
	);

	return {
		collaborators: data,
		isShared: (data?.length ?? 0) > 0,
	};
}
