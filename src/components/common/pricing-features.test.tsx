import { describe, expect, it } from "vitest";
import { PRICING_FEATURES } from "@/lib/constants/plans";
import { renderWithUser, screen } from "@/test-utils";
import { PricingFeatures } from "./pricing-features";

describe("pricing-features", () => {
	it("renders all pricing features from constant", () => {
		renderWithUser(<PricingFeatures />);
		PRICING_FEATURES.forEach((feature) => {
			const testId = `pricing-feature-${feature.title.toLowerCase().replace(/\s+/g, "-")}`;
			const el = screen.getByTestId(testId);
			expect(el).toHaveTextContent(feature.title);
			expect(el).toHaveTextContent(feature.description);
		});
	});

	it("renders correct number of features", () => {
		const { container } = renderWithUser(<PricingFeatures />);
		const features = container.querySelectorAll(".flex.items-start.gap-3");
		expect(features).toHaveLength(PRICING_FEATURES.length);
	});
});
