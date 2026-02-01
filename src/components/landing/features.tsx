import { LandingSection } from "@/components/landing/landing-section";
import { LANDING_FEATURES } from "@/lib/constants/landing";

export function Features() {
	return (
		<LandingSection
			id="features"
			backgroundClass="bg-background"
			title="Built for everyday lists"
			subtitle="Powerful features that stay out of your way. Focus on what matters, not on managing your app."
		>
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				{LANDING_FEATURES.map((feature) => (
					<div
						key={feature.title}
						className="group rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-lg"
					>
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
							<feature.icon className="h-6 w-6" />
						</div>
						<h3 className="mb-2 font-semibold text-foreground text-lg">
							{feature.title}
						</h3>
						<p className="text-muted-foreground text-sm">
							{feature.description}
						</p>
					</div>
				))}
			</div>
		</LandingSection>
	);
}
