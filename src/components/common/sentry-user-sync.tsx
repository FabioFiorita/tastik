import { useAuth, useUser } from "@clerk/tanstack-react-start";
import * as Sentry from "@sentry/tanstackstart-react";
import { useEffect } from "react";

export function SentryUserSync({ children }: { children: React.ReactNode }) {
	const { isSignedIn } = useAuth();
	const { user } = useUser();

	useEffect(() => {
		if (!isSignedIn || !user) {
			Sentry.setUser(null);
			return;
		}
		Sentry.setUser({
			id: user.id,
			email: user.primaryEmailAddress?.emailAddress ?? undefined,
			username: user.username ?? undefined,
		});
	}, [isSignedIn, user]);

	return <>{children}</>;
}
