import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { trackItemStatusUpdated } from "@/lib/metrics";
import type { ItemStatus } from "@/lib/types/item-status";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function useUpdateItemStatus() {
	const mutation = useMutation(api.items.updateItemStatus);
	const [isPending, setIsPending] = useState(false);

	const updateStatus = async (args: {
		itemId: Id<"items">;
		status: ItemStatus;
	}) => {
		setIsPending(true);
		try {
			await mutation(args);
			trackItemStatusUpdated("success");
		} catch {
			trackItemStatusUpdated("failure");
			toast.error("Failed to update status");
		} finally {
			setIsPending(false);
		}
	};

	return { updateStatus, isPending };
}
