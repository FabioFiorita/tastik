import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithUser, screen } from "@/test-utils";
import { ModeToggle } from "./mode-toggle";

const mockSetTheme = vi.fn();

vi.mock("next-themes", () => ({
	useTheme: () => ({
		setTheme: mockSetTheme,
		theme: "light",
	}),
}));

describe("mode-toggle", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders dropdown menu trigger", () => {
		renderWithUser(<ModeToggle />);
		const trigger = screen.getByTestId("mode-toggle-trigger");
		expect(trigger).toBeInTheDocument();
	});

	it("opens dropdown menu when trigger is clicked", async () => {
		const { user } = renderWithUser(<ModeToggle />);
		const trigger = screen.getByTestId("mode-toggle-trigger");
		await user.click(trigger);
		expect(await screen.findByTestId("mode-toggle-light")).toBeInTheDocument();
		expect(screen.getByTestId("mode-toggle-dark")).toBeInTheDocument();
		expect(screen.getByTestId("mode-toggle-system")).toBeInTheDocument();
	});

	it("calls setTheme with light when Light option is clicked", async () => {
		const { user } = renderWithUser(<ModeToggle />);
		const trigger = screen.getByTestId("mode-toggle-trigger");
		await user.click(trigger);
		const lightOption = await screen.findByTestId("mode-toggle-light");
		await user.click(lightOption);
		expect(mockSetTheme).toHaveBeenCalledWith("light");
	});

	it("calls setTheme with dark when Dark option is clicked", async () => {
		const { user } = renderWithUser(<ModeToggle />);
		const trigger = screen.getByTestId("mode-toggle-trigger");
		await user.click(trigger);
		const darkOption = await screen.findByTestId("mode-toggle-dark");
		await user.click(darkOption);
		expect(mockSetTheme).toHaveBeenCalledWith("dark");
	});

	it("calls setTheme with system when System option is clicked", async () => {
		const { user } = renderWithUser(<ModeToggle />);
		const trigger = screen.getByTestId("mode-toggle-trigger");
		await user.click(trigger);
		const systemOption = await screen.findByTestId("mode-toggle-system");
		await user.click(systemOption);
		expect(mockSetTheme).toHaveBeenCalledWith("system");
	});
});
