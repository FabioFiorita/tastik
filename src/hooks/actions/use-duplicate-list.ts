import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { ERROR_CODES, isAppErrorData } from "../../../convex/lib/errors";

export function useDuplicateList() {
	const mutation = useMutation(api.lists.duplicateList);
	const navigate = useNavigate();

	const duplicateList = async (args: { listId: Id<"lists"> }) => {
		try {
			const newListId = await mutation(args);

			toast.success("List duplicated successfully");
			navigate({ to: "/lists/$listId", params: { listId: newListId } });

			return newListId;
		} catch (error) {
			if (error instanceof ConvexError && isAppErrorData(error.data)) {
				if (error.data.code === ERROR_CODES.UPGRADE_REQUIRED) {
					toast.warning(error.data.message, {
						action: {
							label: "Upgrade",
							onClick: () => navigate({ to: "/subscription" }),
						},
					});
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
