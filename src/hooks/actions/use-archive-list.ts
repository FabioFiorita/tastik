import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { trackListArchived } from "@/lib/metrics";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useHandleMutationError } from "./use-handle-mutation-error";
import { useManagedAction } from "./use-managed-action";

export function useArchiveList() {
	const mutation = useMutation(api.lists.archiveList);
	const navigate = useNavigate();
	const handleMutationError = useHandleMutationError();
	const { runAction, isPending } = useManagedAction();

	const archiveList = async (args: { listId: Id<"lists"> }) => {
		const result = await runAction(() => mutation(args), {
			onSuccess: () => {
				trackListArchived("success");
				toast.success("List archived");
				navigate({ to: "/archive", replace: true });
			},
			onError: (error) => {
				trackListArchived("failure");
				handleMutationError(error, "Failed to archive list");
			},
		});
		return result !== undefined;
	};

	return { archiveList, isPending };
}
