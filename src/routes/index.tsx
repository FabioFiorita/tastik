import { createFileRoute } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Suspense } from "react";
import { LoadingState } from "@/components/common/loading-state";
import { LandingPage } from "@/components/landing/landing-page";
import { PublicLayout } from "@/components/layout/public-layout";
import { SubscriptionPage } from "@/components/subscription/subscription-page";
import { Button } from "@/components/ui/button";
import {
	Subscribed,
	SubscriptionProvider,
	Unsubscribed,
} from "@/contexts/subscription";
import { useAuth } from "@/hooks/use-auth";

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
	const { signOut } = useAuth();

	return (
		<div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
			<div className="container text-center">
				<h1 className="font-bold text-4xl tracking-tight md:text-5xl">
					Lists Coming Next Week
				</h1>
				<p className="mt-4 text-lg text-muted-foreground">
					Your subscribed view is being built!
				</p>
				<Button
					variant="secondary"
					size="sm"
					onClick={() => signOut()}
					data-testid="auth-button-sign-out"
					className="mt-6"
				>
					Sign out
				</Button>
			</div>
		</div>
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
