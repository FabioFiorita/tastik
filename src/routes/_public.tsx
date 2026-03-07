import { createFileRoute } from "@tanstack/react-router";
import { PublicRoutePending } from "@/components/common/public-route-pending";
import { PublicLayout } from "@/components/layout/public-layout";

export const Route = createFileRoute("/_public")({
	pendingComponent: PublicRoutePending,
	component: PublicLayout,
});
