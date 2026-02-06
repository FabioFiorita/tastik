import { createFileRoute } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Suspense } from "react";
import { LoadingState } from "@/components/common/loading-state";
import { ProtectedLayout } from "@/components/dashboard/protected-layout";
import { LandingPage } from "@/components/landing/landing-page";
import { PublicLayout } from "@/components/layout/public-layout";
import { ListsView } from "@/components/lists/lists-view";
import { SubscriptionPage } from "@/components/subscription/subscription-page";
import {
	Subscribed,
	SubscriptionProvider,
	Unsubscribed,
} from "@/contexts/subscription";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	return (
		<>
			<AuthLoading>
				<LoadingState />
			</AuthLoading>
			<Authenticated>
				<Suspense fallback={<LoadingState />}>
					<SubscriptionProvider>
						<Subscribed>
							<SubscribedView />
						</Subscribed>
						<Unsubscribed>
							<PaywallView />
						</Unsubscribed>
					</SubscriptionProvider>
				</Suspense>
			</Authenticated>
			<Unauthenticated>
				<UnauthenticatedView />
			</Unauthenticated>
		</>
	);
}

function SubscribedView() {
	return (
		<ProtectedLayout>
			<Suspense fallback={<LoadingState />}>
				<ListsView />
			</Suspense>
		</ProtectedLayout>
	);
}

function PaywallView() {
	return (
		<PublicLayout>
			<SubscriptionPage />
		</PublicLayout>
	);
}

function UnauthenticatedView() {
	return (
		<PublicLayout>
			<LandingPage />
		</PublicLayout>
	);
}
