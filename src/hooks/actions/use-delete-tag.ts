import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { trackTagDeleted } from "@/lib/metrics";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function useDeleteTag() {
	const mutation = useMutation(api.tags.deleteTag);
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
			toast.error(getErrorMessage(error, "Failed to remove tag"));
			return false;
		} finally {
			setIsPending(false);
		}
	};

	return { deleteTag, isPending };
}
