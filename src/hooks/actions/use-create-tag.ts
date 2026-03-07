import { useMutation } from "convex/react";
import { toast } from "sonner";
import { trackTagCreated } from "@/lib/metrics";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { ERROR_CODES } from "../../../convex/lib/errors";
import { useHandleMutationError } from "./use-handle-mutation-error";
import { useManagedAction } from "./use-managed-action";

type CreateTagParams = {
	listId: Id<"lists">;
	name: string;
	color?: string;
};

export function useCreateTag() {
	const mutation = useMutation(api.tags.createTag);
	const handleMutationError = useHandleMutationError();
	const { runAction, isPending } = useManagedAction();

	const createTag = async (
		params: CreateTagParams,
	): Promise<Id<"listTags"> | null> => {
		const trimmedName = params.name.trim();
		if (!trimmedName) {
			toast.error("Tag name cannot be empty");
			return null;
		}
		const result = await runAction(
			() =>
				mutation({
					listId: params.listId,
					name: trimmedName,
					color: params.color,
				}),
			{
				onSuccess: () => {
					trackTagCreated("success");
					toast.success("Tag added");
				},
				onError: (error) => {
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
				},
			},
		);
		return result ?? null;
	};

	return { createTag, isPending };
}
