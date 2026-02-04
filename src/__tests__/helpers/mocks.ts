import { vi } from "vitest";

/**
 * Common mock for next-themes
 * Use this in component tests that use theme switching
 */
export function mockNextThemes(overrides?: {
	theme?: string;
	setTheme?: ReturnType<typeof vi.fn>;
}) {
	const mockSetTheme = overrides?.setTheme ?? vi.fn();

	vi.mock("next-themes", () => ({
		useTheme: () => ({
			setTheme: mockSetTheme,
			theme: overrides?.theme ?? "light",
		}),
	}));

	return { mockSetTheme };
}
