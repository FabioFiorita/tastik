import type { Plan } from "@/lib/constants/plans";

export function getPackageId(plan: Plan): "monthly" | "yearly" {
	return plan.name === "Monthly" ? "monthly" : "yearly";
}
