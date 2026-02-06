import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockNextThemes } from "@/lib/helpers/mocks";
import { renderWithUser, screen } from "@/test-utils";
import { PublicHeader } from "./public-header";

mockNextThemes();

const mockUseAuth = vi.fn();

vi.mock("@tanstack/react-router", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@tanstack/react-router")>();
	return {
		...actual,
		Link: ({
			to,
			children,
			className,
			...props
		}: {
			to: string;
			children: React.ReactNode;
			className?: string;
			[key: string]: unknown;
		}) => React.createElement("a", { href: to, className, ...props }, children),
	};
});

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
	UserButton: () =>
		React.createElement("div", { "data-testid": "clerk-user-button" }),
}));

vi.mock("@clerk/themes", () => ({
	shadcn: {},
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

	it("renders ModeToggle component", () => {
		renderWithUser(<PublicHeader />);
		expect(screen.getByTestId("mode-toggle-trigger")).toBeInTheDocument();
	});

	it("renders sign in button when not authenticated", () => {
		mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: false });
		renderWithUser(<PublicHeader />);
		expect(screen.getByTestId("auth-button-sign-in")).toBeInTheDocument();
	});

	it("renders UserButton when authenticated", () => {
		mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: true });
		renderWithUser(<PublicHeader />);
		expect(screen.getByTestId("auth-button-user")).toBeInTheDocument();
	});
});
