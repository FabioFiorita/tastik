import { PlanCards } from "@/components/common/plan-cards";
import { PricingFeatures } from "@/components/common/pricing-features";
import { Button } from "@/components/ui/button";
import { useStripeCheckout } from "@/hooks/actions/use-stripe-checkout";
import { env } from "@/lib/env";

const PRICE_IDS: Record<string, string> = {
	Monthly: env.VITE_STRIPE_MONTHLY_PRICE_ID,
	Yearly: env.VITE_STRIPE_YEARLY_PRICE_ID,
};

export function SubscriptionPage() {
	const { checkout, isPending } = useStripeCheckout();

	return (
		<section className="relative overflow-hidden bg-background">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.18),transparent_55%)]" />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,hsl(var(--primary)/0.12),transparent_50%)]" />
			<div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,hsl(var(--background))_65%)]" />

			<div className="container relative mx-auto px-4 py-16 md:px-6 lg:px-8">
				<div className="mx-auto max-w-3xl text-center">
					<h1
						className="mb-4 font-bold text-3xl text-foreground tracking-tight md:text-5xl"
						data-testid="subscription-page-heading"
					>
						Unlock every list, everywhere.
					</h1>
					<p
						className="text-lg text-muted-foreground"
						data-testid="subscription-page-subheading"
					>
						Your lists are ready. Choose a plan to sync across devices, share
						with others, and keep everything organized without deadlines.
					</p>
				</div>

				<div
					className="mx-auto mt-12 max-w-4xl"
					data-testid="subscription-pricing-features"
				>
					<PricingFeatures />
				</div>

				<div
					className="mx-auto mt-12 max-w-2xl"
					data-testid="subscription-pricing-table"
				>
					<PlanCards
						renderAction={(plan) => (
							<Button
								variant={plan.popular ? "default" : "outline"}
								size="lg"
								className="w-full"
								disabled={isPending}
								onClick={() => {
									const priceId = PRICE_IDS[plan.name];
									if (priceId) {
										checkout(priceId);
									}
								}}
								data-testid={`checkout-${plan.name.toLowerCase()}`}
							>
								{isPending ? "Redirecting..." : plan.cta}
							</Button>
						)}
					/>
				</div>
			</div>
		</section>
	);
}
