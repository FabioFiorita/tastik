import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useIsAuthenticated } from "@/hooks/use-is-authenticated";
import { api } from "../../../convex/_generated/api";

export function userPreferencesQueryOptions(isAuthenticated: boolean = true) {
	return convexQuery(
		api.preferences.getUserPreferences,
		isAuthenticated ? {} : "skip",
	);
}

export function useUserPreferences() {
	const isAuthenticated = useIsAuthenticated();
	const { data } = useQuery(userPreferencesQueryOptions(isAuthenticated));
	return data;
}
