import { useMutation } from "convex/react";
import { useHandleMutationError } from "@/hooks/use-handle-mutation-error";
import { trackItemIncrement } from "@/lib/metrics";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useManagedAction } from "./use-managed-action";

export function useIncrementItemValue() {
	const mutation = useMutation(api.items.incrementItemValue);
	const handleMutationError = useHandleMutationError();
	const { runAction, isPending } = useManagedAction();

	const incrementValue = async (args: {
		itemId: Id<"items">;
		delta?: number;
		setValue?: number;
	}) => {
		await runAction(() => mutation(args), {
			onSuccess: () => {
				trackItemIncrement("success");
			},
			onError: (error) => {
				trackItemIncrement("failure");
				handleMutationError(error, "Failed to update value");
			},
		});
	};

	return { incrementValue, isPending };
}
