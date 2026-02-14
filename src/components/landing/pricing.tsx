import { Link } from "@tanstack/react-router";
import { PlanCards } from "@/components/common/plan-cards";
import { PricingFeatures } from "@/components/common/pricing-features";
import { PricingFooter } from "@/components/common/pricing-footer";
import { LandingSection } from "@/components/landing/landing-section";
import { buttonVariants } from "@/components/ui/button";
import { trackCtaClicked } from "@/lib/metrics";
import { cn } from "@/lib/utils/cn";

export function Pricing() {
	return (
		<LandingSection
			id="pricing"
			backgroundClass="bg-card/50"
			title="Simple, transparent pricing"
			subtitle="All features included. Choose monthly flexibility or save with yearly."
			headingClassName="mb-12"
		>
			<div className="mx-auto mb-12 max-w-4xl" data-testid="pricing-features">
				<PricingFeatures />
			</div>

			<div className="mx-auto max-w-2xl">
				<PlanCards
					renderAction={(plan) => (
						<Link
							to="/sign-in"
							className={cn(
								buttonVariants({
									variant: plan.popular ? "default" : "outline",
									size: "lg",
								}),
								"w-full",
							)}
							onClick={() => trackCtaClicked("subscribe")}
						>
							{plan.cta}
						</Link>
					)}
				/>
			</div>

			<PricingFooter />
		</LandingSection>
	);
}
