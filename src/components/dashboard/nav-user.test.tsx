import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockUseAuth, mockUseCurrentUser } from "@/lib/helpers/mocks";
import { renderWithUser, screen } from "@/test-utils";
import { NavUser } from "./nav-user";

const { mockUseCurrentUser: mockUser } = mockUseCurrentUser();
const { mockUseAuth: mockAuth } = mockUseAuth();

const mockSignOut = vi.fn();

describe("nav-user", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders nothing when user is not available", () => {
		mockUser.mockReturnValue(null);
		mockAuth.mockReturnValue({ signOut: mockSignOut });
		const { container } = renderWithUser(<NavUser />);
		expect(container.firstChild).toBeNull();
	});

	it("renders nav user menu when user is available", () => {
		mockUser.mockReturnValue({
			_id: "user123",
			name: "John Doe",
			email: "john@example.com",
		});
		mockAuth.mockReturnValue({ signOut: mockSignOut });
		renderWithUser(<NavUser />);
		expect(screen.getByTestId("nav-user-trigger")).toBeInTheDocument();
	});

	it("opens menu when trigger is clicked", async () => {
		mockUser.mockReturnValue({
			_id: "user123",
			name: "John Doe",
			email: "john@example.com",
		});
		mockAuth.mockReturnValue({ signOut: mockSignOut });
		const { user } = renderWithUser(<NavUser />);
		const trigger = screen.getByTestId("nav-user-trigger");
		await user.click(trigger);
		expect(await screen.findByTestId("nav-user-menu")).toBeInTheDocument();
	});

	it("calls signOut when sign out is clicked", async () => {
		mockUser.mockReturnValue({
			_id: "user123",
			name: "John Doe",
			email: "john@example.com",
		});
		mockAuth.mockReturnValue({ signOut: mockSignOut });
		const { user } = renderWithUser(<NavUser />);
		const trigger = screen.getByTestId("nav-user-trigger");
		await user.click(trigger);
		const signOutButton = await screen.findByTestId("nav-user-sign-out");
		await user.click(signOutButton);
		expect(mockSignOut).toHaveBeenCalledTimes(1);
	});
});
