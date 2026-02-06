import { createFileRoute } from "@tanstack/react-router";
import { ProtectedLayout } from "@/components/dashboard/protected-layout";
import { LandingPage } from "@/components/landing/landing-page";
import { PublicLayout } from "@/components/layout/public-layout";
import { ListsView } from "@/components/lists/lists-view";
import { ensureAuthenticatedData } from "@/lib/utils/ensure-authenticated-data";

export const Route = createFileRoute("/")({
	loader: async ({ context }) => {
		if (!context.userId) {
			return;
		}

		await ensureAuthenticatedData(context.queryClient);
	},
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
