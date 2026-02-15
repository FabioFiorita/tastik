import { useMutation } from "convex/react";
import { useState } from "react";
import { useHandleMutationError } from "@/hooks/use-handle-mutation-error";
import type { SortBy } from "@/lib/types/sort-by";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function useUpdateListPreferences(
	listId: Id<"lists">,
	currentPreferences: {
		sortBy: SortBy;
		sortAscending: boolean;
		showCompleted: boolean;
		hideCheckbox?: boolean;
		showTotal?: boolean;
	},
) {
	const mutation = useMutation(api.lists.updateList);
	const handleMutationError = useHandleMutationError();
	const [isPending, setIsPending] = useState(false);

	const updateSortBy = async (sortBy: SortBy) => {
		setIsPending(true);
		try {
			await mutation({ listId, sortBy });
		} catch (error) {
			handleMutationError(error, "Failed to update sort preference");
		} finally {
			setIsPending(false);
		}
	};

	const toggleSortDirection = async () => {
		setIsPending(true);
		try {
			await mutation({
				listId,
				sortAscending: !currentPreferences.sortAscending,
			});
		} catch (error) {
			handleMutationError(error, "Failed to update sort direction");
		} finally {
			setIsPending(false);
		}
	};

	const toggleShowCompleted = async () => {
		setIsPending(true);
		try {
			await mutation({
				listId,
				showCompleted: !currentPreferences.showCompleted,
			});
		} catch (error) {
			handleMutationError(error, "Failed to update visibility preference");
		} finally {
			setIsPending(false);
		}
	};

	const toggleHideCheckbox = async () => {
		setIsPending(true);
		try {
			await mutation({
				listId,
				hideCheckbox: !currentPreferences.hideCheckbox,
			});
		} catch (error) {
			handleMutationError(error, "Failed to update checkbox visibility");
		} finally {
			setIsPending(false);
		}
	};

	const toggleShowTotal = async () => {
		setIsPending(true);
		try {
			await mutation({ listId, showTotal: !currentPreferences.showTotal });
		} catch (error) {
			handleMutationError(error, "Failed to update total visibility");
		} finally {
			setIsPending(false);
		}
	};

	return {
		updateSortBy,
		toggleSortDirection,
		toggleShowCompleted,
		toggleHideCheckbox,
		toggleShowTotal,
		isPending,
	};
}
