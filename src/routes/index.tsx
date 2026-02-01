import { createFileRoute } from "@tanstack/react-router";
import {
	Authenticated,
	Unauthenticated,
	useAction,
	useQuery,
} from "convex/react";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
	Subscribed,
	SubscriptionProvider,
	Unsubscribed,
} from "@/contexts/subscription";
import { useAuth } from "@/hooks/use-auth";
import { env } from "@/lib/env";
import { getErrorMessage } from "@/lib/utils";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	return (
		<>
			<Authenticated>
				<Suspense fallback={<SubscriptionLoadingView />}>
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

function SubscriptionLoadingView() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
			<Spinner className="size-8" />
		</div>
	);
}

function SubscribedView() {
	const { signOut, isLoading } = useAuth();
	const user = useQuery(api.users.getCurrentUser);
	const getManagementUrl = useAction(api.subscriptions.getManagementUrl);
	const [isLoadingPortal, setIsLoadingPortal] = useState(false);
	const [portalError, setPortalError] = useState<string | null>(null);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
			<div className="text-center">
				<h1 className="font-bold text-4xl">Welcome to Tastik</h1>
				<p className="mt-2 text-muted-foreground">
					You are successfully signed in!
				</p>
			</div>
			{user !== undefined && user !== null && (
				<div className="w-full max-w-lg space-y-2">
					<pre className="overflow-auto rounded-lg border bg-muted p-4 text-left text-sm">
						{JSON.stringify(user, null, 2)}
					</pre>
				</div>
			)}
			<div className="flex flex-col items-center gap-3">
				<div className="flex gap-3">
					<Button
						variant="outline"
						disabled={isLoadingPortal}
						onClick={async () => {
							setPortalError(null);
							setIsLoadingPortal(true);
							try {
								const url = await getManagementUrl();
								if (url) {
									window.open(url, "_blank", "noopener,noreferrer");
								} else {
									setPortalError("Billing portal is not available");
								}
							} catch (e) {
								setPortalError(
									getErrorMessage(e, "Failed to open billing portal"),
								);
							} finally {
								setIsLoadingPortal(false);
							}
						}}
					>
						{isLoadingPortal ? "Opening…" : "Billing portal"}
					</Button>
					<Button
						variant="outline"
						onClick={() => signOut()}
						disabled={isLoading}
					>
						Sign Out
					</Button>
				</div>
				{portalError && (
					<p className="text-destructive text-sm">{portalError}</p>
				)}
			</div>
		</div>
	);
}

function PaywallView() {
	const { signOut, isLoading } = useAuth();
	const user = useQuery(api.users.getCurrentUser);
	const isUserReady = user !== undefined && user !== null;
	const purchaseLink = env.VITE_REVENUECAT_PURCHASE_LINK;
	const monthlyPurchaseUrl = isUserReady
		? `${purchaseLink}/${user._id.toString()}?package_id=${env.VITE_REVENUECAT_MONTHLY_PACKAGE_ID}&email=${user.email}`
		: null;
	const yearlyPurchaseUrl = isUserReady
		? `${purchaseLink}/${user._id.toString()}?package_id=${env.VITE_REVENUECAT_YEARLY_PACKAGE_ID}&email=${user.email}`
		: null;

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
			<div className="text-center">
				<h1 className="font-bold text-4xl">Welcome to Tastik</h1>
				<p className="mt-2 text-muted-foreground">Subscribe to continue</p>
			</div>
			<div className="flex flex-col items-center gap-3">
				<div className="flex gap-3">
					{monthlyPurchaseUrl ? (
						<a
							href={monthlyPurchaseUrl}
							target="_blank"
							rel="noopener noreferrer"
						>
							<Button>Purchase Monthly</Button>
						</a>
					) : (
						<Button disabled>Can't purchase monthly</Button>
					)}
					{yearlyPurchaseUrl ? (
						<a
							href={yearlyPurchaseUrl}
							target="_blank"
							rel="noopener noreferrer"
						>
							<Button>Purchase Yearly</Button>
						</a>
					) : (
						<Button disabled>Can't purchase yearly</Button>
					)}
					<Button
						variant="outline"
						onClick={() => signOut()}
						disabled={isLoading}
					>
						Sign Out
					</Button>
				</div>
			</div>
		</div>
	);
}

function UnauthenticatedView() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
			<div className="text-center">
				<h1 className="font-bold text-4xl">Welcome to Tastik</h1>
				<p className="mt-2 text-muted-foreground">Please sign in to continue</p>
			</div>
			<a href="/sign-in">
				<Button>Sign In</Button>
			</a>
		</div>
	);
}
