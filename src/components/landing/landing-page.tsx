import { CTA } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { Pricing } from "@/components/landing/pricing";
import { UseCases } from "@/components/landing/use-cases";

export function LandingPage() {
	return (
		<div>
			<Hero />
			<Features />
			<UseCases />
			<Pricing />
			<CTA />
		</div>
	);
}
