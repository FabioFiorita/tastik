import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

type UpdateListParams = {
	listId: Id<"lists">;
	name?: string;
	type?: "simple" | "stepper" | "calculator" | "kanban" | "multi";
	icon?: string;
};

export function useUpdateList() {
	const mutation = useMutation(api.lists.updateList);
	const [isPending, setIsPending] = useState(false);

	const updateList = async (params: UpdateListParams): Promise<boolean> => {
		setIsPending(true);
		try {
			await mutation({
				listId: params.listId,
				name: params.name?.trim(),
				type: params.type,
				icon: params.icon,
			});
			toast.success("List updated");
			return true;
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to update list"));
			return false;
		} finally {
			setIsPending(false);
		}
	};

	return { updateList, isPending };
}
