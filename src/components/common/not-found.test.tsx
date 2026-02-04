import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithUser, screen } from "@/test-utils";
import { NotFoundPage } from "./not-found";

const mockNavigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => mockNavigate,
}));

describe("not-found", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders 404 message and search form", () => {
		renderWithUser(<NotFoundPage />);
		expect(screen.getByText("404 - Not Found")).toBeInTheDocument();
		expect(
			screen.getByText("The page you're looking for doesn't exist."),
		).toBeInTheDocument();
		expect(screen.getByTestId("not-found-search-form")).toBeInTheDocument();
		expect(screen.getByTestId("not-found-search-input")).toBeInTheDocument();
	});

	it("navigates to path when form is submitted with valid input", async () => {
		const { user } = renderWithUser(<NotFoundPage />);
		const input = screen.getByTestId("not-found-search-input");
		await user.type(input, "home");
		const form = screen.getByTestId("not-found-search-form");
		await user.click(form);
		form.dispatchEvent(
			new Event("submit", { bubbles: true, cancelable: true }),
		);
		expect(mockNavigate).toHaveBeenCalledWith({ to: "/home" });
	});

	it("adds leading slash to path if not present", async () => {
		const { user } = renderWithUser(<NotFoundPage />);
		const input = screen.getByTestId("not-found-search-input");
		await user.type(input, "about");
		const form = screen.getByTestId("not-found-search-form");
		form.dispatchEvent(
			new Event("submit", { bubbles: true, cancelable: true }),
		);
		expect(mockNavigate).toHaveBeenCalledWith({ to: "/about" });
	});

	it("does not navigate when form is submitted with empty input", async () => {
		renderWithUser(<NotFoundPage />);
		const form = screen.getByTestId("not-found-search-form");
		form.dispatchEvent(
			new Event("submit", { bubbles: true, cancelable: true }),
		);
		expect(mockNavigate).not.toHaveBeenCalled();
	});

	it("trims whitespace from input before navigation", async () => {
		const { user } = renderWithUser(<NotFoundPage />);
		const input = screen.getByTestId("not-found-search-input");
		await user.type(input, "  settings  ");
		const form = screen.getByTestId("not-found-search-form");
		form.dispatchEvent(
			new Event("submit", { bubbles: true, cancelable: true }),
		);
		expect(mockNavigate).toHaveBeenCalledWith({ to: "/settings" });
	});

	it("renders support email link", () => {
		renderWithUser(<NotFoundPage />);
		const supportLink = screen.getByTestId("not-found-support-link");
		expect(supportLink).toBeInTheDocument();
		expect(supportLink).toHaveAttribute("href", "mailto:team@tastikapp.com");
	});

	it("preserves leading slash when path already has one", async () => {
		const { user } = renderWithUser(<NotFoundPage />);
		const input = screen.getByTestId("not-found-search-input");
		await user.type(input, "/dashboard");
		const form = screen.getByTestId("not-found-search-form");
		form.dispatchEvent(
			new Event("submit", { bubbles: true, cancelable: true }),
		);
		expect(mockNavigate).toHaveBeenCalledWith({ to: "/dashboard" });
	});
});
