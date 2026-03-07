import { useMutation } from "convex/react";
import type { SortBy } from "@/lib/types/sort-by";
import { api } from "../../../convex/_generated/api";
import { useUserPreferences } from "../queries/use-user-preferences";
import { useHandleMutationError } from "./use-handle-mutation-error";
import { useManagedAction } from "./use-managed-action";

export function useListsSort() {
	const preferences = useUserPreferences();
	const updatePreferenceMutation = useMutation(
		api.preferences.updateListsSortPreference,
	);
	const handleMutationError = useHandleMutationError();
	const { runAction, isPending } = useManagedAction();

	const sortBy: SortBy = preferences?.listsSortBy ?? "created_at";
	const sortAscending = preferences?.listsSortAscending ?? false;

	const updateSortBy = async (newSortBy: SortBy) => {
		await runAction(
			() =>
				updatePreferenceMutation({
					sortBy: newSortBy,
					sortAscending,
				}),
			{
				onError: (error) => {
					handleMutationError(error, "Failed to update sort preference");
				},
			},
		);
	};

	const toggleSortDirection = async () => {
		await runAction(
			() =>
				updatePreferenceMutation({
					sortBy,
					sortAscending: !sortAscending,
				}),
			{
				onError: (error) => {
					handleMutationError(error, "Failed to update sort direction");
				},
			},
		);
	};

	return {
		sortBy,
		sortAscending,
		updateSortBy,
		toggleSortDirection,
		isPending,
	};
}
