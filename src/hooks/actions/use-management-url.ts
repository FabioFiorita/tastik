import { useAction } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

export function useManagementUrl() {
	const getManagementUrl = useAction(api.subscriptions.getManagementUrl);
	const [isLoadingManagement, setIsLoadingManagement] = useState(false);

	const openManagementUrl = async () => {
		setIsLoadingManagement(true);
		try {
			const url = await getManagementUrl();
			if (url) {
				window.open(url, "_blank");
			} else {
				toast.info("No active subscription to manage");
			}
		} catch {
			toast.error("Failed to load subscription management");
		} finally {
			setIsLoadingManagement(false);
		}
	};

	return { openManagementUrl, isLoadingManagement };
}
