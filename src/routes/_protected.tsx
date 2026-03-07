import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardPendingSkeleton } from "@/components/common/dashboard-pending-skeleton";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { userListsQueryOptions } from "@/hooks/queries/use-user-lists";
import { userPreferencesQueryOptions } from "@/hooks/queries/use-user-preferences";
import { applyProtectedAuth } from "@/lib/auth-routing";

export const Route = createFileRoute("/_protected")({
	pendingComponent: DashboardPendingSkeleton,
	beforeLoad: async ({ context }) => {
		const { isAuthenticated } = await applyProtectedAuth(context);

		if (!isAuthenticated) {
			throw redirect({ to: "/sign-in" });
		}
	},
	loader: ({ context }) => {
		context.queryClient.prefetchQuery(userListsQueryOptions("active"));
		context.queryClient.prefetchQuery(userPreferencesQueryOptions());
	},
	component: ProtectedLayout,
});
