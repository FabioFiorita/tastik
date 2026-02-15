import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { useHandleMutationError } from "@/hooks/use-handle-mutation-error";
import { trackListEditorRemoved } from "@/lib/metrics";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function useRemoveListEditor() {
	const mutation = useMutation(api.listEditors.removeListEditor);
	const handleMutationError = useHandleMutationError();
	const [isPending, setIsPending] = useState(false);

	const removeEditor = async (args: { editorId: Id<"listEditors"> }) => {
		setIsPending(true);
		try {
			await mutation(args);
			trackListEditorRemoved("success");
			toast.success("Editor removed");
			return true;
		} catch (error) {
			trackListEditorRemoved("failure");
			handleMutationError(error, "Failed to remove editor");
			return false;
		} finally {
			setIsPending(false);
		}
	};

	return { removeEditor, isPending };
}
