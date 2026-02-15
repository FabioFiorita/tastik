import { useAction } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

export function useManageSubscription() {
	const createBillingPortalSession = useAction(
		api.stripe.createBillingPortalSession,
	);

	const openBillingPortal = async () => {
		try {
			const url = await createBillingPortalSession({
				returnUrl: window.location.href,
			});
			window.location.href = url;
		} catch {
			toast.error("Failed to open billing portal. Please try again.");
		}
	};

	return { openBillingPortal };
}
