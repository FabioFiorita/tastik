import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { useHandleMutationError } from "@/hooks/use-handle-mutation-error";
import { trackListCreated } from "@/lib/metrics";
import type { ListType } from "@/lib/types/list-type";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useManagedAction } from "./use-managed-action";

type CreateListParams = {
	name: string;
	type?: ListType;
	icon?: string;
};

export function useCreateList() {
	const navigate = useNavigate();
	const mutation = useMutation(api.lists.createList);
	const handleMutationError = useHandleMutationError();
	const { runAction, isPending } = useManagedAction();

	const createList = async (
		params: CreateListParams,
	): Promise<Id<"lists"> | undefined> => {
		return await runAction(
			() =>
				mutation({
					name: params.name.trim(),
					type: params.type,
					icon: params.icon,
				}),
			{
				onSuccess: (listId) => {
					trackListCreated(params.type ?? "simple", "success");
					toast.success("List created");
					if (listId != null) {
						navigate({ to: "/lists/$listId", params: { listId } });
					}
				},
				onError: (error) => {
					trackListCreated(params.type ?? "simple", "failure");
					handleMutationError(error, "Failed to create list");
				},
			},
		);
	};

	return { createList, isPending };
}
