import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { useHandleMutationError } from "@/hooks/use-handle-mutation-error";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function useUpdateEditorNickname() {
	const mutation = useMutation(api.listEditors.updateEditorNickname);
	const handleMutationError = useHandleMutationError();
	const [isPending, setIsPending] = useState(false);

	const updateNickname = async (args: {
		editorId: Id<"listEditors">;
		nickname: string | null;
	}) => {
		setIsPending(true);
		try {
			await mutation(args);
			toast.success("Nickname updated");
			return true;
		} catch (error) {
			handleMutationError(error, "Failed to update nickname");
			return false;
		} finally {
			setIsPending(false);
		}
	};

	return { updateNickname, isPending };
}
