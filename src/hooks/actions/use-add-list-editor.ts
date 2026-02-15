import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { useHandleMutationError } from "@/hooks/use-handle-mutation-error";
import { trackListEditorAdded } from "@/lib/metrics";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function useAddListEditor() {
	const mutation = useMutation(api.listEditors.addListEditorByEmail);
	const handleMutationError = useHandleMutationError();
	const [isPending, setIsPending] = useState(false);

	const addEditor = async (args: {
		listId: Id<"lists">;
		email: string;
		nickname?: string;
	}) => {
		setIsPending(true);
		try {
			await mutation({
				listId: args.listId,
				email: args.email,
				nickname: args.nickname,
			});
			trackListEditorAdded("success");
			toast.success("Editor added");
			return true;
		} catch (error) {
			trackListEditorAdded("failure");
			handleMutationError(error, "Failed to add editor");
			return false;
		} finally {
			setIsPending(false);
		}
	};

	return { addEditor, isPending };
}
