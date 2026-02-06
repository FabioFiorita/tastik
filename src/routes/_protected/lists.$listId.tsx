import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Suspense, useEffect } from "react";
import { LoadingState } from "@/components/common/loading-state";
import { ListView } from "@/components/lists/list-view";
import { parseConvexId } from "@/lib/utils/parse-convex-id";

export const Route = createFileRoute("/_protected/lists/$listId")({
	component: ListPage,
});

function ListPage() {
	const navigate = useNavigate();
	const { listId: rawListId } = Route.useParams();

	const listId = parseConvexId<"lists">(rawListId);

	useEffect(() => {
		if (!listId) {
			navigate({ to: "/" });
		}
	}, [listId, navigate]);

	if (!listId) {
		return null;
	}

	return (
		<Suspense fallback={<LoadingState />}>
			<ListView listId={listId} />
		</Suspense>
	);
}
