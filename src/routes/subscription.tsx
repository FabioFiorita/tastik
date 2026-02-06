import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/public-layout";
import { SubscriptionPage } from "@/components/subscription/subscription-page";
import { currentUserQueryOptions } from "@/hooks/queries/use-current-user";
import {
	subscriptionQueryOptions,
	useSubscriptionQuery,
} from "@/hooks/queries/use-subscription";

export const Route = createFileRoute("/subscription")({
	beforeLoad: ({ context }) => {
		if (!context.userId) {
			throw redirect({ to: "/sign-in" });
		}
	},
	loader: async ({ context }) => {
		const [, subscription] = await Promise.all([
			context.queryClient.ensureQueryData(currentUserQueryOptions()),
			context.queryClient.ensureQueryData(subscriptionQueryOptions()),
		]);

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

	return (
		<PublicLayout>
			<SubscriptionPage />
		</PublicLayout>
	);
}
