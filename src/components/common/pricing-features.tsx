import { PRICING_FEATURES } from "@/lib/constants/plans";

export function PricingFeatures() {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{PRICING_FEATURES.map((feature) => {
				const Icon = feature.icon;
				return (
					<div
						key={feature.title}
						className="flex items-start gap-3 rounded-lg border bg-card/50 p-4"
					>
						<div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
							<Icon className="size-4 text-primary" />
						</div>
						<div>
							<p className="font-medium text-sm">{feature.title}</p>
							<p className="text-muted-foreground text-xs">
								{feature.description}
							</p>
						</div>
					</div>
				);
			})}
		</div>
	);
}
