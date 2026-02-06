import { describe, expect, it } from "vitest";
import { mockReactRouterLink } from "@/lib/helpers/mocks";
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

	it("renders Download for iOS link", () => {
		renderWithUser(<CTA />);
		const downloadLink = screen.getByTestId("cta-download-ios");
		expect(downloadLink).toBeInTheDocument();
		expect(downloadLink).toHaveTextContent("Download for iOS");
	});

	it("renders Tastik logo", () => {
		renderWithUser(<CTA />);
		expect(screen.getByTestId("cta-logo")).toHaveAttribute("alt", "Tastik");
	});
});
