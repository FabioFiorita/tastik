import { describe, expect, it } from "vitest";
import { renderWithUser, screen } from "@/test-utils";
import { PricingFooter } from "./pricing-footer";

describe("pricing-footer", () => {
	it("renders cancellation message", () => {
		renderWithUser(<PricingFooter />);
		expect(screen.getByTestId("pricing-footer")).toHaveTextContent(
			"Cancel anytime. No questions asked.",
		);
	});

	it("renders as paragraph element", () => {
		renderWithUser(<PricingFooter />);
		const paragraph = screen.getByTestId("pricing-footer");
		expect(paragraph.tagName).toBe("P");
		expect(paragraph).toHaveTextContent("Cancel anytime. No questions asked.");
	});
});
