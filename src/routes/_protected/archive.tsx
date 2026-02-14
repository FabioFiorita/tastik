import { createFileRoute } from "@tanstack/react-router";
import { ArchiveView } from "@/components/lists/archive-view";

export const Route = createFileRoute("/_protected/archive")({
	component: ArchiveRoute,
});

function ArchiveRoute() {
	return <ArchiveView />;
}
