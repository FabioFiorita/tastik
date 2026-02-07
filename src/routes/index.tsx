import { createFileRoute } from "@tanstack/react-router";
import { ProtectedLayout } from "@/components/dashboard/protected-layout";
import { LandingPage } from "@/components/landing/landing-page";
import { PublicLayout } from "@/components/layout/public-layout";
import { ListsView } from "@/components/lists/lists-view";

export const Route = createFileRoute("/")({
	component: IndexPage,
});

function IndexPage() {
	const { userId } = Route.useRouteContext();

	if (userId) {
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
