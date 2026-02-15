import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { useHandleMutationError } from "@/hooks/use-handle-mutation-error";
import { trackListCreated } from "@/lib/metrics";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

type CreateListParams = {
	name: string;
	type?: "simple" | "stepper" | "calculator" | "kanban" | "multi";
	icon?: string;
};

export function useCreateList() {
	const navigate = useNavigate();
	const mutation = useMutation(api.lists.createList);
	const handleMutationError = useHandleMutationError();
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
			trackListCreated(params.type ?? "simple", "success");
			toast.success("List created");
			if (listId != null) {
				navigate({ to: "/lists/$listId", params: { listId } });
			}
			return listId;
		} catch (error) {
			trackListCreated(params.type ?? "simple", "failure");
			handleMutationError(error, "Failed to create list");
			return undefined;
		} finally {
			setIsPending(false);
		}
	};

	return { createList, isPending };
}
