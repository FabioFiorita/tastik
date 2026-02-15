import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { useHandleMutationError } from "@/hooks/use-handle-mutation-error";
import { trackTagCreated } from "@/lib/metrics";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { ERROR_CODES } from "../../../convex/lib/errors";

type CreateTagParams = {
	listId: Id<"lists">;
	name: string;
	color?: string;
};

export function useCreateTag() {
	const mutation = useMutation(api.tags.createTag);
	const handleMutationError = useHandleMutationError();
	const [isPending, setIsPending] = useState(false);

	const createTag = async (
		params: CreateTagParams,
	): Promise<Id<"listTags"> | null> => {
		const trimmedName = params.name.trim();
		if (!trimmedName) {
			toast.error("Tag name cannot be empty");
			return null;
		}
		setIsPending(true);
		try {
			const tagId = await mutation({
				listId: params.listId,
				name: trimmedName,
				color: params.color,
			});
			trackTagCreated("success");
			toast.success("Tag added");
			return tagId;
		} catch (error) {
			trackTagCreated("failure");
			handleMutationError(error, "Failed to add tag", {
				beforeToast: (data) => {
					if (data.code === ERROR_CODES.TAG_NAME_EXISTS) {
						toast.error(data.message);
						return true;
					}
					return false;
				},
			});
			return null;
		} finally {
			setIsPending(false);
		}
	};

	return { createTag, isPending };
}
