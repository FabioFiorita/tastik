import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function useDeleteList() {
	const mutation = useMutation(api.lists.deleteList);
	const [isPending, setIsPending] = useState(false);

	const deleteList = async (args: { listId: Id<"lists"> }) => {
		setIsPending(true);
		try {
			await mutation(args);
			toast.success("List deleted");
		} catch {
			toast.error("Failed to delete list");
		} finally {
			setIsPending(false);
		}
	};

	return { deleteList, isPending };
}
