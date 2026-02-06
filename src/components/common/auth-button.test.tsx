import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockReactRouterLink, mockUseAuth } from "@/lib/helpers/mocks";
import { renderWithUser, screen } from "@/test-utils";
import { AuthButton } from "./auth-button";

mockReactRouterLink();
const { mockUseAuth: mockAuth } = mockUseAuth();

const mockSignIn = vi.fn();
const mockSignOut = vi.fn();

describe("auth-button", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders loading state with disabled button", () => {
		mockAuth.mockReturnValue({
			isLoading: true,
			isAuthenticated: false,
			signIn: mockSignIn,
			signOut: mockSignOut,
		});

		renderWithUser(<AuthButton />);
		const loadingButton = screen.getByTestId("auth-button-loading");
		expect(loadingButton).toBeInTheDocument();
		expect(loadingButton).toBeDisabled();
		expect(loadingButton).toHaveTextContent("...");
	});

	it("renders sign out button when authenticated", () => {
		mockAuth.mockReturnValue({
			isLoading: false,
			isAuthenticated: true,
			signIn: mockSignIn,
			signOut: mockSignOut,
		});

		renderWithUser(<AuthButton />);
		const signOutButton = screen.getByTestId("auth-button-sign-out");
		expect(signOutButton).toBeInTheDocument();
		expect(signOutButton).toHaveTextContent("Sign out");
	});

	it("calls signOut when sign out button is clicked", async () => {
		mockAuth.mockReturnValue({
			isLoading: false,
			isAuthenticated: true,
			signIn: mockSignIn,
			signOut: mockSignOut,
		});

		const { user } = renderWithUser(<AuthButton />);
		const signOutButton = screen.getByTestId("auth-button-sign-out");
		await user.click(signOutButton);
		expect(mockSignOut).toHaveBeenCalledTimes(1);
	});

	it("renders sign in link when not authenticated", () => {
		mockAuth.mockReturnValue({
			isLoading: false,
			isAuthenticated: false,
			signIn: mockSignIn,
			signOut: mockSignOut,
		});

		renderWithUser(<AuthButton />);
		const signInLink = screen.getByTestId("auth-button-sign-in");
		expect(signInLink).toBeInTheDocument();
		expect(signInLink).toHaveTextContent("Sign in");
		expect(signInLink).toHaveAttribute("href", "/sign-in");
	});
});
