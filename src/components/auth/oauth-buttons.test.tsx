import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockUseAuth } from "@/lib/helpers/mocks";
import { renderWithUser, screen } from "@/test-utils";
import { OAuthButtons } from "./oauth-buttons";

const { mockUseAuth: mockAuth } = mockUseAuth();
const mockSignIn = vi.fn();
const mockOnError = vi.fn();

describe("oauth-buttons", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockAuth.mockReturnValue({ signIn: mockSignIn });
	});

	it("renders both Google and Apple buttons", () => {
		renderWithUser(<OAuthButtons onError={mockOnError} />);
		expect(screen.getByTestId("oauth-button-google")).toBeInTheDocument();
		expect(screen.getByTestId("oauth-button-apple")).toBeInTheDocument();
	});

	it("calls signIn with google when Google button is clicked", async () => {
		mockSignIn.mockResolvedValueOnce(undefined);
		const { user } = renderWithUser(<OAuthButtons onError={mockOnError} />);
		const googleButton = screen.getByTestId("oauth-button-google");
		await user.click(googleButton);
		expect(mockSignIn).toHaveBeenCalledWith("google");
		expect(mockOnError).toHaveBeenCalledWith("");
	});

	it("calls signIn with apple when Apple button is clicked", async () => {
		mockSignIn.mockResolvedValueOnce(undefined);
		const { user } = renderWithUser(<OAuthButtons onError={mockOnError} />);
		const appleButton = screen.getByTestId("oauth-button-apple");
		await user.click(appleButton);
		expect(mockSignIn).toHaveBeenCalledWith("apple");
		expect(mockOnError).toHaveBeenCalledWith("");
	});

	it("disables buttons during sign-in", async () => {
		mockSignIn.mockImplementation(
			() => new Promise((resolve) => setTimeout(resolve, 100)),
		);
		const { user } = renderWithUser(<OAuthButtons onError={mockOnError} />);
		const googleButton = screen.getByTestId("oauth-button-google");
		const appleButton = screen.getByTestId("oauth-button-apple");

		user.click(googleButton);
		await vi.waitFor(() => {
			expect(googleButton).toBeDisabled();
			expect(appleButton).toBeDisabled();
		});
	});

	it("calls onError with Google error message when Google sign-in fails", async () => {
		const error = new Error("Network error");
		mockSignIn.mockRejectedValueOnce(error);
		const { user } = renderWithUser(<OAuthButtons onError={mockOnError} />);
		const googleButton = screen.getByTestId("oauth-button-google");
		await user.click(googleButton);
		await vi.waitFor(() => {
			expect(mockOnError).toHaveBeenCalledWith("Failed to sign in with Google");
		});
	});

	it("calls onError with Apple error message when Apple sign-in fails", async () => {
		const error = new Error("Network error");
		mockSignIn.mockRejectedValueOnce(error);
		const { user } = renderWithUser(<OAuthButtons onError={mockOnError} />);
		const appleButton = screen.getByTestId("oauth-button-apple");
		await user.click(appleButton);
		await vi.waitFor(() => {
			expect(mockOnError).toHaveBeenCalledWith("Failed to sign in with Apple");
		});
	});

	it("clears error before new sign-in attempt", async () => {
		mockSignIn.mockResolvedValueOnce(undefined);
		const { user } = renderWithUser(<OAuthButtons onError={mockOnError} />);
		const googleButton = screen.getByTestId("oauth-button-google");
		await user.click(googleButton);
		expect(mockOnError).toHaveBeenCalledWith("");
	});

	it("respects disabled prop", () => {
		renderWithUser(<OAuthButtons onError={mockOnError} disabled />);
		const googleButton = screen.getByTestId("oauth-button-google");
		const appleButton = screen.getByTestId("oauth-button-apple");
		expect(googleButton).toBeDisabled();
		expect(appleButton).toBeDisabled();
	});
});
