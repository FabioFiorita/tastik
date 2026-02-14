import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function useRestoreList() {
	const mutation = useMutation(api.lists.restoreList);
	const navigate = useNavigate();
	const [isPending, setIsPending] = useState(false);

	const restoreList = async (args: { listId: Id<"lists"> }) => {
		setIsPending(true);
		try {
			await mutation(args);
			toast.success("List restored");
			navigate({ to: "/lists/$listId", params: { listId: args.listId } });
			return true;
		} catch {
			toast.error("Failed to restore list");
			return false;
		} finally {
			setIsPending(false);
		}
	};

	return { restoreList, isPending };
}
