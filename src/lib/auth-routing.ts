import type { ConvexQueryClient } from "@convex-dev/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { authStateQueryOptions } from "@/hooks/queries/use-auth-state";

type AuthQueryContext = {
	queryClient: QueryClient;
};

type ProtectedAuthContext = AuthQueryContext & {
	convexQueryClient: ConvexQueryClient;
};

export async function loadAuthState({ queryClient }: AuthQueryContext) {
	const { token } = await queryClient.ensureQueryData(authStateQueryOptions());

	return {
		token,
		isAuthenticated: Boolean(token),
	};
}

export async function applyProtectedAuth({
	queryClient,
	convexQueryClient,
}: ProtectedAuthContext) {
	const authState = await loadAuthState({ queryClient });

	if (authState.token) {
		convexQueryClient.serverHttpClient?.setAuth(authState.token);
	} else {
		convexQueryClient.serverHttpClient?.clearAuth();
	}

	return authState;
}
