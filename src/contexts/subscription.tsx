import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext, useMemo } from "react";
import { api } from "../../convex/_generated/api";

type SubscriptionContextValue = {
	isSubscribed: boolean;
	status: "inactive" | "trialing" | "active" | "past_due" | "canceled";
	externalCustomerId?: string;
	currentPeriodEnd?: number;
	canceledAt?: number;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(
	null,
);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
	const { data: subscription } = useSuspenseQuery(
		convexQuery(api.subscriptions.getSubscription, {}),
	);
	const value = useMemo<SubscriptionContextValue>(
		() => subscription,
		[subscription],
	);
	return (
		<SubscriptionContext.Provider value={value}>
			{children}
		</SubscriptionContext.Provider>
	);
}

export function useSubscription(): SubscriptionContextValue {
	const ctx = useContext(SubscriptionContext);
	if (ctx === null) {
		throw new Error(
			"useSubscription must be used within a SubscriptionProvider",
		);
	}
	return ctx;
}

export function Subscribed({ children }: { children: ReactNode }) {
	const { isSubscribed } = useSubscription();
	if (isSubscribed !== true) {
		return null;
	}
	return <>{children}</>;
}

export function Unsubscribed({ children }: { children: ReactNode }) {
	const { isSubscribed } = useSubscription();
	if (isSubscribed === true) {
		return null;
	}
	return <>{children}</>;
}
