import { describe, expect, it } from "vitest";
import { PLANS } from "@/lib/constants/plans";
import { renderWithUser, screen } from "@/test-utils";
import { PlanCards } from "./plan-cards";

describe("plan-cards", () => {
	it("renders all plans from constant", () => {
		renderWithUser(<PlanCards renderAction={() => <div />} />);
		PLANS.forEach((plan) => {
			expect(screen.getByText(plan.name)).toBeInTheDocument();
			expect(screen.getByText(plan.price)).toBeInTheDocument();
		});
	});

	it("renders correct number of plan cards", () => {
		renderWithUser(<PlanCards renderAction={() => <div />} />);
		PLANS.forEach((plan) => {
			expect(
				screen.getByTestId(`plan-card-${plan.name.toLowerCase()}`),
			).toBeInTheDocument();
		});
	});

	it("passes renderAction to each PlanCard", () => {
		renderWithUser(
			<PlanCards
				renderAction={(plan) => (
					<button type="button">Action for {plan.name}</button>
				)}
			/>,
		);
		PLANS.forEach((plan) => {
			expect(screen.getByText(`Action for ${plan.name}`)).toBeInTheDocument();
		});
	});
});
