import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { useHandleMutationError } from "@/hooks/use-handle-mutation-error";
import { trackItemUpdated } from "@/lib/metrics";
import type { ItemStatus } from "@/lib/types/item-status";
import type { ItemType } from "@/lib/types/item-type";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

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
	const [isPending, setIsPending] = useState(false);

	const updateItem = async (params: UpdateItemParams): Promise<boolean> => {
		setIsPending(true);
		try {
			await mutation(params);
			trackItemUpdated("success");
			toast.success("Item updated");
			return true;
		} catch (error) {
			trackItemUpdated("failure");
			handleMutationError(error, "Failed to update item");
			return false;
		} finally {
			setIsPending(false);
		}
	};

	return { updateItem, isPending };
}
