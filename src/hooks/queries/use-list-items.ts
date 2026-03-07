import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function listItemsQueryOptions(
	listId: Id<"lists">,
	includeCompleted: boolean,
	tagId?: Id<"listTags">,
) {
	return convexQuery(api.items.getListItems, {
		listId,
		includeCompleted,
		tagId,
	});
}

type UseListItemsOptions = {
	enabled?: boolean;
};

export function useListItems(
	listId: Id<"lists">,
	includeCompleted: boolean,
	tagId?: Id<"listTags">,
	options?: UseListItemsOptions,
) {
	const { data } = useQuery({
		...listItemsQueryOptions(listId, includeCompleted, tagId),
		enabled: options?.enabled !== false,
	});
	return data;
}
