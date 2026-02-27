import { useNavigate } from "@tanstack/react-router";
import type { ItemStatus } from "@/lib/types/item-status";
import type { Id } from "../../../convex/_generated/dataModel";
import { useDeleteItem } from "./use-delete-item";
import { useDeleteList } from "./use-delete-list";
import { useIncrementItemValue } from "./use-increment-item-value";
import { useToggleItemComplete } from "./use-toggle-item-complete";
import { useUpdateItemStatus } from "./use-update-item-status";

export function useListActions(listId: Id<"lists"> | undefined) {
	const navigate = useNavigate();

	const { toggleItemComplete } = useToggleItemComplete();
	const { deleteItem } = useDeleteItem();
	const { deleteList, isPending: isDeleting } = useDeleteList();
	const { incrementValue } = useIncrementItemValue();
	const { updateStatus } = useUpdateItemStatus();

	const handleToggleItem = async (itemId: Id<"items">) => {
		await toggleItemComplete({ itemId });
	};

	const handleDeleteItem = async (itemId: Id<"items">) => {
		await deleteItem({ itemId });
	};

	const handleDeleteList = async () => {
		if (!listId) return;
		if (!confirm("Are you sure you want to delete this list?")) {
			return;
		}

		navigate({ to: "/home", replace: true });
		await deleteList({ listId });
	};

	const handleIncrementValue = async (
		itemId: Id<"items">,
		delta?: number,
		setValue?: number,
	) => {
		await incrementValue({ itemId, delta, setValue });
	};

	const handleUpdateStatus = async (
		itemId: Id<"items">,
		status: ItemStatus,
	) => {
		await updateStatus({ itemId, status });
	};

	return {
		handleToggleItem,
		handleDeleteItem,
		handleDeleteList,
		handleIncrementValue,
		handleUpdateStatus,
		isDeleting,
	};
}
