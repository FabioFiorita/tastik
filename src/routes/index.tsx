import { createFileRoute } from "@tanstack/react-router";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const { signOut, isLoading } = useAuth();
	const user = useQuery(api.users.getCurrentUser);

	return (
		<>
			<Authenticated>
				<div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
					<div className="text-center">
						<h1 className="font-bold text-4xl">Welcome to Tastik</h1>
						<p className="mt-2 text-muted-foreground">
							You are successfully signed in!
						</p>
					</div>
					{user !== undefined && user !== null && (
						<pre className="w-full max-w-lg overflow-auto rounded-lg border bg-muted p-4 text-left text-sm">
							{JSON.stringify(user, null, 2)}
						</pre>
					)}
					<Button
						variant="outline"
						onClick={() => signOut()}
						disabled={isLoading}
					>
						Sign Out
					</Button>
				</div>
			</Authenticated>
			<Unauthenticated>
				<div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
					<div className="text-center">
						<h1 className="font-bold text-4xl">Welcome to Tastik</h1>
						<p className="mt-2 text-muted-foreground">
							Please sign in to continue
						</p>
					</div>
					<a href="/sign-in">
						<Button>Sign In</Button>
					</a>
				</div>
			</Unauthenticated>
		</>
	);
}
