import * as Sentry from "@sentry/tanstackstart-react";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export function SentryUserSync({ children }: { children: React.ReactNode }) {
	const { data: session } = authClient.useSession();
	const user = session?.user;

	useEffect(() => {
		if (!user) {
			Sentry.setUser(null);
			return;
		}
		Sentry.setUser({
			id: user.id,
			email: user.email ?? undefined,
			username: user.name ?? undefined,
		});
	}, [user]);

	return <>{children}</>;
}
