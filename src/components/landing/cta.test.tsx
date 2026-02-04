import { describe, expect, it, vi } from "vitest";
import { renderWithUser, screen } from "@/test-utils";
import { CTA } from "./cta";

vi.mock("@tanstack/react-router", () => ({
	Link: ({ to, children, className, ...props }: any) => (
		<a href={to} className={className} {...props}>
			{children}
		</a>
	),
}));

describe("cta", () => {
	it("renders main heading", () => {
		renderWithUser(<CTA />);
		expect(
			screen.getByText("Ready to simplify your lists?"),
		).toBeInTheDocument();
	});

	it("renders description", () => {
		renderWithUser(<CTA />);
		expect(
			screen.getByText(
				/Create your free account and start organizing. Your lists sync seamlessly/i,
			),
		).toBeInTheDocument();
	});

	it("renders Sign in button with link to sign-in", () => {
		renderWithUser(<CTA />);
		const signInButton = screen.getByText("Sign in to continue");
		expect(signInButton).toBeInTheDocument();
		expect(signInButton).toHaveAttribute("href", "/sign-in");
	});

	it("renders Download for iOS link", () => {
		renderWithUser(<CTA />);
		expect(screen.getByText("Download for iOS")).toBeInTheDocument();
	});

	it("renders Tastik logo", () => {
		renderWithUser(<CTA />);
		expect(screen.getByAltText("Tastik")).toBeInTheDocument();
	});
});
