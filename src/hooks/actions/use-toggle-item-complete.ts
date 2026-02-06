import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function useToggleItemComplete() {
	const mutation = useMutation(api.items.toggleItemComplete);
	const [isPending, setIsPending] = useState(false);

	const toggleItemComplete = async (args: { itemId: Id<"items"> }) => {
		setIsPending(true);
		try {
			await mutation(args);
		} catch {
			toast.error("Failed to update item");
		} finally {
			setIsPending(false);
		}
	};

	return { toggleItemComplete, isPending };
}
