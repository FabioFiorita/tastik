import { describe, expect, it } from "vitest";
import { PLANS } from "@/lib/constants/plans";
import { getPackageId } from "./get-package-id";

describe("get-package-id", () => {
	it("returns 'monthly' for Monthly plan", () => {
		const monthlyPlan = PLANS.find((plan) => plan.name === "Monthly");
		if (!monthlyPlan) throw new Error("Monthly plan not found");
		const result = getPackageId(monthlyPlan);
		expect(result).toBe("monthly");
	});

	it("returns 'yearly' for Yearly plan", () => {
		const yearlyPlan = PLANS.find((plan) => plan.name === "Yearly");
		if (!yearlyPlan) throw new Error("Yearly plan not found");
		const result = getPackageId(yearlyPlan);
		expect(result).toBe("yearly");
	});
});
