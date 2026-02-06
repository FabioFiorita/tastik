import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockUseCurrentUser } from "@/lib/helpers/mocks";
import { renderWithUser, screen } from "@/test-utils";
import { AccountSettingsModal } from "./account-settings-modal";

const { mockUseCurrentUser: mockUser } = mockUseCurrentUser();
const mockUpdateProfile = vi.fn();
const mockDeleteAccount = vi.fn();
const mockUploadPhoto = vi.fn();
const mockClearProfileImage = vi.fn();

vi.mock("@/hooks/actions/use-update-profile", () => ({
	useUpdateProfile: () => ({
		updateProfile: mockUpdateProfile,
		isPending: false,
	}),
}));

vi.mock("@/hooks/actions/use-delete-account", () => ({
	useDeleteAccount: () => ({
		deleteAccount: mockDeleteAccount,
		isPending: false,
	}),
}));

vi.mock("@/hooks/actions/use-profile-image-upload", () => ({
	useProfileImageUpload: () => ({
		uploadPhoto: mockUploadPhoto,
		isPending: false,
	}),
}));

vi.mock("@/hooks/actions/use-clear-profile-image", () => ({
	useClearProfileImage: () => ({
		clearProfileImage: mockClearProfileImage,
		isPending: false,
	}),
}));

describe("account-settings-modal", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders nothing when user is not available", () => {
		mockUser.mockReturnValue(null);
		const { container } = renderWithUser(
			<AccountSettingsModal open={true} onOpenChange={vi.fn()} />,
		);
		expect(container.firstChild).toBeNull();
	});

	it("renders modal when open and user is available", () => {
		mockUser.mockReturnValue({
			_id: "user123",
			name: "John Doe",
			email: "john@example.com",
		});
		renderWithUser(<AccountSettingsModal open={true} onOpenChange={vi.fn()} />);
		expect(screen.getByTestId("account-settings-modal")).toBeInTheDocument();
		expect(screen.getByText("Account settings")).toBeInTheDocument();
	});

	it("displays user name in input", () => {
		mockUser.mockReturnValue({
			_id: "user123",
			name: "John Doe",
			email: "john@example.com",
		});
		renderWithUser(<AccountSettingsModal open={true} onOpenChange={vi.fn()} />);
		const nameInput = screen.getByTestId(
			"account-settings-name-input",
		) as HTMLInputElement;
		expect(nameInput.value).toBe("John Doe");
	});

	it("updates name and calls updateProfile when save is clicked", async () => {
		mockUser.mockReturnValue({
			_id: "user123",
			name: "John Doe",
			email: "john@example.com",
		});
		const { user } = renderWithUser(
			<AccountSettingsModal open={true} onOpenChange={vi.fn()} />,
		);
		const nameInput = screen.getByTestId("account-settings-name-input");
		await user.clear(nameInput);
		await user.type(nameInput, "Jane Doe");
		const saveButton = screen.getByTestId("account-settings-save-name");
		await user.click(saveButton);
		expect(mockUpdateProfile).toHaveBeenCalledWith({ name: "Jane Doe" });
	});

	it("uploads photo when file is selected", async () => {
		mockUser.mockReturnValue({
			_id: "user123",
			name: "John Doe",
			email: "john@example.com",
		});
		const { user } = renderWithUser(
			<AccountSettingsModal open={true} onOpenChange={vi.fn()} />,
		);
		const fileInput = screen.getByTestId(
			"account-settings-photo-input",
		) as HTMLInputElement;
		const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
		await user.upload(fileInput, file);
		expect(mockUploadPhoto).toHaveBeenCalledWith(file);
	});

	it("shows remove photo button when user has uploaded photo", () => {
		mockUser.mockReturnValue({
			_id: "user123",
			name: "John Doe",
			email: "john@example.com",
			imageStorageId: "storage123",
		});
		renderWithUser(<AccountSettingsModal open={true} onOpenChange={vi.fn()} />);
		expect(
			screen.getByTestId("account-settings-remove-photo"),
		).toBeInTheDocument();
	});

	it("calls clearProfileImage when remove photo is clicked", async () => {
		mockUser.mockReturnValue({
			_id: "user123",
			name: "John Doe",
			email: "john@example.com",
			imageStorageId: "storage123",
		});
		const { user } = renderWithUser(
			<AccountSettingsModal open={true} onOpenChange={vi.fn()} />,
		);
		const removeButton = screen.getByTestId("account-settings-remove-photo");
		await user.click(removeButton);
		expect(mockClearProfileImage).toHaveBeenCalledTimes(1);
	});

	it("disables delete account button when email does not match", () => {
		mockUser.mockReturnValue({
			_id: "user123",
			name: "John Doe",
			email: "john@example.com",
		});
		renderWithUser(<AccountSettingsModal open={true} onOpenChange={vi.fn()} />);
		const deleteButton = screen.getByTestId("account-settings-delete-account");
		expect(deleteButton).toBeDisabled();
	});

	it("enables delete account button when email matches", async () => {
		mockUser.mockReturnValue({
			_id: "user123",
			name: "John Doe",
			email: "john@example.com",
		});
		const { user } = renderWithUser(
			<AccountSettingsModal open={true} onOpenChange={vi.fn()} />,
		);
		const emailInput = screen.getByTestId("account-settings-confirm-email");
		await user.type(emailInput, "john@example.com");
		const deleteButton = screen.getByTestId("account-settings-delete-account");
		expect(deleteButton).not.toBeDisabled();
	});

	it("calls deleteAccount when delete button is clicked with matching email", async () => {
		mockUser.mockReturnValue({
			_id: "user123",
			name: "John Doe",
			email: "john@example.com",
		});
		const { user } = renderWithUser(
			<AccountSettingsModal open={true} onOpenChange={vi.fn()} />,
		);
		const emailInput = screen.getByTestId("account-settings-confirm-email");
		await user.type(emailInput, "john@example.com");
		const deleteButton = screen.getByTestId("account-settings-delete-account");
		await user.click(deleteButton);
		expect(mockDeleteAccount).toHaveBeenCalledWith("john@example.com");
	});

	it("clears confirm email when modal closes", async () => {
		mockUser.mockReturnValue({
			_id: "user123",
			name: "John Doe",
			email: "john@example.com",
		});
		const onOpenChange = vi.fn();
		const { rerender, user } = renderWithUser(
			<AccountSettingsModal open={true} onOpenChange={onOpenChange} />,
		);
		const emailInput = screen.getByTestId("account-settings-confirm-email");
		await user.type(emailInput, "john@example.com");
		expect((emailInput as HTMLInputElement).value).toBe("john@example.com");
		rerender(<AccountSettingsModal open={false} onOpenChange={onOpenChange} />);
		rerender(<AccountSettingsModal open={true} onOpenChange={onOpenChange} />);
		const newEmailInput = screen.getByTestId(
			"account-settings-confirm-email",
		) as HTMLInputElement;
		expect(newEmailInput.value).toBe("");
	});
});
