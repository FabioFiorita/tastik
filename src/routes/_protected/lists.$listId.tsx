import { createFileRoute, redirect } from "@tanstack/react-router";
import { ListView } from "@/components/lists/list-view";
import { listQueryOptions } from "@/hooks/queries/use-list";
import { listItemsQueryOptions } from "@/hooks/queries/use-list-items";
import { parseConvexId } from "@/lib/utils/parse-convex-id";

export const Route = createFileRoute("/_protected/lists/$listId")({
	loader: async ({ context, params }) => {
		const listId = parseConvexId<"lists">(params.listId);

		if (!listId) {
			throw redirect({ to: "/" });
		}

		const list = await context.queryClient.ensureQueryData(
			listQueryOptions(listId),
		);

		await context.queryClient.ensureQueryData(
			listItemsQueryOptions(listId, list?.showCompleted ?? false),
		);

		return { listId };
	},
	component: ListPage,
});

function ListPage() {
	const { listId } = Route.useLoaderData();
	return <ListView listId={listId} />;
}
