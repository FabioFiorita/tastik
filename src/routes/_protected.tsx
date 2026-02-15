import { createFileRoute, redirect } from "@tanstack/react-router";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { subscriptionQueryOptions } from "@/hooks/queries/use-subscription";

export const Route = createFileRoute("/_protected")({
	beforeLoad: async ({ context, location }) => {
		if (!context.userId) {
			throw redirect({ to: "/sign-in" });
		}

		// Allow access to the subscription page without a subscription
		if (location.pathname === "/subscription") {
			return;
		}

		// Hard paywall: redirect unsubscribed users to /subscription
		const subscription = await context.queryClient.ensureQueryData(
			subscriptionQueryOptions(),
		);

		if (!subscription.isSubscribed) {
			throw redirect({ to: "/subscription" });
		}
	},
	component: ProtectedLayout,
});
