import { createFileRoute } from "@tanstack/react-router";
import { ProtectedLayout } from "@/components/dashboard/protected-layout";

export const Route = createFileRoute("/_protected")({
	component: ProtectedLayout,
});
