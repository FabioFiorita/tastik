import { useMutation } from "convex/react";
import { toast } from "sonner";
import { trackTagDeleted } from "@/lib/metrics";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useHandleMutationError } from "./use-handle-mutation-error";
import { useManagedAction } from "./use-managed-action";

export function useDeleteTag() {
	const mutation = useMutation(api.tags.deleteTag);
	const handleMutationError = useHandleMutationError();
	const { runAction, isPending } = useManagedAction();

	const deleteTag = async (tagId: Id<"listTags">): Promise<boolean> => {
		const result = await runAction(() => mutation({ tagId }), {
			onSuccess: () => {
				trackTagDeleted("success");
				toast.success("Tag removed");
			},
			onError: (error) => {
				trackTagDeleted("failure");
				handleMutationError(error, "Failed to remove tag");
			},
		});
		return result !== undefined;
	};

	return { deleteTag, isPending };
}
