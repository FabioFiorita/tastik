import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function useUserLists(status: "active" | "archived" = "active") {
	const data = useQuery(api.lists.getUserLists, { status });
	return data;
}
