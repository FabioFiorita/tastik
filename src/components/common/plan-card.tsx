import { Check } from "lucide-react";
import type { ReactNode } from "react";
import type { Plan } from "@/lib/constants/plans";
import { cn } from "@/lib/utils/cn";

type PlanCardProps = {
	plan: Plan;
	renderAction: (plan: Plan) => ReactNode;
};

export function PlanCard({ plan, renderAction }: PlanCardProps) {
	return (
		<div
			className={cn(
				"relative flex flex-col rounded-2xl border bg-card p-6 transition-all duration-200 hover:shadow-lg",
				plan.popular ? "border-primary shadow-md" : "border-border",
			)}
		>
			{plan.popular && (
				<div className="absolute -top-3 left-1/2 -translate-x-1/2">
					<span className="rounded-full bg-primary px-4 py-1 font-semibold text-primary-foreground text-xs">
						Best Value
					</span>
				</div>
			)}

			<div className="mb-4 flex items-center justify-between">
				<h3 className="font-semibold text-foreground text-lg">{plan.name}</h3>
				{plan.badge ? (
					<span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary text-xs">
						{plan.badge}
					</span>
				) : null}
			</div>

			<div className="mb-4 flex items-baseline gap-1">
				<span className="font-bold text-4xl text-foreground">{plan.price}</span>
				<span className="text-muted-foreground">/{plan.period}</span>
			</div>

			<div className="mb-6 flex items-center gap-2 text-muted-foreground text-sm">
				<Check className="size-4 text-primary" />
				<span>{plan.trial} free trial</span>
			</div>

			{renderAction(plan)}
		</div>
	);
}
