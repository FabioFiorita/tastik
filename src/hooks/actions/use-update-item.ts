import { useMutation } from "convex/react";
import { toast } from "sonner";
import { trackItemUpdated } from "@/lib/metrics";
import type { ItemStatus } from "@/lib/types/item-status";
import type { ItemType } from "@/lib/types/item-type";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useHandleMutationError } from "./use-handle-mutation-error";
import { useManagedAction } from "./use-managed-action";

type UpdateItemParams = {
	itemId: Id<"items">;
	name?: string;
	type?: ItemType;
	currentValue?: number | null;
	description?: string | null;
	url?: string | null;
	tagId?: Id<"listTags"> | null;
	step?: number | null;
	calculatorValue?: number | null;
	status?: ItemStatus | null;
	completed?: boolean;
};

export function useUpdateItem() {
	const mutation = useMutation(api.items.updateItem);
	const handleMutationError = useHandleMutationError();
	const { runAction, isPending } = useManagedAction();

	const updateItem = async (params: UpdateItemParams): Promise<boolean> => {
		const result = await runAction(() => mutation(params), {
			onSuccess: () => {
				trackItemUpdated("success");
				toast.success("Item updated");
			},
			onError: (error) => {
				trackItemUpdated("failure");
				handleMutationError(error, "Failed to update item");
			},
		});
		return result !== undefined;
	};

	return { updateItem, isPending };
}
