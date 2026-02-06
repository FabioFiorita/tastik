import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockUseCurrentUser } from "@/lib/helpers/mocks";
import { renderWithUser, screen } from "@/test-utils";
import { NavUserAccountMenu } from "./nav-user-account-menu";

const { mockUseCurrentUser: mockUser } = mockUseCurrentUser();

const mockOpenManagementUrl = vi.fn();
const mockClipboardWriteText = vi.fn();

vi.mock("@/hooks/actions/use-management-url", () => ({
	useManagementUrl: () => ({
		openManagementUrl: mockOpenManagementUrl,
		isLoadingManagement: false,
	}),
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
	},
}));

describe("nav-user-account-menu", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		Object.assign(navigator, {
			clipboard: {
				writeText: mockClipboardWriteText,
			},
		});
	});

	it("renders account menu options", () => {
		mockUser.mockReturnValue({
			_id: "user123",
			name: "John Doe",
			email: "john@example.com",
		});
		renderWithUser(<NavUserAccountMenu />);
		expect(screen.getByTestId("nav-user-account-settings")).toBeInTheDocument();
		expect(screen.getByTestId("nav-user-copy-id")).toBeInTheDocument();
		expect(
			screen.getByTestId("nav-user-manage-subscription"),
		).toBeInTheDocument();
	});

	it("opens account settings modal when account settings is clicked", async () => {
		mockUser.mockReturnValue({
			_id: "user123",
			name: "John Doe",
			email: "john@example.com",
		});
		const { user } = renderWithUser(<NavUserAccountMenu />);
		const settingsOption = screen.getByTestId("nav-user-account-settings");
		await user.click(settingsOption);
		expect(
			await screen.findByTestId("account-settings-modal"),
		).toBeInTheDocument();
	});

	it("copies user ID to clipboard when copy ID is clicked", async () => {
		mockUser.mockReturnValue({
			_id: "user123",
			name: "John Doe",
			email: "john@example.com",
		});
		const { user } = renderWithUser(<NavUserAccountMenu />);
		const copyOption = screen.getByTestId("nav-user-copy-id");
		await user.click(copyOption);
		expect(mockClipboardWriteText).toHaveBeenCalledWith("user123");
	});

	it("calls openManagementUrl when manage subscription is clicked", async () => {
		mockUser.mockReturnValue({
			_id: "user123",
			name: "John Doe",
			email: "john@example.com",
		});
		const { user } = renderWithUser(<NavUserAccountMenu />);
		const manageOption = screen.getByTestId("nav-user-manage-subscription");
		await user.click(manageOption);
		expect(mockOpenManagementUrl).toHaveBeenCalledTimes(1);
	});

	it("disables manage subscription when loading", () => {
		vi.mocked(
			require("@/hooks/actions/use-management-url").useManagementUrl,
		).mockReturnValue({
			openManagementUrl: mockOpenManagementUrl,
			isLoadingManagement: true,
		});
		mockUser.mockReturnValue({
			_id: "user123",
			name: "John Doe",
			email: "john@example.com",
		});
		renderWithUser(<NavUserAccountMenu />);
		const manageOption = screen.getByTestId("nav-user-manage-subscription");
		expect(manageOption).toBeDisabled();
	});
});
