import { createFileRoute, isRedirect, redirect } from "@tanstack/react-router";
import { ListRoutePendingState } from "@/components/common/list-route-pending-state";
import { ListView } from "@/components/lists/list-view";
import { listQueryOptions } from "@/hooks/queries/use-list";
import { listCollaboratorsQueryOptions } from "@/hooks/queries/use-list-collaborators";
import { listItemsQueryOptions } from "@/hooks/queries/use-list-items";
import { listTagsQueryOptions } from "@/hooks/queries/use-list-tags";
import { parseConvexId } from "@/lib/utils/parse-convex-id";

export const Route = createFileRoute("/_protected/lists/$listId")({
	pendingComponent: ListRoutePendingState,
	loader: async ({ context, params }) => {
		const listId = parseConvexId<"lists">(params.listId);

		if (!listId) {
			throw redirect({ to: "/" });
		}

		try {
			const list = await context.queryClient.ensureQueryData(
				listQueryOptions(listId),
			);
			if (!list) {
				throw redirect({ to: "/" });
			}

			// Fire-and-forget — WebSocket delivers data reactively
			context.queryClient.prefetchQuery(
				listItemsQueryOptions(listId, list.showCompleted),
			);
			context.queryClient.prefetchQuery(listTagsQueryOptions(listId));
			context.queryClient.prefetchQuery(listCollaboratorsQueryOptions(listId));
		} catch (error) {
			if (isRedirect(error)) throw error;
			// Auth not ready on client initial load — WebSocket will retry
		}

		return { listId };
	},
	component: ListPage,
});

function ListPage() {
	const { listId } = Route.useLoaderData();
	return <ListView listId={listId} />;
}
