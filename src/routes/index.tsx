import { createFileRoute } from "@tanstack/react-router";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { env } from "@/lib/env";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	return (
		<>
			<Authenticated>
				<AuthenticatedView />
			</Authenticated>
			<Unauthenticated>
				<UnauthenticatedView />
			</Unauthenticated>
		</>
	);
}

function AuthenticatedView() {
	const { signOut, isLoading } = useAuth();
	const user = useQuery(api.users.getCurrentUser);
	const isSubscribed = useQuery(api.subscriptions.isSubscribed);
	const isUserReady = user !== undefined && user !== null;
	const purchaseUrl = isUserReady
		? `${env.VITE_REVENUECAT_PURCHASE_LINK}/${user._id.toString()}`
		: null;

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
					{isSubscribed !== undefined && (
						<p className="text-muted-foreground text-sm">
							Subscribed: {isSubscribed ? "Yes" : "No"}
						</p>
					)}
					<pre className="overflow-auto rounded-lg border bg-muted p-4 text-left text-sm">
						{JSON.stringify(user, null, 2)}
					</pre>
				</div>
			)}
			<div className="flex gap-3">
				{purchaseUrl ? (
					<a href={purchaseUrl} target="_blank" rel="noopener noreferrer">
						<Button>Purchase</Button>
					</a>
				) : (
					<Button disabled>Purchase</Button>
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
