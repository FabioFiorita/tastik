import { useMutation } from "convex/react";
import { toast } from "sonner";
import { trackListEditorRemoved } from "@/lib/metrics";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useHandleMutationError } from "./use-handle-mutation-error";
import { useManagedAction } from "./use-managed-action";

export function useRemoveListEditor() {
	const mutation = useMutation(api.listEditors.removeListEditor);
	const handleMutationError = useHandleMutationError();
	const { runAction, isPending } = useManagedAction();

	const removeEditor = async (args: { editorId: Id<"listEditors"> }) => {
		const result = await runAction(() => mutation(args), {
			onSuccess: () => {
				trackListEditorRemoved("success");
				toast.success("Editor removed");
			},
			onError: (error) => {
				trackListEditorRemoved("failure");
				handleMutationError(error, "Failed to remove editor");
			},
		});
		return result !== undefined;
	};

	return { removeEditor, isPending };
}
