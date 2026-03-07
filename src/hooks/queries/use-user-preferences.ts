import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../convex/_generated/api";

export function userPreferencesQueryOptions() {
	return convexQuery(api.preferences.getUserPreferences, {});
}

export function useUserPreferences() {
	const { data } = useQuery(userPreferencesQueryOptions());
	return data;
}
