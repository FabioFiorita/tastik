import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockUseCurrentUser } from "@/lib/helpers/mocks";
import { renderWithUser, screen } from "@/test-utils";
import { NavUserTrigger } from "./nav-user-trigger";

const { mockUseCurrentUser: mockUser } = mockUseCurrentUser();

describe("nav-user-trigger", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders nothing when user is not available", () => {
		mockUser.mockReturnValue(null);
		const { container } = renderWithUser(<NavUserTrigger />);
		expect(container.firstChild).toBeNull();
	});

	it("renders trigger with user name and email", () => {
		mockUser.mockReturnValue({
			_id: "user123",
			name: "John Doe",
			email: "john@example.com",
		});
		renderWithUser(<NavUserTrigger />);
		expect(screen.getByTestId("nav-user-trigger")).toBeInTheDocument();
		expect(screen.getByText("John Doe")).toBeInTheDocument();
		expect(screen.getByText("john@example.com")).toBeInTheDocument();
	});

	it("renders user initials in avatar fallback", () => {
		mockUser.mockReturnValue({
			_id: "user123",
			name: "John Doe",
			email: "john@example.com",
		});
		renderWithUser(<NavUserTrigger />);
		expect(screen.getByText("JD")).toBeInTheDocument();
	});

	it("renders single initial when user has no name", () => {
		mockUser.mockReturnValue({
			_id: "user123",
			name: null,
			email: "john@example.com",
		});
		renderWithUser(<NavUserTrigger />);
		expect(screen.getByText("J")).toBeInTheDocument();
	});

	it("renders user image when available", () => {
		mockUser.mockReturnValue({
			_id: "user123",
			name: "John Doe",
			email: "john@example.com",
			imageUrl: "https://example.com/avatar.jpg",
		});
		renderWithUser(<NavUserTrigger />);
		const img = screen.getByAltText("John Doe");
		expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
	});
});
