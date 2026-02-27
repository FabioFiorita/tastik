import { CTA } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { UseCases } from "@/components/landing/use-cases";

export function LandingPage() {
	return (
		<div>
			<Hero />
			<Features />
			<UseCases />
			<CTA />
		</div>
	);
}
