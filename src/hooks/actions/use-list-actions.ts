import { useNavigate } from "@tanstack/react-router";
import type { Id } from "../../../convex/_generated/dataModel";
import { useCreateItem } from "./use-create-item";
import { useDeleteItem } from "./use-delete-item";
import { useDeleteList } from "./use-delete-list";
import { useToggleItemComplete } from "./use-toggle-item-complete";

export function useListActions(listId: Id<"lists"> | undefined) {
	const navigate = useNavigate();

	const { createItem, isPending: isCreating } = useCreateItem();
	const { toggleItemComplete } = useToggleItemComplete();
	const { deleteItem } = useDeleteItem();
	const { deleteList, isPending: isDeleting } = useDeleteList();

	const handleCreateItem = async () => {
		if (!listId) return;
		await createItem({
			listId,
			name: "New item",
		});
	};

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

		await deleteList({ listId });
		navigate({ to: "/" });
	};

	return {
		handleCreateItem,
		handleToggleItem,
		handleDeleteItem,
		handleDeleteList,
		isCreating,
		isDeleting,
	};
}
