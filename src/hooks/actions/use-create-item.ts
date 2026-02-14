import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import type { ItemStatus } from "@/lib/types/item-status";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function useCreateItem() {
	const mutation = useMutation(api.items.createItem);
	const [isPending, setIsPending] = useState(false);

	const createItem = async (args: {
		listId: Id<"lists">;
		name: string;
		type?: "simple" | "stepper" | "calculator" | "kanban";
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
		setIsPending(true);
		try {
			await mutation(args);
			toast.success("Item added");
			return true;
		} catch {
			toast.error("Failed to add item");
			return false;
		} finally {
			setIsPending(false);
		}
	};

	return { createItem, isPending };
}
