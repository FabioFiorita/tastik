import { describe, expect, it, vi } from "vitest";
import { renderWithUser, screen } from "@/test-utils";
import { SubscriptionPage } from "./subscription-page";

vi.mock("convex/react", () => ({
	useAction: () => vi.fn(),
}));

vi.mock("@/lib/env", () => ({
	env: {
		VITE_STRIPE_MONTHLY_PRICE_ID: "price_monthly_test",
		VITE_STRIPE_YEARLY_PRICE_ID: "price_yearly_test",
	},
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

	it("renders plan cards with checkout buttons", () => {
		renderWithUser(<SubscriptionPage />);
		expect(screen.getByTestId("checkout-monthly")).toBeInTheDocument();
		expect(screen.getByTestId("checkout-yearly")).toBeInTheDocument();
	});

	it("renders pricing table container", () => {
		renderWithUser(<SubscriptionPage />);
		expect(
			screen.getByTestId("subscription-pricing-table"),
		).toBeInTheDocument();
	});
});
