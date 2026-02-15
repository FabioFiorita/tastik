import { useAction } from "convex/react";
import { useState } from "react";
import { useHandleMutationError } from "@/hooks/use-handle-mutation-error";
import { api } from "../../../convex/_generated/api";

export function useManageSubscription() {
	const createBillingPortalSession = useAction(
		api.stripe.createBillingPortalSession,
	);
	const handleMutationError = useHandleMutationError();
	const [isPending, setIsPending] = useState(false);

	const openBillingPortal = async () => {
		setIsPending(true);
		try {
			const url = await createBillingPortalSession({
				returnUrl: window.location.href,
			});
			window.location.href = url;
		} catch (error) {
			handleMutationError(
				error,
				"Failed to open billing portal. Please try again.",
			);
		} finally {
			setIsPending(false);
		}
	};

	return { openBillingPortal, isPending };
}
