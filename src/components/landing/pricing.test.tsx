import { describe, expect, it, vi } from "vitest";
import { mockReactRouterLink } from "@/lib/helpers/mocks";

vi.mock("@/lib/metrics", () => ({
	trackCtaClicked: vi.fn(),
}));

import { renderWithUser, screen } from "@/test-utils";
import { Pricing } from "./pricing";

mockReactRouterLink();

describe("pricing", () => {
	it("renders section heading", () => {
		renderWithUser(<Pricing />);
		expect(screen.getByTestId("pricing-section-heading")).toHaveTextContent(
			"Simple, transparent pricing",
		);
	});

	it("renders section subtitle", () => {
		renderWithUser(<Pricing />);
		expect(screen.getByTestId("pricing-section-heading")).toHaveTextContent(
			/All features included. Choose monthly flexibility or save with yearly/i,
		);
	});

	it("renders PricingFeatures component", () => {
		renderWithUser(<Pricing />);
		expect(screen.getByTestId("pricing-features")).toHaveTextContent(
			"5 list types",
		);
	});

	it("renders PlanCards component", () => {
		renderWithUser(<Pricing />);
		expect(screen.getByTestId("plan-card-monthly")).toBeInTheDocument();
		expect(screen.getByTestId("plan-card-yearly")).toBeInTheDocument();
	});

	it("renders PricingFooter component", () => {
		renderWithUser(<Pricing />);
		expect(screen.getByTestId("pricing-footer")).toHaveTextContent(
			"Cancel anytime. No questions asked.",
		);
	});

	it("plan action buttons link to sign-in", () => {
		renderWithUser(<Pricing />);
		const monthlyAction = screen
			.getByTestId("plan-card-monthly")
			.querySelector('[data-testid="plan-card-action"]');
		const yearlyAction = screen
			.getByTestId("plan-card-yearly")
			.querySelector('[data-testid="plan-card-action"]');
		expect(
			monthlyAction?.querySelector('a[href="/sign-in"]'),
		).toBeInTheDocument();
		expect(
			yearlyAction?.querySelector('a[href="/sign-in"]'),
		).toBeInTheDocument();
	});
});
