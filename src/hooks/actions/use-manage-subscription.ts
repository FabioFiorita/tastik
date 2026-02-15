import { useAction } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

export function useManageSubscription() {
	const createBillingPortalSession = useAction(
		api.stripe.createBillingPortalSession,
	);
	const [isPending, setIsPending] = useState(false);

	const openBillingPortal = async () => {
		setIsPending(true);
		try {
			const url = await createBillingPortalSession({
				returnUrl: window.location.href,
			});
			window.location.href = url;
		} catch {
			toast.error("Failed to open billing portal. Please try again.");
		} finally {
			setIsPending(false);
		}
	};

	return { openBillingPortal, isPending };
}
