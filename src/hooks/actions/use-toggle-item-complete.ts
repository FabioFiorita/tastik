import { useMutation } from "convex/react";
import { useState } from "react";
import { useHandleMutationError } from "@/hooks/use-handle-mutation-error";
import { trackItemToggleComplete } from "@/lib/metrics";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function useToggleItemComplete() {
	const mutation = useMutation(api.items.toggleItemComplete);
	const handleMutationError = useHandleMutationError();
	const [isPending, setIsPending] = useState(false);

	const toggleItemComplete = async (args: { itemId: Id<"items"> }) => {
		setIsPending(true);
		try {
			await mutation(args);
			trackItemToggleComplete("success");
		} catch (error) {
			trackItemToggleComplete("failure");
			handleMutationError(error, "Failed to update item");
		} finally {
			setIsPending(false);
		}
	};

	return { toggleItemComplete, isPending };
}
