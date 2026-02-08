import { useMutation } from "convex/react";
import { toast } from "sonner";
import type { SortBy } from "@/lib/types/sort-by";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "../queries/use-current-user";

export function useListsSort() {
	const user = useCurrentUser();
	const updatePreferenceMutation = useMutation(
		api.users.updateListsSortPreference,
	);

	const sortBy: SortBy = user?.listsSortBy ?? "created_at";
	const sortAscending = user?.listsSortAscending ?? false;

	const updateSortBy = async (newSortBy: SortBy) => {
		try {
			await updatePreferenceMutation({
				sortBy: newSortBy,
				sortAscending,
			});
		} catch (error) {
			toast.error("Failed to update sort preference");
			console.error(error);
		}
	};

	const toggleSortDirection = async () => {
		try {
			await updatePreferenceMutation({
				sortBy,
				sortAscending: !sortAscending,
			});
		} catch (error) {
			toast.error("Failed to update sort direction");
			console.error(error);
		}
	};

	return {
		sortBy,
		sortAscending,
		updateSortBy,
		toggleSortDirection,
	};
}
