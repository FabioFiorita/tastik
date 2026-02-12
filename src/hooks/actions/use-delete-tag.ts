import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { showUpgradeToast } from "@/lib/utils/show-upgrade-toast";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { ERROR_CODES, isAppErrorData } from "../../../convex/lib/errors";

export function useDeleteTag() {
	const navigate = useNavigate();
	const mutation = useMutation(api.tags.deleteTag);
	const [isPending, setIsPending] = useState(false);

	const deleteTag = async (tagId: Id<"listTags">): Promise<boolean> => {
		setIsPending(true);
		try {
			await mutation({ tagId });
			toast.success("Tag removed");
			return true;
		} catch (error) {
			if (error instanceof ConvexError && isAppErrorData(error.data)) {
				if (error.data.code === ERROR_CODES.UPGRADE_REQUIRED) {
					showUpgradeToast(error.data.message, navigate);
					return false;
				}
			}
			toast.error(getErrorMessage(error, "Failed to remove tag"));
			return false;
		} finally {
			setIsPending(false);
		}
	};

	return { deleteTag, isPending };
}
