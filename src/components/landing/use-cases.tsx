import { LandingSection } from "@/components/landing/landing-section";
import { LANDING_USE_CASES } from "@/lib/constants/landing";

export function UseCases() {
	return (
		<LandingSection
			id="use-cases"
			backgroundClass="bg-card/50"
			title="Made for real life"
			subtitle="From groceries to projects, Tastik adapts to how you actually use lists."
		>
			<div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
				{LANDING_USE_CASES.map((useCase) => (
					<div
						key={useCase.title}
						className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-lg"
						data-testid={`use-case-${useCase.title.toLowerCase().replace(/\s+/g, "-")}`}
					>
						<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-foreground shadow-md">
							<useCase.icon className="h-7 w-7" />
						</div>
						<span className="mb-2 font-medium text-primary text-xs uppercase tracking-wider">
							{useCase.listType}
						</span>
						<h3 className="mb-2 font-semibold text-foreground text-xl">
							{useCase.title}
						</h3>
						<p className="text-muted-foreground">{useCase.description}</p>
					</div>
				))}
			</div>
		</LandingSection>
	);
}
