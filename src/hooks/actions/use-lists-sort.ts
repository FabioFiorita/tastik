import { useMutation } from "convex/react";
import { useHandleMutationError } from "@/hooks/use-handle-mutation-error";
import type { SortBy } from "@/lib/types/sort-by";
import { api } from "../../../convex/_generated/api";
import { useUserPreferences } from "../queries/use-user-preferences";

export function useListsSort() {
	const preferences = useUserPreferences();
	const updatePreferenceMutation = useMutation(
		api.preferences.updateListsSortPreference,
	);
	const handleMutationError = useHandleMutationError();

	const sortBy: SortBy = preferences?.listsSortBy ?? "created_at";
	const sortAscending = preferences?.listsSortAscending ?? false;

	const updateSortBy = async (newSortBy: SortBy) => {
		try {
			await updatePreferenceMutation({
				sortBy: newSortBy,
				sortAscending,
			});
		} catch (error) {
			handleMutationError(error, "Failed to update sort preference");
		}
	};

	const toggleSortDirection = async () => {
		try {
			await updatePreferenceMutation({
				sortBy,
				sortAscending: !sortAscending,
			});
		} catch (error) {
			handleMutationError(error, "Failed to update sort direction");
		}
	};

	return {
		sortBy,
		sortAscending,
		updateSortBy,
		toggleSortDirection,
	};
}
