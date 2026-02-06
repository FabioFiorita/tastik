import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

export function useListsActions() {
	const navigate = useNavigate();
	const createList = useMutation(api.lists.createList);
	const [isCreating, setIsCreating] = useState(false);

	const handleCreateList = async () => {
		setIsCreating(true);
		try {
			const listId = await createList({
				name: "New List",
				icon: "default",
			});
			toast.success("List created");
			navigate({ to: `/lists/${listId}` });
		} catch (error) {
			toast.error("Failed to create list");
			console.error(error);
		} finally {
			setIsCreating(false);
		}
	};

	return {
		handleCreateList,
		isCreating,
	};
}
