import { useMemo } from "react";
import { useSubscriptionQuery } from "@/hooks/queries/use-subscription";

export function useTrialStatus() {
	const { isTrialing, currentPeriodEnd } = useSubscriptionQuery();
	return useMemo(() => {
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
	}, [isTrialing, currentPeriodEnd]);
}
