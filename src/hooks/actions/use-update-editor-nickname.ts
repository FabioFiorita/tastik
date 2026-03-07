import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useHandleMutationError } from "./use-handle-mutation-error";
import { useManagedAction } from "./use-managed-action";

export function useUpdateEditorNickname() {
	const mutation = useMutation(api.listEditors.updateEditorNickname);
	const handleMutationError = useHandleMutationError();
	const { runAction, isPending } = useManagedAction();

	const updateNickname = async (args: {
		editorId: Id<"listEditors">;
		nickname: string | null;
	}) => {
		const result = await runAction(() => mutation(args), {
			onSuccess: () => {
				toast.success("Nickname updated");
			},
			onError: (error) => {
				handleMutationError(error, "Failed to update nickname");
			},
		});
		return result !== undefined;
	};

	return { updateNickname, isPending };
}
