import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardPendingSkeleton } from "@/components/common/dashboard-pending-skeleton";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { userListsQueryOptions } from "@/hooks/queries/use-user-lists";
import { userPreferencesQueryOptions } from "@/hooks/queries/use-user-preferences";

export const Route = createFileRoute("/_protected")({
	pendingComponent: DashboardPendingSkeleton,
	beforeLoad: async ({ context }) => {
		if (!context.isAuthenticated) {
			throw redirect({ to: "/sign-in" });
		}
	},
	loader: async ({ context }) => {
		await Promise.all([
			context.queryClient.prefetchQuery(
				userListsQueryOptions("active", context.isAuthenticated),
			),
			context.queryClient.prefetchQuery(
				userPreferencesQueryOptions(context.isAuthenticated),
			),
		]);
	},
	component: ProtectedLayout,
});
