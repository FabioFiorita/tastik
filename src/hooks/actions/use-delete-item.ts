import { useMutation } from "convex/react";
import { toast } from "sonner";
import { trackItemDeleted } from "@/lib/metrics";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useHandleMutationError } from "./use-handle-mutation-error";
import { useManagedAction } from "./use-managed-action";

export function useDeleteItem() {
	const mutation = useMutation(api.items.deleteItem);
	const handleMutationError = useHandleMutationError();
	const { runAction, isPending } = useManagedAction();

	const deleteItem = async (args: { itemId: Id<"items"> }) => {
		await runAction(() => mutation(args), {
			onSuccess: () => {
				trackItemDeleted("success");
				toast.success("Item deleted");
			},
			onError: (error) => {
				trackItemDeleted("failure");
				handleMutationError(error, "Failed to delete item");
			},
		});
	};

	return { deleteItem, isPending };
}
