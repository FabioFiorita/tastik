import { describe, expect, it } from "vitest";
import { renderWithUser, screen } from "@/test-utils";
import { PricingFooter } from "./pricing-footer";

describe("pricing-footer", () => {
	it("renders cancellation message", () => {
		renderWithUser(<PricingFooter />);
		expect(
			screen.getByText("Cancel anytime. No questions asked."),
		).toBeInTheDocument();
	});

	it("renders as paragraph element", () => {
		const { container } = renderWithUser(<PricingFooter />);
		const paragraph = container.querySelector("p");
		expect(paragraph).toBeInTheDocument();
		expect(paragraph?.textContent).toBe("Cancel anytime. No questions asked.");
	});
});
