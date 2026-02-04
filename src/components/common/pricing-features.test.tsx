import { describe, expect, it } from "vitest";
import { PRICING_FEATURES } from "@/lib/constants/plans";
import { renderWithUser, screen } from "@/test-utils";
import { PricingFeatures } from "./pricing-features";

describe("pricing-features", () => {
	it("renders all pricing features from constant", () => {
		renderWithUser(<PricingFeatures />);
		PRICING_FEATURES.forEach((feature) => {
			expect(screen.getByText(feature.title)).toBeInTheDocument();
			expect(screen.getByText(feature.description)).toBeInTheDocument();
		});
	});

	it("renders correct number of features", () => {
		const { container } = renderWithUser(<PricingFeatures />);
		const features = container.querySelectorAll(".flex.items-start.gap-3");
		expect(features).toHaveLength(PRICING_FEATURES.length);
	});
});
