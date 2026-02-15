import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarFooter } from "@/components/ui/sidebar";
import { useManageSubscription } from "@/hooks/actions/use-manage-subscription";
import { useSubscriptionQuery } from "@/hooks/queries/use-subscription";

function getTrialDaysRemaining(currentPeriodEnd?: number): number {
	if (!currentPeriodEnd) return 0;
	const now = Date.now();
	const msRemaining = currentPeriodEnd - now;
	return Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
}

export function SidebarTrialCard() {
	const subscription = useSubscriptionQuery();
	const { openBillingPortal, isPending } = useManageSubscription();

	if (!subscription.isTrialing) return null;

	const daysRemaining = getTrialDaysRemaining(subscription.currentPeriodEnd);

	return (
		<SidebarFooter>
			<div
				className="rounded-lg border bg-card p-4"
				data-testid="sidebar-trial-card"
			>
				<div className="mb-2 flex items-center gap-2">
					<Sparkles className="size-4 text-primary" />
					<span className="font-medium text-sm">Free Trial</span>
				</div>
				<p
					className="mb-3 text-muted-foreground text-xs"
					data-testid="trial-days-remaining"
				>
					{daysRemaining === 0
						? "Your trial ends today"
						: `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`}
				</p>
				<Button
					size="sm"
					className="w-full"
					onClick={openBillingPortal}
					disabled={isPending}
					data-testid="trial-subscribe-button"
				>
					Subscribe Now
				</Button>
			</div>
		</SidebarFooter>
	);
}
