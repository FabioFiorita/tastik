import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import type { SortBy } from "@/lib/types/sort-by";
import { getErrorMessage } from "@/lib/utils/get-error-message";
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
	const [isPending, setIsPending] = useState(false);

	const updateSortBy = async (sortBy: SortBy) => {
		setIsPending(true);
		try {
			await mutation({ listId, sortBy });
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to update sort preference"));
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
			toast.error(getErrorMessage(error, "Failed to update sort direction"));
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
			toast.error(
				getErrorMessage(error, "Failed to update visibility preference"),
			);
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
			toast.error(
				getErrorMessage(error, "Failed to update checkbox visibility"),
			);
		} finally {
			setIsPending(false);
		}
	};

	const toggleShowTotal = async () => {
		setIsPending(true);
		try {
			await mutation({ listId, showTotal: !currentPreferences.showTotal });
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to update total visibility"));
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
