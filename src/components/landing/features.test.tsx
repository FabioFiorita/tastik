import { describe, expect, it } from "vitest";
import { LANDING_FEATURES } from "@/lib/constants/landing";
import { renderWithUser, screen } from "@/test-utils";
import { Features } from "./features";

describe("features", () => {
	it("renders section heading", () => {
		renderWithUser(<Features />);
		expect(screen.getByTestId("features-section-heading")).toHaveTextContent(
			"Built for everyday lists",
		);
	});

	it("renders section subtitle", () => {
		renderWithUser(<Features />);
		expect(screen.getByTestId("features-section-heading")).toHaveTextContent(
			/Start free with simple lists. Upgrade to Pro for advanced features/i,
		);
	});

	it("renders all features from constant", () => {
		renderWithUser(<Features />);
		LANDING_FEATURES.forEach((feature) => {
			const testId = `feature-${feature.title.toLowerCase().replace(/\s+/g, "-")}`;
			const el = screen.getByTestId(testId);
			expect(el).toHaveTextContent(feature.title);
			expect(el).toHaveTextContent(feature.description);
		});
	});

	it("renders correct number of feature cards", () => {
		const { container } = renderWithUser(<Features />);
		const featureCards = container.querySelectorAll(".group.rounded-2xl");
		expect(featureCards.length).toBe(LANDING_FEATURES.length);
	});
});
