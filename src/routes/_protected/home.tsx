import { createFileRoute } from "@tanstack/react-router";
import { ListsView } from "@/components/lists/lists-view";

export const Route = createFileRoute("/_protected/home")({
	component: HomeRoute,
});

function HomeRoute() {
	return <ListsView />;
}
