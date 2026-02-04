import { describe, expect, it, vi } from "vitest";
import { renderWithUser, screen } from "@/test-utils";
import { PublicFooter } from "./public-footer";

vi.mock("@tanstack/react-router", () => ({
	Link: ({ to, children, className, ...props }: any) => (
		<a href={to} className={className} {...props}>
			{children}
		</a>
	),
}));

describe("public-footer", () => {
	it("renders footer element", () => {
		const { container } = renderWithUser(<PublicFooter />);
		const footer = container.querySelector("footer");
		expect(footer).toBeInTheDocument();
	});

	it("renders Tastik logo and brand name", () => {
		renderWithUser(<PublicFooter />);
		expect(screen.getByText("Tastik")).toBeInTheDocument();
		expect(screen.getByAltText("Tastik")).toBeInTheDocument();
	});

	it("renders tagline", () => {
		renderWithUser(<PublicFooter />);
		expect(
			screen.getByText("Lists without deadlines, built to be useful."),
		).toBeInTheDocument();
	});

	it("renders Product section links", () => {
		renderWithUser(<PublicFooter />);
		expect(screen.getByText("Features")).toBeInTheDocument();
		expect(screen.getByText("Use Cases")).toBeInTheDocument();
	});

	it("renders Support section links", () => {
		renderWithUser(<PublicFooter />);
		expect(screen.getByText("Help Center")).toBeInTheDocument();
		expect(screen.getByText("Contact Us")).toBeInTheDocument();
	});

	it("renders Legal section links", () => {
		renderWithUser(<PublicFooter />);
		expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
		expect(screen.getByText("Terms of Service")).toBeInTheDocument();
	});

	it("renders copyright notice with current year", () => {
		renderWithUser(<PublicFooter />);
		const currentYear = new Date().getFullYear();
		expect(
			screen.getByText(`© ${currentYear} Tastik. All rights reserved.`),
		).toBeInTheDocument();
	});

	it("contact us link has correct mailto href", () => {
		renderWithUser(<PublicFooter />);
		const contactLink = screen.getByText("Contact Us");
		expect(contactLink).toHaveAttribute("href", "mailto:team@tastikapp.com");
	});

	it("help center link navigates to support", () => {
		renderWithUser(<PublicFooter />);
		const helpLink = screen.getByText("Help Center");
		expect(helpLink).toHaveAttribute("href", "/support");
	});

	it("privacy policy link navigates to privacy", () => {
		renderWithUser(<PublicFooter />);
		const privacyLink = screen.getByText("Privacy Policy");
		expect(privacyLink).toHaveAttribute("href", "/privacy");
	});

	it("terms of service link navigates to terms", () => {
		renderWithUser(<PublicFooter />);
		const termsLink = screen.getByText("Terms of Service");
		expect(termsLink).toHaveAttribute("href", "/terms");
	});
});
