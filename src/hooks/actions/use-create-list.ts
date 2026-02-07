import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { ERROR_CODES, isAppErrorData } from "../../../convex/lib/errors";

type CreateListParams = {
	name: string;
	type?: "simple" | "stepper" | "calculator" | "kanban" | "multi";
	icon?: string;
};

export function useCreateList() {
	const navigate = useNavigate();
	const mutation = useMutation(api.lists.createList);
	const [isPending, setIsPending] = useState(false);

	const createList = async (
		params: CreateListParams,
	): Promise<Id<"lists"> | undefined> => {
		setIsPending(true);
		try {
			const listId = await mutation({
				name: params.name.trim(),
				type: params.type,
				icon: params.icon,
			});
			toast.success("List created");
			if (listId != null) {
				navigate({ to: "/lists/$listId", params: { listId } });
			}
			return listId;
		} catch (error) {
			if (error instanceof ConvexError && isAppErrorData(error.data)) {
				if (error.data.code === ERROR_CODES.UPGRADE_REQUIRED) {
					toast.warning(error.data.message, {
						action: {
							label: "Upgrade",
							onClick: () => {
								navigate({ to: "/subscription" });
							},
						},
					});
					return undefined;
				}
			}
			toast.error(getErrorMessage(error, "Failed to create list"));
			return undefined;
		} finally {
			setIsPending(false);
		}
	};

	return { createList, isPending };
}
