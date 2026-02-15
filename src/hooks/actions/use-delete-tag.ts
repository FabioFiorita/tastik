import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { useHandleMutationError } from "@/hooks/use-handle-mutation-error";
import { trackTagDeleted } from "@/lib/metrics";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function useDeleteTag() {
	const mutation = useMutation(api.tags.deleteTag);
	const handleMutationError = useHandleMutationError();
	const [isPending, setIsPending] = useState(false);

	const deleteTag = async (tagId: Id<"listTags">): Promise<boolean> => {
		setIsPending(true);
		try {
			await mutation({ tagId });
			trackTagDeleted("success");
			toast.success("Tag removed");
			return true;
		} catch (error) {
			trackTagDeleted("failure");
			handleMutationError(error, "Failed to remove tag");
			return false;
		} finally {
			setIsPending(false);
		}
	};

	return { deleteTag, isPending };
}
