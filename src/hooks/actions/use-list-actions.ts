import type { ItemStatus } from "@/lib/types/item-status";
import type { Id } from "../../../convex/_generated/dataModel";
import { useDeleteItem } from "./use-delete-item";
import { useIncrementItemValue } from "./use-increment-item-value";
import { useToggleItemComplete } from "./use-toggle-item-complete";
import { useUpdateItemStatus } from "./use-update-item-status";

export function useListActions() {
	const { toggleItemComplete } = useToggleItemComplete();
	const { deleteItem } = useDeleteItem();
	const { incrementValue } = useIncrementItemValue();
	const { updateStatus } = useUpdateItemStatus();

	const handleToggleItem = async (itemId: Id<"items">) => {
		await toggleItemComplete({ itemId });
	};

	const handleDeleteItem = async (itemId: Id<"items">) => {
		await deleteItem({ itemId });
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
		handleIncrementValue,
		handleUpdateStatus,
	};
}
