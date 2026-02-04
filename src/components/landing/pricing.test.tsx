import { describe, expect, it, vi } from "vitest";
import { renderWithUser, screen } from "@/test-utils";
import { Pricing } from "./pricing";

vi.mock("@tanstack/react-router", () => ({
	Link: ({ to, children, className, ...props }: any) => (
		<a href={to} className={className} {...props}>
			{children}
		</a>
	),
}));

describe("pricing", () => {
	it("renders section heading", () => {
		renderWithUser(<Pricing />);
		expect(screen.getByText("Simple, transparent pricing")).toBeInTheDocument();
	});

	it("renders section subtitle", () => {
		renderWithUser(<Pricing />);
		expect(
			screen.getByText(
				/All features included. Choose monthly flexibility or save with yearly/i,
			),
		).toBeInTheDocument();
	});

	it("renders PricingFeatures component", () => {
		renderWithUser(<Pricing />);
		// Check for a known pricing feature
		expect(screen.getByText("5 list types")).toBeInTheDocument();
	});

	it("renders PlanCards component", () => {
		renderWithUser(<Pricing />);
		expect(screen.getByTestId("plan-card-monthly")).toBeInTheDocument();
		expect(screen.getByTestId("plan-card-yearly")).toBeInTheDocument();
	});

	it("renders PricingFooter component", () => {
		renderWithUser(<Pricing />);
		expect(
			screen.getByText("Cancel anytime. No questions asked."),
		).toBeInTheDocument();
	});

	it("plan action buttons link to sign-in", () => {
		renderWithUser(<Pricing />);
		const ctaButtons = screen.getAllByText(/Start.*Trial/i);
		ctaButtons.forEach((button) => {
			expect(button).toHaveAttribute("href", "/sign-in");
		});
	});
});
