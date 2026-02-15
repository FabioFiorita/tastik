import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/landing-page";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { PublicLayout } from "@/components/layout/public-layout";
import { ListsView } from "@/components/lists/lists-view";

export const Route = createFileRoute("/")({
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
