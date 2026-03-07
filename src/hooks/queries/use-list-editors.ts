import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function listEditorsQueryOptions(listId: Id<"lists">) {
	return convexQuery(api.listEditors.getListEditors, { listId });
}

export function useListEditors(listId: Id<"lists">) {
	const { data } = useQuery(listEditorsQueryOptions(listId));

	return {
		editors: data ?? [],
	};
}
