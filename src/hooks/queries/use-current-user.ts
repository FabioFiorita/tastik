import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "../../../convex/_generated/api";

export function currentUserQueryOptions() {
	return convexQuery(api.users.getCurrentUser, {});
}

export function useCurrentUser() {
	const { data } = useSuspenseQuery(currentUserQueryOptions());
	return data;
}
