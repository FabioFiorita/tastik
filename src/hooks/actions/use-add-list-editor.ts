import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { trackListEditorAdded } from "@/lib/metrics";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function useAddListEditor() {
	const mutation = useMutation(api.listEditors.addListEditorByEmail);
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
			toast.error(getErrorMessage(error, "Failed to add editor"));
			return false;
		} finally {
			setIsPending(false);
		}
	};

	return { addEditor, isPending };
}
