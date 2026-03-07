import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import {
	AUTH_STATE_QUERY_KEY,
	authStateQueryOptions,
} from "@/hooks/queries/use-auth-state";
import { authClient } from "@/lib/auth-client";

export function useAuthTransitionCoordinator() {
	const queryClient = useQueryClient();
	const router = useRouter();

	const syncAfterSignIn = useCallback(async () => {
		await authClient.getSession({
			query: {
				disableCookieCache: true,
			},
		});
		await queryClient.invalidateQueries({
			queryKey: AUTH_STATE_QUERY_KEY,
			refetchType: "none",
		});
		await queryClient.fetchQuery(authStateQueryOptions());
		await router.invalidate();
	}, [queryClient, router]);

	const syncAfterSignOut = useCallback(async () => {
		await queryClient.invalidateQueries({
			queryKey: AUTH_STATE_QUERY_KEY,
			refetchType: "none",
		});
		await queryClient.fetchQuery(authStateQueryOptions());
		await router.invalidate();
	}, [queryClient, router]);

	return {
		syncAfterSignIn,
		syncAfterSignOut,
	};
}
