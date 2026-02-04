import { describe, expect, it } from "vitest";
import { LANDING_FEATURES } from "@/lib/constants/landing";
import { renderWithUser, screen } from "@/test-utils";
import { Features } from "./features";

describe("features", () => {
	it("renders section heading", () => {
		renderWithUser(<Features />);
		expect(screen.getByText("Built for everyday lists")).toBeInTheDocument();
	});

	it("renders section subtitle", () => {
		renderWithUser(<Features />);
		expect(
			screen.getByText(
				/Powerful features that stay out of your way. Focus on what matters/i,
			),
		).toBeInTheDocument();
	});

	it("renders all features from constant", () => {
		renderWithUser(<Features />);
		LANDING_FEATURES.forEach((feature) => {
			expect(screen.getByText(feature.title)).toBeInTheDocument();
			expect(screen.getByText(feature.description)).toBeInTheDocument();
		});
	});

	it("renders correct number of feature cards", () => {
		const { container } = renderWithUser(<Features />);
		const featureCards = container.querySelectorAll(".group.rounded-2xl");
		expect(featureCards.length).toBe(LANDING_FEATURES.length);
	});
});
