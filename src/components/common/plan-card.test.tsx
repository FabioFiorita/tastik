import { describe, expect, it } from "vitest";
import { mockPlanMonthly, mockPlanYearly } from "@/__tests__/helpers/fixtures";
import { renderWithUser, screen } from "@/test-utils";
import { PlanCard } from "./plan-card";

describe("plan-card", () => {
	it("renders plan name, price, and period", () => {
		renderWithUser(
			<PlanCard plan={mockPlanMonthly} renderAction={() => <div />} />,
		);
		expect(screen.getByTestId("plan-card-name")).toHaveTextContent("Monthly");
		expect(screen.getByTestId("plan-card-price-period")).toHaveTextContent(
			"$1.99",
		);
		expect(screen.getByTestId("plan-card-price-period")).toHaveTextContent(
			"/month",
		);
	});

	it("renders free trial information", () => {
		renderWithUser(
			<PlanCard plan={mockPlanMonthly} renderAction={() => <div />} />,
		);
		expect(screen.getByTestId("plan-card-trial")).toHaveTextContent(
			"7-day free trial",
		);
	});

	it("renders popular badge when plan is popular", () => {
		renderWithUser(
			<PlanCard plan={mockPlanYearly} renderAction={() => <div />} />,
		);
		const popularBadge = screen.getByTestId("plan-card-popular-badge");
		expect(popularBadge).toBeInTheDocument();
		expect(popularBadge).toHaveTextContent("Best Value");
	});

	it("does not render popular badge when plan is not popular", () => {
		renderWithUser(
			<PlanCard plan={mockPlanMonthly} renderAction={() => <div />} />,
		);
		expect(
			screen.queryByTestId("plan-card-popular-badge"),
		).not.toBeInTheDocument();
	});

	it("renders plan badge when provided", () => {
		renderWithUser(
			<PlanCard plan={mockPlanYearly} renderAction={() => <div />} />,
		);
		const badge = screen.getByTestId("plan-card-badge");
		expect(badge).toBeInTheDocument();
		expect(badge).toHaveTextContent("Save 16%");
	});

	it("does not render plan badge when not provided", () => {
		renderWithUser(
			<PlanCard plan={mockPlanMonthly} renderAction={() => <div />} />,
		);
		expect(screen.queryByTestId("plan-card-badge")).not.toBeInTheDocument();
	});

	it("renders custom action via renderAction prop", () => {
		renderWithUser(
			<PlanCard
				plan={mockPlanMonthly}
				renderAction={() => <button type="button">Custom Action</button>}
			/>,
		);
		expect(screen.getByTestId("plan-card-action")).toHaveTextContent(
			"Custom Action",
		);
	});

	it("applies popular border styling when plan is popular", () => {
		renderWithUser(
			<PlanCard plan={mockPlanYearly} renderAction={() => <div />} />,
		);
		const card = screen.getByTestId("plan-card-yearly");
		expect(card).toHaveClass("border-primary");
	});

	it("applies default border styling when plan is not popular", () => {
		renderWithUser(
			<PlanCard plan={mockPlanMonthly} renderAction={() => <div />} />,
		);
		const card = screen.getByTestId("plan-card-monthly");
		expect(card).toHaveClass("border-border");
	});
});
