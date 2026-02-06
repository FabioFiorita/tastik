import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockNextThemes } from "@/lib/helpers/mocks";
import { renderWithUser, screen } from "@/test-utils";
import { NavUserThemeMenu } from "./nav-user-theme-menu";

const { mockUseTheme, mockSetTheme } = mockNextThemes({
	returnFunction: true,
}) as {
	mockUseTheme: ReturnType<typeof vi.fn>;
	mockSetTheme: ReturnType<typeof vi.fn>;
};

describe("nav-user-theme-menu", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseTheme.mockReturnValue({
			setTheme: mockSetTheme,
			theme: "light",
		});
	});

	it("renders theme menu options", () => {
		renderWithUser(<NavUserThemeMenu />);
		expect(screen.getByTestId("nav-user-theme-light")).toBeInTheDocument();
		expect(screen.getByTestId("nav-user-theme-dark")).toBeInTheDocument();
		expect(screen.getByTestId("nav-user-theme-system")).toBeInTheDocument();
	});

	it("shows checkmark for active theme", () => {
		renderWithUser(<NavUserThemeMenu />);
		const lightOption = screen.getByTestId("nav-user-theme-light");
		expect(lightOption).toHaveTextContent("✓");
	});

	it("calls setTheme with light when light option is clicked", async () => {
		mockUseTheme.mockReturnValue({
			setTheme: mockSetTheme,
			theme: "dark",
		});
		const { user } = renderWithUser(<NavUserThemeMenu />);
		const lightOption = screen.getByTestId("nav-user-theme-light");
		await user.click(lightOption);
		expect(mockSetTheme).toHaveBeenCalledWith("light");
	});

	it("calls setTheme with dark when dark option is clicked", async () => {
		const { user } = renderWithUser(<NavUserThemeMenu />);
		const darkOption = screen.getByTestId("nav-user-theme-dark");
		await user.click(darkOption);
		expect(mockSetTheme).toHaveBeenCalledWith("dark");
	});

	it("calls setTheme with system when system option is clicked", async () => {
		const { user } = renderWithUser(<NavUserThemeMenu />);
		const systemOption = screen.getByTestId("nav-user-theme-system");
		await user.click(systemOption);
		expect(mockSetTheme).toHaveBeenCalledWith("system");
	});
});
