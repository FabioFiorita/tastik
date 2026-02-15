import { Sparkles } from "lucide-react";
import { PlanCards } from "@/components/common/plan-cards";
import { PricingFeatures } from "@/components/common/pricing-features";
import { Button } from "@/components/ui/button";
import { useStripeCheckout } from "@/hooks/actions/use-stripe-checkout";

export function SubscriptionPage() {
	const { checkout, isPending } = useStripeCheckout();

	return (
		<div className="mx-auto max-w-3xl py-8">
			<div className="mb-10 text-center">
				<div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
					<Sparkles className="size-4 text-primary" />
					<span className="font-medium text-primary text-sm">
						Choose your plan
					</span>
				</div>
				<h1
					className="mb-3 font-bold text-3xl text-foreground tracking-tight"
					data-testid="subscription-page-heading"
				>
					Unlock all features
				</h1>
				<p
					className="text-muted-foreground"
					data-testid="subscription-page-subheading"
				>
					Start your free trial today. Cancel anytime.
				</p>
			</div>

			<div className="mb-10" data-testid="subscription-pricing-features">
				<PricingFeatures />
			</div>

			<div className="mb-8" data-testid="subscription-pricing-table">
				<PlanCards
					renderAction={(plan) => (
						<Button
							variant={plan.popular ? "default" : "outline"}
							size="lg"
							className="w-full"
							disabled={isPending}
							onClick={() => {
								if (plan.name === "Monthly" || plan.name === "Yearly") {
									checkout(plan.name);
								}
							}}
							data-testid={`checkout-${plan.name.toLowerCase()}`}
						>
							{isPending ? "Redirecting..." : plan.cta}
						</Button>
					)}
				/>
			</div>

			<p className="text-center text-muted-foreground text-sm">
				Cancel anytime. No questions asked.
			</p>
		</div>
	);
}
