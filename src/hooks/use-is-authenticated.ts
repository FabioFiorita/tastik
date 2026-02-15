import { useConvexAuth } from "convex/react";

export function useIsAuthenticated() {
	const { isAuthenticated, isLoading } = useConvexAuth();
	return Boolean(!isLoading && isAuthenticated);
}
