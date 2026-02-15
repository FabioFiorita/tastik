import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useState } from "react";
import { toast } from "sonner";
import { trackTagCreated } from "@/lib/metrics";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { ERROR_CODES, isAppErrorData } from "../../../convex/lib/errors";

type CreateTagParams = {
	listId: Id<"lists">;
	name: string;
	color?: string;
};

export function useCreateTag() {
	const mutation = useMutation(api.tags.createTag);
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
			if (error instanceof ConvexError && isAppErrorData(error.data)) {
				if (error.data.code === ERROR_CODES.TAG_NAME_EXISTS) {
					toast.error(error.data.message);
					return null;
				}
			}
			toast.error(getErrorMessage(error, "Failed to add tag"));
			return null;
		} finally {
			setIsPending(false);
		}
	};

	return { createTag, isPending };
}
