import { describe, expect, it, vi } from "vitest";
import { renderWithUser, screen } from "@/test-utils";
import { SubscriptionPage } from "./subscription-page";

vi.mock("@clerk/tanstack-react-start", () => ({
	PricingTable: (props: Record<string, unknown>) => (
		<div
			data-testid="clerk-pricing-table"
			data-redirect={props.newSubscriptionRedirectUrl}
		>
			Clerk PricingTable
		</div>
	),
}));

vi.mock("@clerk/themes", () => ({
	shadcn: {},
}));

describe("subscription-page", () => {
	it("renders heading and subheading", () => {
		renderWithUser(<SubscriptionPage />);
		expect(screen.getByTestId("subscription-page-heading")).toHaveTextContent(
			"Unlock every list, everywhere.",
		);
		expect(
			screen.getByTestId("subscription-page-subheading"),
		).toHaveTextContent(
			/Your lists are ready. Choose a plan to sync across devices/i,
		);
	});

	it("renders Clerk PricingTable", () => {
		renderWithUser(<SubscriptionPage />);
		expect(screen.getByTestId("clerk-pricing-table")).toBeInTheDocument();
		expect(screen.getByTestId("clerk-pricing-table")).toHaveTextContent(
			"Clerk PricingTable",
		);
	});

	it("sets redirect URL on PricingTable", () => {
		renderWithUser(<SubscriptionPage />);
		expect(screen.getByTestId("clerk-pricing-table")).toHaveAttribute(
			"data-redirect",
			"/",
		);
	});

	it("renders pricing table container", () => {
		renderWithUser(<SubscriptionPage />);
		expect(
			screen.getByTestId("subscription-pricing-table"),
		).toBeInTheDocument();
	});
});
