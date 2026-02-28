import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { useHandleMutationError } from "@/hooks/use-handle-mutation-error";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function useLeaveList() {
	const mutation = useMutation(api.listEditors.leaveList);
	const navigate = useNavigate();
	const handleMutationError = useHandleMutationError();
	const [isPending, setIsPending] = useState(false);

	const leaveList = async (args: { listId: Id<"lists"> }) => {
		setIsPending(true);
		try {
			await mutation(args);
			toast.success("You left the list");
			navigate({ to: "/home", replace: true });
			return true;
		} catch (error) {
			handleMutationError(error, "Failed to leave list");
			return false;
		} finally {
			setIsPending(false);
		}
	};

	return { leaveList, isPending };
}
