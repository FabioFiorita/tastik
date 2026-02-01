import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "../../../convex/_generated/api";

export function useCurrentUser() {
	const { data } = useSuspenseQuery(convexQuery(api.users.getCurrentUser, {}));
	return data;
}
