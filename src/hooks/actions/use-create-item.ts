import { useMutation } from "convex/react";
import { toast } from "sonner";
import { useHandleMutationError } from "@/hooks/use-handle-mutation-error";
import { trackItemCreated } from "@/lib/metrics";
import type { ItemStatus } from "@/lib/types/item-status";
import type { ItemType } from "@/lib/types/item-type";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useManagedAction } from "./use-managed-action";

export function useCreateItem() {
	const mutation = useMutation(api.items.createItem);
	const handleMutationError = useHandleMutationError();
	const { runAction, isPending } = useManagedAction();

	const createItem = async (args: {
		listId: Id<"lists">;
		name: string;
		type?: ItemType;
		currentValue?: number;
		step?: number;
		calculatorValue?: number;
		status?: ItemStatus;
		completed?: boolean;
		tagId?: Id<"listTags">;
		description?: string;
		url?: string;
		notes?: string;
	}): Promise<boolean> => {
		const result = await runAction(() => mutation(args), {
			onSuccess: () => {
				trackItemCreated(args.type ?? "simple", "success");
				toast.success("Item added");
			},
			onError: (error) => {
				trackItemCreated(args.type ?? "simple", "failure");
				handleMutationError(error, "Failed to add item");
			},
		});
		return result !== undefined;
	};

	return { createItem, isPending };
}
