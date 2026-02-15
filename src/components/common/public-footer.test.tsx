import { describe, expect, it } from "vitest";
import { mockReactRouterLink } from "@/lib/helpers/mocks";
import { renderWithUser, screen } from "@/test-utils";
import { PublicFooter } from "./public-footer";

mockReactRouterLink();

describe("public-footer", () => {
	it("renders footer element", () => {
		renderWithUser(<PublicFooter />);
		expect(screen.getByTestId("public-footer")).toBeInTheDocument();
	});

	it("renders Tastik logo and brand name", () => {
		renderWithUser(<PublicFooter />);
		const brand = screen.getByTestId("public-footer-brand");
		expect(brand).toHaveTextContent("Tastik");
		expect(screen.getByTestId("public-footer-logo")).toBeInTheDocument();
	});

	it("renders tagline", () => {
		renderWithUser(<PublicFooter />);
		expect(screen.getByTestId("public-footer-tagline")).toHaveTextContent(
			"Lists without deadlines, built to be useful.",
		);
	});

	it("renders Product section links", () => {
		renderWithUser(<PublicFooter />);
		expect(screen.getByTestId("public-footer-link-features")).toHaveTextContent(
			"Features",
		);
		expect(
			screen.getByTestId("public-footer-link-use-cases"),
		).toHaveTextContent("Use Cases");
	});

	it("renders Support section links", () => {
		renderWithUser(<PublicFooter />);
		expect(screen.getByTestId("public-footer-link-help")).toHaveTextContent(
			"Help Center",
		);
		expect(screen.getByTestId("public-footer-link-contact")).toHaveTextContent(
			"Contact Us",
		);
	});

	it("renders Legal section links", () => {
		renderWithUser(<PublicFooter />);
		expect(screen.getByTestId("public-footer-link-privacy")).toHaveTextContent(
			"Privacy Policy",
		);
		expect(screen.getByTestId("public-footer-link-terms")).toHaveTextContent(
			"Terms of Service",
		);
	});

	it("renders copyright notice with current year", () => {
		renderWithUser(<PublicFooter />);
		const currentYear = new Date().getFullYear();
		expect(screen.getByTestId("public-footer-copyright")).toHaveTextContent(
			`© ${currentYear} Tastik. All rights reserved.`,
		);
	});

	it("contact us link has correct mailto href", () => {
		renderWithUser(<PublicFooter />);
		const contactLink = screen.getByTestId("public-footer-link-contact");
		expect(contactLink).toHaveAttribute("href", "mailto:fabiolfp@gmail.com");
	});

	it("help center link navigates to support", () => {
		renderWithUser(<PublicFooter />);
		const helpLink = screen.getByTestId("public-footer-link-help");
		expect(helpLink).toHaveAttribute("href", "/support");
	});

	it("privacy policy link navigates to privacy", () => {
		renderWithUser(<PublicFooter />);
		const privacyLink = screen.getByTestId("public-footer-link-privacy");
		expect(privacyLink).toHaveAttribute("href", "/privacy");
	});

	it("terms of service link navigates to terms", () => {
		renderWithUser(<PublicFooter />);
		const termsLink = screen.getByTestId("public-footer-link-terms");
		expect(termsLink).toHaveAttribute("href", "/terms");
	});
});
