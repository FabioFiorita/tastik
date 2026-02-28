import { useMutation } from "convex/react";
import { useHandleMutationError } from "@/hooks/use-handle-mutation-error";
import { trackItemStatusUpdated } from "@/lib/metrics";
import type { ItemStatus } from "@/lib/types/item-status";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useManagedAction } from "./use-managed-action";

export function useUpdateItemStatus() {
	const mutation = useMutation(api.items.updateItemStatus);
	const handleMutationError = useHandleMutationError();
	const { runAction, isPending } = useManagedAction();

	const updateStatus = async (args: {
		itemId: Id<"items">;
		status: ItemStatus;
	}) => {
		await runAction(() => mutation(args), {
			onSuccess: () => {
				trackItemStatusUpdated("success");
			},
			onError: (error) => {
				trackItemStatusUpdated("failure");
				handleMutationError(error, "Failed to update status");
			},
		});
	};

	return { updateStatus, isPending };
}
