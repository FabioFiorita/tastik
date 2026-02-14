import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { trackItemDeleted } from "@/lib/metrics";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function useDeleteItem() {
	const mutation = useMutation(api.items.deleteItem);
	const [isPending, setIsPending] = useState(false);

	const deleteItem = async (args: { itemId: Id<"items"> }) => {
		setIsPending(true);
		try {
			await mutation(args);
			trackItemDeleted("success");
			toast.success("Item deleted");
		} catch {
			trackItemDeleted("failure");
			toast.error("Failed to delete item");
		} finally {
			setIsPending(false);
		}
	};

	return { deleteItem, isPending };
}
