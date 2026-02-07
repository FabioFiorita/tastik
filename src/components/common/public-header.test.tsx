import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockNextThemes } from "@/lib/helpers/mocks";
import { renderWithUser, screen } from "@/test-utils";
import { PublicHeader } from "./public-header";

mockNextThemes();

const mockUseAuth = vi.fn();

vi.mock("@clerk/tanstack-react-start", () => ({
	useAuth: () => mockUseAuth(),
	SignInButton: ({
		children,
	}: {
		children: React.ReactNode;
		mode?: string;
		forceRedirectUrl?: string;
	}) =>
		React.createElement(
			"div",
			{ "data-testid": "clerk-sign-in-button" },
			children,
		),
}));

vi.mock("@/components/dashboard/nav-user", () => ({
	NavUser: () => React.createElement("div", { "data-testid": "nav-user" }),
}));

describe("public-header", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: false });
	});

	it("renders header element", () => {
		renderWithUser(<PublicHeader />);
		expect(screen.getByTestId("public-header")).toBeInTheDocument();
	});

	it("renders logo link with correct href", () => {
		renderWithUser(<PublicHeader />);
		const logoLink = screen.getByTestId("public-header-logo");
		expect(logoLink).toBeInTheDocument();
		expect(logoLink).toHaveAttribute("href", "/");
	});

	it("renders all navigation links", () => {
		renderWithUser(<PublicHeader />);
		expect(screen.getByTestId("public-header-link-home")).toBeInTheDocument();
		expect(
			screen.getByTestId("public-header-link-support"),
		).toBeInTheDocument();
		expect(
			screen.getByTestId("public-header-link-privacy"),
		).toBeInTheDocument();
		expect(screen.getByTestId("public-header-link-terms")).toBeInTheDocument();
	});

	it("navigation links have correct hrefs", () => {
		renderWithUser(<PublicHeader />);
		expect(screen.getByTestId("public-header-link-home")).toHaveAttribute(
			"href",
			"/",
		);
		expect(screen.getByTestId("public-header-link-support")).toHaveAttribute(
			"href",
			"/support",
		);
		expect(screen.getByTestId("public-header-link-privacy")).toHaveAttribute(
			"href",
			"/privacy",
		);
		expect(screen.getByTestId("public-header-link-terms")).toHaveAttribute(
			"href",
			"/terms",
		);
	});

	it("renders sign in button when not authenticated", () => {
		mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: false });
		renderWithUser(<PublicHeader />);
		expect(screen.getByTestId("clerk-sign-in-button")).toBeInTheDocument();
	});

	it("renders nav user when authenticated", () => {
		mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: true });
		renderWithUser(<PublicHeader />);
		expect(screen.getByTestId("nav-user")).toBeInTheDocument();
	});
});
