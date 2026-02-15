import { useAction } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

export function useStripeCheckout() {
	const createCheckoutSession = useAction(api.stripe.createCheckoutSession);
	const [isPending, setIsPending] = useState(false);

	const checkout = async (priceId: string) => {
		setIsPending(true);
		try {
			const url = await createCheckoutSession({
				priceId,
				successUrl: `${window.location.origin}/`,
				cancelUrl: `${window.location.origin}/subscription`,
			});
			window.location.href = url;
		} catch {
			toast.error("Failed to start checkout. Please try again.");
		} finally {
			setIsPending(false);
		}
	};

	return { checkout, isPending };
}
