import { describe, expect, it, vi } from "vitest";
import { mockReactRouterLink } from "@/lib/helpers/mocks";

vi.mock("@/lib/metrics", () => ({
	trackCtaClicked: vi.fn(),
}));

import { renderWithUser, screen } from "@/test-utils";
import { CTA } from "./cta";

mockReactRouterLink();

describe("cta", () => {
	it("renders main heading", () => {
		renderWithUser(<CTA />);
		expect(screen.getByTestId("cta-heading")).toHaveTextContent(
			"Ready to simplify your lists?",
		);
	});

	it("renders description", () => {
		renderWithUser(<CTA />);
		expect(screen.getByTestId("cta-description")).toHaveTextContent(
			/Create your free account and start organizing. Your lists sync seamlessly/i,
		);
	});

	it("renders Sign in button with link to sign-in", () => {
		renderWithUser(<CTA />);
		const signInLink = screen.getByTestId("cta-sign-in");
		expect(signInLink).toBeInTheDocument();
		expect(signInLink).toHaveAttribute("href", "/sign-in");
		expect(signInLink).toHaveTextContent("Sign in to continue");
	});

	it("renders Tastik logo", () => {
		renderWithUser(<CTA />);
		expect(screen.getByTestId("cta-logo")).toHaveAttribute("alt", "Tastik");
	});
});
