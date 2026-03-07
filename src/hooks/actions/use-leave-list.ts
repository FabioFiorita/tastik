import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useHandleMutationError } from "./use-handle-mutation-error";
import { useManagedAction } from "./use-managed-action";

export function useLeaveList() {
	const mutation = useMutation(api.listEditors.leaveList);
	const navigate = useNavigate();
	const handleMutationError = useHandleMutationError();
	const { runAction, isPending } = useManagedAction();

	const leaveList = async (args: { listId: Id<"lists"> }) => {
		const result = await runAction(() => mutation(args), {
			onSuccess: () => {
				toast.success("You left the list");
				navigate({ to: "/home", replace: true });
			},
			onError: (error) => {
				handleMutationError(error, "Failed to leave list");
			},
		});
		return result !== undefined;
	};

	return { leaveList, isPending };
}
