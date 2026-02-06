import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "../../../convex/_generated/api";

export type SubscriptionQueryData = {
	isSubscribed: boolean;
	status: "inactive" | "trialing" | "active" | "past_due" | "canceled";
	planSlug?: string;
	currentPeriodEnd?: number;
	canceledAt?: number;
};

export function subscriptionQueryOptions() {
	return convexQuery(api.subscriptions.getSubscription, {});
}

export function useSubscriptionQuery() {
	const { data } = useSuspenseQuery(subscriptionQueryOptions());
	return data;
}
