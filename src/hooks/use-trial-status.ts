import { useMemo } from "react";
import { useSubscription } from "@/contexts/subscription";

export function useTrialStatus() {
	const { status, currentPeriodEnd } = useSubscription();
	return useMemo(() => {
		const isTrialing = status === "trialing";
		const trialEnd = currentPeriodEnd ? new Date(currentPeriodEnd) : null;
		const trialDaysLeft = trialEnd
			? Math.max(
					0,
					Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
				)
			: null;
		const trialLabel =
			trialDaysLeft === null
				? null
				: `${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left`;
		return { isTrialing, trialEnd, trialDaysLeft, trialLabel };
	}, [status, currentPeriodEnd]);
}
