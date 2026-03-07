import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function listCollaboratorsQueryOptions(listId: Id<"lists">) {
	return convexQuery(api.listEditors.getListCollaborators, { listId });
}

export function useListCollaborators(listId: Id<"lists">) {
	const { data } = useQuery(listCollaboratorsQueryOptions(listId));

	return {
		collaborators: data,
		isShared: (data?.length ?? 0) > 0,
	};
}
