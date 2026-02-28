import { useMutation } from "convex/react";
import { useHandleMutationError } from "@/hooks/use-handle-mutation-error";
import { trackItemToggleComplete } from "@/lib/metrics";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useManagedAction } from "./use-managed-action";

export function useToggleItemComplete() {
	const mutation = useMutation(api.items.toggleItemComplete);
	const handleMutationError = useHandleMutationError();
	const { runAction, isPending } = useManagedAction();

	const toggleItemComplete = async (args: { itemId: Id<"items"> }) => {
		await runAction(() => mutation(args), {
			onSuccess: () => {
				trackItemToggleComplete("success");
			},
			onError: (error) => {
				trackItemToggleComplete("failure");
				handleMutationError(error, "Failed to update item");
			},
		});
	};

	return { toggleItemComplete, isPending };
}
