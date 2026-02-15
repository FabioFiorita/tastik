import { useMutation } from "convex/react";
import { toast } from "sonner";
import type { SortBy } from "@/lib/types/sort-by";
import { api } from "../../../convex/_generated/api";
import { useUserPreferences } from "../queries/use-user-preferences";

export function useListsSort() {
	const preferences = useUserPreferences();
	const updatePreferenceMutation = useMutation(
		api.preferences.updateListsSortPreference,
	);

	const sortBy: SortBy = preferences?.listsSortBy ?? "created_at";
	const sortAscending = preferences?.listsSortAscending ?? false;

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
