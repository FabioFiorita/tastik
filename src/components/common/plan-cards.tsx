import type { ReactNode } from "react";
import { PlanCard } from "@/components/common/plan-card";
import type { Plan } from "@/lib/constants/plans";
import { PLANS } from "@/lib/constants/plans";

type PlanCardsProps = {
	renderAction: (plan: Plan) => ReactNode;
};

export function PlanCards({ renderAction }: PlanCardsProps) {
	return (
		<div className="grid gap-4 sm:grid-cols-2">
			{PLANS.map((plan) => (
				<PlanCard key={plan.name} plan={plan} renderAction={renderAction} />
			))}
		</div>
	);
}
