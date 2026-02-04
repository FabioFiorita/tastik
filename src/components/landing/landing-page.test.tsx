import { describe, expect, it, vi } from "vitest";
import { renderWithUser, screen } from "@/test-utils";
import { LandingPage } from "./landing-page";

vi.mock("@tanstack/react-router", () => ({
	Link: ({ to, children, className, ...props }: any) => (
		<a href={to} className={className} {...props}>
			{children}
		</a>
	),
}));

describe("landing-page", () => {
	it("renders hero section", () => {
		renderWithUser(<LandingPage />);
		expect(screen.getByTestId("hero-heading")).toHaveTextContent(
			"Lists without deadlines",
		);
	});

	it("renders features section", () => {
		renderWithUser(<LandingPage />);
		expect(screen.getByTestId("features-section-heading")).toHaveTextContent(
			"Built for everyday lists",
		);
	});

	it("renders use cases section", () => {
		renderWithUser(<LandingPage />);
		expect(screen.getByTestId("use-cases-section-heading")).toHaveTextContent(
			"Made for real life",
		);
	});

	it("renders pricing section", () => {
		renderWithUser(<LandingPage />);
		expect(screen.getByTestId("pricing-section-heading")).toHaveTextContent(
			"Simple, transparent pricing",
		);
	});

	it("renders CTA section", () => {
		renderWithUser(<LandingPage />);
		expect(screen.getByTestId("cta-heading")).toHaveTextContent(
			"Ready to simplify your lists?",
		);
	});
});
