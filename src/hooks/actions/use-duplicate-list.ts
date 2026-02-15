import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { useHandleMutationError } from "@/hooks/use-handle-mutation-error";
import { trackListDuplicated } from "@/lib/metrics";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function useDuplicateList() {
	const mutation = useMutation(api.lists.duplicateList);
	const navigate = useNavigate();
	const handleMutationError = useHandleMutationError();

	const duplicateList = async (args: { listId: Id<"lists"> }) => {
		try {
			const newListId = await mutation(args);
			trackListDuplicated("success");
			toast.success("List duplicated successfully");
			navigate({ to: "/lists/$listId", params: { listId: newListId } });
			return newListId;
		} catch (error) {
			trackListDuplicated("failure");
			handleMutationError(error, "Failed to duplicate list");
			return undefined;
		}
	};

	return {
		duplicateList,
		isPending: false, // Convex mutations handle pending state internally
	};
}
