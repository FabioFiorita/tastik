import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";
import { SubscriptionPage } from "@/components/subscription/subscription-page";
import {
	subscriptionQueryOptions,
	useSubscriptionQuery,
} from "@/hooks/queries/use-subscription";

export const Route = createFileRoute("/_protected/subscription")({
	loader: async ({ context }) => {
		const subscription = await context.queryClient.ensureQueryData(
			subscriptionQueryOptions(),
		);

		// Already subscribed users don't need this page
		if (subscription.isSubscribed) {
			throw redirect({ to: "/" });
		}
	},
	component: SubscriptionRoute,
});

function SubscriptionRoute() {
	const subscription = useSubscriptionQuery();

	if (subscription.isSubscribed) {
		return <Navigate to="/" replace />;
	}

	return <SubscriptionPage />;
}
