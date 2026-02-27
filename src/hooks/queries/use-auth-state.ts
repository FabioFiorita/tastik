import { queryOptions } from "@tanstack/react-query";
import { fetchAuthState } from "@/lib/auth-state";

export function authStateQueryOptions() {
	return queryOptions({
		queryKey: ["authState"],
		queryFn: () => fetchAuthState(),
		staleTime: 60_000,
	});
}
