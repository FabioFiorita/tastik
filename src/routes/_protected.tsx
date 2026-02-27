import { createFileRoute, redirect } from "@tanstack/react-router";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { userListsQueryOptions } from "@/hooks/queries/use-user-lists";
import { userPreferencesQueryOptions } from "@/hooks/queries/use-user-preferences";

export const Route = createFileRoute("/_protected")({
	beforeLoad: async ({ context }) => {
		if (!context.isAuthenticated) {
			throw redirect({ to: "/sign-in" });
		}
	},
	loader: async ({ context }) => {
		await Promise.all([
			context.queryClient.prefetchQuery(userListsQueryOptions("active")),
			context.queryClient.prefetchQuery(userPreferencesQueryOptions()),
		]);
	},
	component: ProtectedLayout,
});
