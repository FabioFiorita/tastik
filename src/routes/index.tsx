import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/landing-page";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { PublicLayout } from "@/components/layout/public-layout";
import { ListsView } from "@/components/lists/lists-view";
import { userListsQueryOptions } from "@/hooks/queries/use-user-lists";
import { userPreferencesQueryOptions } from "@/hooks/queries/use-user-preferences";

export const Route = createFileRoute("/")({
	loader: async ({ context }) => {
		if (!context.isAuthenticated) return;
		await Promise.all([
			context.queryClient.prefetchQuery(userListsQueryOptions("active")),
			context.queryClient.prefetchQuery(userPreferencesQueryOptions()),
		]);
	},
	component: IndexPage,
});

function IndexPage() {
	const { isAuthenticated } = Route.useRouteContext();

	if (isAuthenticated) {
		return (
			<ProtectedLayout>
				<ListsView />
			</ProtectedLayout>
		);
	}

	return (
		<PublicLayout>
			<LandingPage />
		</PublicLayout>
	);
}
