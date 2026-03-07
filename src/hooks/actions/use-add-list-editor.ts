import { useMutation } from "convex/react";
import { toast } from "sonner";
import { trackListEditorAdded } from "@/lib/metrics";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useHandleMutationError } from "./use-handle-mutation-error";
import { useManagedAction } from "./use-managed-action";

export function useAddListEditor() {
	const mutation = useMutation(api.listEditors.addListEditorByEmail);
	const handleMutationError = useHandleMutationError();
	const { runAction, isPending } = useManagedAction();

	const addEditor = async (args: {
		listId: Id<"lists">;
		email: string;
		nickname?: string;
	}) => {
		const result = await runAction(
			() =>
				mutation({
					listId: args.listId,
					email: args.email,
					nickname: args.nickname,
				}),
			{
				onSuccess: () => {
					trackListEditorAdded("success");
					toast.success("Editor added");
				},
				onError: (error) => {
					trackListEditorAdded("failure");
					handleMutationError(error, "Failed to add editor");
				},
			},
		);
		return result !== undefined;
	};

	return { addEditor, isPending };
}
