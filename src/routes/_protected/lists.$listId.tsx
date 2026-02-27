import { createFileRoute, redirect } from "@tanstack/react-router";
import { ListDetailPendingSkeleton } from "@/components/common/pending-skeletons";
import { ListView } from "@/components/lists/list-view";
import { listQueryOptions } from "@/hooks/queries/use-list";
import { listCollaboratorsQueryOptions } from "@/hooks/queries/use-list-collaborators";
import { listItemsQueryOptions } from "@/hooks/queries/use-list-items";
import { listTagsQueryOptions } from "@/hooks/queries/use-list-tags";
import { parseConvexId } from "@/lib/utils/parse-convex-id";

export const Route = createFileRoute("/_protected/lists/$listId")({
	pendingComponent: ListDetailPendingSkeleton,
	loader: async ({ context, params }) => {
		const listId = parseConvexId<"lists">(params.listId);

		if (!listId) {
			throw redirect({ to: "/" });
		}

		const list = await context.queryClient.ensureQueryData(
			listQueryOptions(listId),
		);
		if (!list) {
			throw redirect({ to: "/" });
		}

		await Promise.all([
			context.queryClient.ensureQueryData(
				listItemsQueryOptions(listId, list.showCompleted),
			),
			context.queryClient.prefetchQuery(listTagsQueryOptions(listId)),
			context.queryClient.prefetchQuery(listCollaboratorsQueryOptions(listId)),
		]);

		return { listId };
	},
	component: ListPage,
});

function ListPage() {
	const { listId } = Route.useLoaderData();
	return <ListView listId={listId} />;
}
