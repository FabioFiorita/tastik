import { describe, expect, it, vi } from "vitest";
import { renderWithUser, screen } from "@/test-utils";
import { SignInHeader } from "./sign-in-header";

vi.mock("@tanstack/react-router", () => ({
	Link: ({ to, children, className, ...props }: any) => (
		<a href={to} className={className} {...props}>
			{children}
		</a>
	),
}));

describe("sign-in-header", () => {
	it("renders header with initial step content", () => {
		renderWithUser(<SignInHeader step="initial" />);
		expect(screen.getByTestId("sign-in-header")).toBeInTheDocument();
		expect(screen.getByTestId("sign-in-header-title")).toHaveTextContent(
			"Sign in to Tastik",
		);
		expect(screen.getByTestId("sign-in-header-description")).toHaveTextContent(
			"Choose your preferred sign-in method",
		);
	});

	it("renders header with verify step content", () => {
		renderWithUser(<SignInHeader step="verify" email="test@example.com" />);
		expect(screen.getByTestId("sign-in-header-title")).toHaveTextContent(
			"Check your email",
		);
		expect(screen.getByTestId("sign-in-header-description")).toHaveTextContent(
			"We sent a 6-digit code to test@example.com",
		);
	});

	it("renders logo link with correct href", () => {
		renderWithUser(<SignInHeader step="initial" />);
		const logoLink = screen.getByTestId("sign-in-header-logo");
		expect(logoLink).toBeInTheDocument();
		expect(logoLink).toHaveAttribute("href", "/");
	});

	it("uses empty string for email when not provided", () => {
		renderWithUser(<SignInHeader step="verify" />);
		expect(screen.getByTestId("sign-in-header-description")).toHaveTextContent(
			"We sent a 6-digit code to",
		);
	});
});
