import { useAuth } from "@clerk/tanstack-react-start";
import { useConvexAuth } from "convex/react";

export function useIsAuthenticated() {
	const { isLoaded, isSignedIn } = useAuth();
	const { isAuthenticated } = useConvexAuth();
	return Boolean(isLoaded && isSignedIn && isAuthenticated);
}
