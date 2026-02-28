import { useMutation } from "convex/react";
import { toast } from "sonner";
import { useHandleMutationError } from "@/hooks/use-handle-mutation-error";
import type { ListType } from "@/lib/types/list-type";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useManagedAction } from "./use-managed-action";

type UpdateListParams = {
	listId: Id<"lists">;
	name?: string;
	type?: ListType;
	icon?: string;
};

export function useUpdateList() {
	const mutation = useMutation(api.lists.updateList);
	const handleMutationError = useHandleMutationError();
	const { runAction, isPending } = useManagedAction();

	const updateList = async (params: UpdateListParams): Promise<boolean> => {
		const result = await runAction(
			() =>
				mutation({
					listId: params.listId,
					name: params.name?.trim(),
					type: params.type,
					icon: params.icon,
				}),
			{
				onSuccess: () => {
					toast.success("List updated");
				},
				onError: (error) => {
					handleMutationError(error, "Failed to update list");
				},
			},
		);
		return result !== undefined;
	};

	return { updateList, isPending };
}
