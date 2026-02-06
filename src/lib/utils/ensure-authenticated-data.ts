import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { currentUserQueryOptions } from "@/hooks/queries/use-current-user";
import { subscriptionQueryOptions } from "@/hooks/queries/use-subscription";
import { userListsQueryOptions } from "@/hooks/queries/use-user-lists";

export async function ensureAuthenticatedData(queryClient: QueryClient) {
	const [, subscription] = await Promise.all([
		queryClient.ensureQueryData(currentUserQueryOptions()),
		queryClient.ensureQueryData(subscriptionQueryOptions()),
		queryClient.ensureQueryData(userListsQueryOptions("active")),
	]);

	if (!subscription.isSubscribed) {
		throw redirect({ to: "/subscription" });
	}

	return { subscription };
}
