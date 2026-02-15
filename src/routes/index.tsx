import { createFileRoute, redirect } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/landing-page";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { PublicLayout } from "@/components/layout/public-layout";
import { ListsView } from "@/components/lists/lists-view";
import { subscriptionQueryOptions } from "@/hooks/queries/use-subscription";

export const Route = createFileRoute("/")({
	beforeLoad: async ({ context }) => {
		if (!context.isAuthenticated) {
			return;
		}

		const subscription = await context.queryClient.ensureQueryData(
			subscriptionQueryOptions(),
		);

		if (!subscription.isSubscribed) {
			throw redirect({ to: "/subscription" });
		}
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
