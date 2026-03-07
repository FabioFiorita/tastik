import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { trackListRestored } from "@/lib/metrics";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useHandleMutationError } from "./use-handle-mutation-error";
import { useManagedAction } from "./use-managed-action";

export function useRestoreList() {
	const mutation = useMutation(api.lists.restoreList);
	const navigate = useNavigate();
	const handleMutationError = useHandleMutationError();
	const { runAction, isPending } = useManagedAction();

	const restoreList = async (args: { listId: Id<"lists"> }) => {
		const result = await runAction(() => mutation(args), {
			onSuccess: () => {
				trackListRestored("success");
				toast.success("List restored");
				navigate({ to: "/lists/$listId", params: { listId: args.listId } });
			},
			onError: (error) => {
				trackListRestored("failure");
				handleMutationError(error, "Failed to restore list");
			},
		});
		return result !== undefined;
	};

	return { restoreList, isPending };
}
