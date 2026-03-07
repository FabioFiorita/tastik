import { queryOptions } from "@tanstack/react-query";
import { fetchAuthState } from "@/lib/auth-state";

export const AUTH_STATE_QUERY_KEY = ["authState"] as const;

export function authStateQueryOptions() {
	return queryOptions({
		queryKey: AUTH_STATE_QUERY_KEY,
		queryFn: () => fetchAuthState(),
		staleTime: Number.POSITIVE_INFINITY,
	});
}
