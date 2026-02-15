import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { useHandleMutationError } from "@/hooks/use-handle-mutation-error";
import { trackListArchived } from "@/lib/metrics";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function useArchiveList() {
	const mutation = useMutation(api.lists.archiveList);
	const navigate = useNavigate();
	const handleMutationError = useHandleMutationError();
	const [isPending, setIsPending] = useState(false);

	const archiveList = async (args: { listId: Id<"lists"> }) => {
		setIsPending(true);
		try {
			await mutation(args);
			trackListArchived("success");
			toast.success("List archived");
			navigate({ to: "/archive", replace: true });
			return true;
		} catch (error) {
			trackListArchived("failure");
			handleMutationError(error, "Failed to archive list");
			return false;
		} finally {
			setIsPending(false);
		}
	};

	return { archiveList, isPending };
}
