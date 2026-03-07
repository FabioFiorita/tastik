import { useMutation } from "convex/react";
import { toast } from "sonner";
import { trackListDeleted } from "@/lib/metrics";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useHandleMutationError } from "./use-handle-mutation-error";
import { useManagedAction } from "./use-managed-action";

export function useDeleteList() {
	const mutation = useMutation(api.lists.deleteList);
	const handleMutationError = useHandleMutationError();
	const { runAction, isPending } = useManagedAction();

	const deleteList = async (args: { listId: Id<"lists"> }) => {
		const result = await runAction(() => mutation(args), {
			onSuccess: () => {
				trackListDeleted("success");
				toast.success("List deleted");
			},
			onError: (error) => {
				trackListDeleted("failure");
				handleMutationError(error, "Failed to delete list");
			},
		});
		return result !== undefined;
	};

	return { deleteList, isPending };
}
