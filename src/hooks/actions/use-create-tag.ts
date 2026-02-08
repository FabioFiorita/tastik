import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useState } from "react";
import { toast } from "sonner";
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
	const navigate = useNavigate();
	const mutation = useMutation(api.tags.createTag);
	const [isPending, setIsPending] = useState(false);

	const createTag = async (params: CreateTagParams): Promise<boolean> => {
		const trimmedName = params.name.trim();
		if (!trimmedName) {
			toast.error("Tag name cannot be empty");
			return false;
		}
		setIsPending(true);
		try {
			await mutation({
				listId: params.listId,
				name: trimmedName,
				color: params.color,
			});
			toast.success("Tag added");
			return true;
		} catch (error) {
			if (error instanceof ConvexError && isAppErrorData(error.data)) {
				if (error.data.code === ERROR_CODES.TAG_NAME_EXISTS) {
					toast.error(error.data.message);
					return false;
				}
				if (error.data.code === ERROR_CODES.UPGRADE_REQUIRED) {
					toast.warning(error.data.message, {
						action: {
							label: "Upgrade",
							onClick: () => navigate({ to: "/subscription" }),
						},
					});
					return false;
				}
			}
			toast.error(getErrorMessage(error, "Failed to add tag"));
			return false;
		} finally {
			setIsPending(false);
		}
	};

	return { createTag, isPending };
}
