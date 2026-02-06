import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithUser, screen } from "@/test-utils";
import { AuthButton } from "./auth-button";

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
	UserButton: () =>
		React.createElement("div", { "data-testid": "clerk-user-button" }),
}));

vi.mock("@clerk/themes", () => ({
	shadcn: {},
}));

describe("auth-button", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders loading state with disabled button", () => {
		mockUseAuth.mockReturnValue({ isLoaded: false, isSignedIn: false });

		renderWithUser(<AuthButton />);
		const loadingButton = screen.getByTestId("auth-button-loading");
		expect(loadingButton).toBeInTheDocument();
		expect(loadingButton).toBeDisabled();
		expect(loadingButton).toHaveTextContent("...");
	});

	it("renders UserButton when authenticated", () => {
		mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: true });

		renderWithUser(<AuthButton />);
		expect(screen.getByTestId("auth-button-user")).toBeInTheDocument();
		expect(screen.getByTestId("clerk-user-button")).toBeInTheDocument();
	});

	it("renders sign in button when not authenticated", () => {
		mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: false });

		renderWithUser(<AuthButton />);
		expect(screen.getByTestId("auth-button-sign-in")).toBeInTheDocument();
		expect(screen.getByTestId("auth-button-sign-in")).toHaveTextContent(
			"Sign in",
		);
	});
});
