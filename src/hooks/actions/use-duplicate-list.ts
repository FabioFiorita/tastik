import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { trackListDuplicated } from "@/lib/metrics";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function useDuplicateList() {
	const mutation = useMutation(api.lists.duplicateList);
	const navigate = useNavigate();

	const duplicateList = async (args: { listId: Id<"lists"> }) => {
		try {
			const newListId = await mutation(args);
			trackListDuplicated("success");
			toast.success("List duplicated successfully");
			navigate({ to: "/lists/$listId", params: { listId: newListId } });
			return newListId;
		} catch (error) {
			trackListDuplicated("failure");
			toast.error(getErrorMessage(error, "Failed to duplicate list"));
			return undefined;
		}
	};

	return {
		duplicateList,
		isPending: false, // Convex mutations handle pending state internally
	};
}
