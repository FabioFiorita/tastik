import { useMutation } from "convex/react";
import type { SortBy } from "@/lib/types/sort-by";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useHandleMutationError } from "./use-handle-mutation-error";
import { useManagedAction } from "./use-managed-action";

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
	const { runAction, isPending } = useManagedAction();

	const updateSortBy = async (sortBy: SortBy) => {
		await runAction(() => mutation({ listId, sortBy }), {
			onError: (error) => {
				handleMutationError(error, "Failed to update sort preference");
			},
		});
	};

	const toggleSortDirection = async () => {
		await runAction(
			() =>
				mutation({
					listId,
					sortAscending: !currentPreferences.sortAscending,
				}),
			{
				onError: (error) => {
					handleMutationError(error, "Failed to update sort direction");
				},
			},
		);
	};

	const toggleShowCompleted = async () => {
		await runAction(
			() =>
				mutation({
					listId,
					showCompleted: !currentPreferences.showCompleted,
				}),
			{
				onError: (error) => {
					handleMutationError(error, "Failed to update visibility preference");
				},
			},
		);
	};

	const toggleHideCheckbox = async () => {
		await runAction(
			() =>
				mutation({
					listId,
					hideCheckbox: !currentPreferences.hideCheckbox,
				}),
			{
				onError: (error) => {
					handleMutationError(error, "Failed to update checkbox visibility");
				},
			},
		);
	};

	const toggleShowTotal = async () => {
		await runAction(
			() => mutation({ listId, showTotal: !currentPreferences.showTotal }),
			{
				onError: (error) => {
					handleMutationError(error, "Failed to update total visibility");
				},
			},
		);
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
