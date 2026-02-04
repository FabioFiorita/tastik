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
		expect(screen.getByText("Lists without deadlines")).toBeInTheDocument();
	});

	it("renders features section", () => {
		renderWithUser(<LandingPage />);
		expect(screen.getByText("Built for everyday lists")).toBeInTheDocument();
	});

	it("renders use cases section", () => {
		renderWithUser(<LandingPage />);
		expect(screen.getByText("Made for real life")).toBeInTheDocument();
	});

	it("renders pricing section", () => {
		renderWithUser(<LandingPage />);
		expect(screen.getByText("Simple, transparent pricing")).toBeInTheDocument();
	});

	it("renders CTA section", () => {
		renderWithUser(<LandingPage />);
		expect(
			screen.getByText("Ready to simplify your lists?"),
		).toBeInTheDocument();
	});
});
