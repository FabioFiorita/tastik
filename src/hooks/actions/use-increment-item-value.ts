import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function useIncrementItemValue() {
	const mutation = useMutation(api.items.incrementItemValue);
	const [isPending, setIsPending] = useState(false);

	const incrementValue = async (args: {
		itemId: Id<"items">;
		delta?: number;
		setValue?: number;
	}) => {
		setIsPending(true);
		try {
			await mutation(args);
		} catch {
			toast.error("Failed to update value");
		} finally {
			setIsPending(false);
		}
	};

	return { incrementValue, isPending };
}
