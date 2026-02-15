import { useAction } from "convex/react";
import { useState } from "react";
import { useHandleMutationError } from "@/hooks/use-handle-mutation-error";
import { api } from "../../../convex/_generated/api";

export function useStripeCheckout() {
	const createCheckoutSession = useAction(api.stripe.createCheckoutSession);
	const handleMutationError = useHandleMutationError();
	const [isPending, setIsPending] = useState(false);

	const checkout = async (plan: "Monthly" | "Yearly") => {
		setIsPending(true);
		try {
			const url = await createCheckoutSession({
				plan,
				successUrl: `${window.location.origin}/`,
				cancelUrl: `${window.location.origin}/subscription`,
			});
			window.location.href = url;
		} catch (error) {
			handleMutationError(error, "Failed to start checkout. Please try again.");
		} finally {
			setIsPending(false);
		}
	};

	return { checkout, isPending };
}
