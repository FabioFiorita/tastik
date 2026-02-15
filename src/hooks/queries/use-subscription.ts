import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "../../../convex/_generated/api";

export type SubscriptionQueryData = {
	isSubscribed: boolean;
	isTrialing: boolean;
	currentPeriodEnd?: number;
};

export function subscriptionQueryOptions() {
	return convexQuery(api.subscriptions.getSubscription, {});
}

export function useSubscriptionQuery() {
	const { data } = useSuspenseQuery(subscriptionQueryOptions());
	return data;
}
