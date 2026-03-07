import type { QueryClient } from "@tanstack/react-query";
import { useParams, useRouteContext } from "@tanstack/react-router";
import { KanbanDetailPendingSkeleton } from "@/components/common/kanban-detail-pending-skeleton";
import { ListDetailFallbackPending } from "@/components/common/list-detail-fallback-pending";
import { ListDetailPendingSkeleton } from "@/components/common/list-detail-pending-skeleton";
import { listQueryOptions } from "@/hooks/queries/use-list";
import { userListsQueryOptions } from "@/hooks/queries/use-user-lists";
import { parseConvexId } from "@/lib/utils/parse-convex-id";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

type CachedList = {
	_id: Id<"lists">;
	type: Doc<"lists">["type"];
};

function getCachedListType(
	queryClient: QueryClient,
	listId: Id<"lists">,
): Doc<"lists">["type"] | null {
	const cachedList = queryClient.getQueryData<
		(CachedList & { isOwner?: boolean }) | null
	>(listQueryOptions(listId).queryKey);
	if (cachedList?.type) {
		return cachedList.type;
	}

	const cachedLists = queryClient.getQueryData<CachedList[]>(
		userListsQueryOptions("active").queryKey,
	);
	return cachedLists?.find((list) => list._id === listId)?.type ?? null;
}

export function ListRoutePendingState() {
	const { queryClient } = useRouteContext({ from: "__root__" });
	const params = useParams({ strict: false }) as { listId?: string };
	const listId = parseConvexId<"lists">(params.listId);

	if (!listId) {
		return <ListDetailFallbackPending />;
	}

	const listType = getCachedListType(queryClient, listId);

	if (listType === "kanban") {
		return <KanbanDetailPendingSkeleton />;
	}

	if (listType) {
		return <ListDetailPendingSkeleton />;
	}

	return <ListDetailFallbackPending />;
}
