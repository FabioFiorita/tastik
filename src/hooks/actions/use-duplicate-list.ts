import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { useHandleMutationError } from "@/hooks/use-handle-mutation-error";
import { trackListDuplicated } from "@/lib/metrics";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useManagedAction } from "./use-managed-action";

export function useDuplicateList() {
	const mutation = useMutation(api.lists.duplicateList);
	const navigate = useNavigate();
	const handleMutationError = useHandleMutationError();
	const { runAction, isPending } = useManagedAction();

	const duplicateList = async (args: { listId: Id<"lists"> }) => {
		return await runAction(() => mutation(args), {
			onSuccess: (newListId) => {
				trackListDuplicated("success");
				toast.success("List duplicated successfully");
				navigate({ to: "/lists/$listId", params: { listId: newListId } });
			},
			onError: (error) => {
				trackListDuplicated("failure");
				handleMutationError(error, "Failed to duplicate list");
			},
		});
	};

	return {
		duplicateList,
		isPending,
	};
}
