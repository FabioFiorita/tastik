import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithUser, screen } from "@/test-utils";
import { ErrorBoundary } from "./error-boundary";

const mockNavigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => mockNavigate,
}));

describe("error-boundary", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders error boundary with default message", () => {
		const error = new Error("Test error");
		renderWithUser(<ErrorBoundary error={error} />);
		expect(screen.getByText("Oops! Something went wrong")).toBeInTheDocument();
	});

	it("displays error message", () => {
		const error = new Error("Custom error message");
		renderWithUser(<ErrorBoundary error={error} />);
		expect(screen.getByTestId("error-boundary-message")).toHaveTextContent(
			"Custom error message",
		);
	});

	it("handles Convex errors with generic message", () => {
		const error = new Error("ConvexError: something");
		renderWithUser(<ErrorBoundary error={error} />);
		expect(screen.getByTestId("error-boundary-message")).toHaveTextContent(
			"An unexpected error occurred. Please try again.",
		);
	});

	it("renders Try Again button", () => {
		const error = new Error("Test error");
		renderWithUser(<ErrorBoundary error={error} />);
		expect(screen.getByTestId("error-boundary-reset")).toBeInTheDocument();
		expect(screen.getByText("Try Again")).toBeInTheDocument();
	});

	it("renders Go Home button", () => {
		const error = new Error("Test error");
		renderWithUser(<ErrorBoundary error={error} />);
		expect(screen.getByTestId("error-boundary-home")).toBeInTheDocument();
		expect(screen.getByText("Go Home")).toBeInTheDocument();
	});

	it("calls reset function when Try Again is clicked", async () => {
		const error = new Error("Test error");
		const mockReset = vi.fn();
		const { user } = renderWithUser(
			<ErrorBoundary error={error} reset={mockReset} />,
		);
		const resetButton = screen.getByTestId("error-boundary-reset");
		await user.click(resetButton);
		expect(mockReset).toHaveBeenCalledTimes(1);
	});

	it("reloads window when Try Again is clicked without reset prop", async () => {
		const error = new Error("Test error");
		const reloadSpy = vi.spyOn(window.location, "reload");
		const { user } = renderWithUser(<ErrorBoundary error={error} />);
		const resetButton = screen.getByTestId("error-boundary-reset");
		await user.click(resetButton);
		expect(reloadSpy).toHaveBeenCalledTimes(1);
		reloadSpy.mockRestore();
	});

	it("navigates to home when Go Home is clicked", async () => {
		const error = new Error("Test error");
		const { user } = renderWithUser(<ErrorBoundary error={error} />);
		const homeButton = screen.getByTestId("error-boundary-home");
		await user.click(homeButton);
		expect(mockNavigate).toHaveBeenCalledWith({ to: "/" });
	});

	it("renders support contact link", () => {
		const error = new Error("Test error");
		renderWithUser(<ErrorBoundary error={error} />);
		const supportLink = screen.getByTestId("error-boundary-support");
		expect(supportLink).toBeInTheDocument();
		expect(supportLink).toHaveAttribute("href", "mailto:team@tastikapp.com");
	});

	it("handles error without message", () => {
		const error = new Error();
		renderWithUser(<ErrorBoundary error={error} />);
		expect(screen.getByTestId("error-boundary-message")).toHaveTextContent(
			"Something went wrong",
		);
	});
});
