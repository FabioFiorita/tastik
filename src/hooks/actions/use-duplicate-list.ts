import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import { trackListDuplicated } from "@/lib/metrics";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { showUpgradeToast } from "@/lib/utils/show-upgrade-toast";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { ERROR_CODES, isAppErrorData } from "../../../convex/lib/errors";

export function useDuplicateList() {
	const mutation = useMutation(api.lists.duplicateList);
	const navigate = useNavigate();

	const duplicateList = async (args: { listId: Id<"lists"> }) => {
		try {
			const newListId = await mutation(args);
			trackListDuplicated("success");
			toast.success("List duplicated successfully");
			navigate({ to: "/lists/$listId", params: { listId: newListId } });
			return newListId;
		} catch (error) {
			trackListDuplicated("failure");
			if (error instanceof ConvexError && isAppErrorData(error.data)) {
				if (error.data.code === ERROR_CODES.UPGRADE_REQUIRED) {
					showUpgradeToast(error.data.message, navigate);
					return undefined;
				}
			}
			toast.error(getErrorMessage(error, "Failed to duplicate list"));
			return undefined;
		}
	};

	return {
		duplicateList,
		isPending: false, // Convex mutations handle pending state internally
	};
}
