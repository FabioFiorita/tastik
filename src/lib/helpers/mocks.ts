import React from "react";
import { vi } from "vitest";

/**
 * Mock for @tanstack/react-router Link component
 * Use this in component tests that render Link components
 */
export function mockReactRouterLink() {
	vi.mock("@tanstack/react-router", () => ({
		Link: ({
			to,
			children,
			className,
			params,
			...props
		}: {
			to: string;
			children: React.ReactNode;
			className?: string;
			params?: Record<string, string>;
			[key: string]: unknown;
		}) => React.createElement("a", { href: to, className, ...props }, children),
		useNavigate: vi.fn(() => vi.fn()),
		useLocation: vi.fn(() => ({ pathname: "/" })),
		useParams: vi.fn(() => ({})),
	}));
}

/**
 * Mock for @tanstack/react-router navigation hooks
 * Returns controllable mock functions for useNavigate, useLocation, useParams
 */
export function mockReactRouter(overrides?: {
	navigate?: ReturnType<typeof vi.fn>;
	location?: { pathname: string; [key: string]: unknown };
	params?: Record<string, string>;
}) {
	const mockNavigate = overrides?.navigate ?? vi.fn();
	const mockLocation = overrides?.location ?? { pathname: "/" };
	const mockParams = overrides?.params ?? {};

	vi.mock("@tanstack/react-router", () => ({
		useNavigate: () => mockNavigate,
		useLocation: () => mockLocation,
		useParams: () => mockParams,
	}));

	return { mockNavigate, mockLocation, mockParams };
}

/**
 * Mock for next-themes
 * Returns controllable mock function for setTheme
 * Use this in component tests that use theme switching
 *
 * @example
 * // Simple usage - returns direct value
 * const { mockSetTheme } = mockNextThemes();
 *
 * @example
 * // Advanced usage - returns controllable function
 * const { mockUseTheme } = mockNextThemes({ returnFunction: true });
 * mockUseTheme.mockReturnValue({ setTheme: mockSetTheme, theme: "dark" });
 */
export function mockNextThemes(overrides?: {
	theme?: string;
	setTheme?: ReturnType<typeof vi.fn>;
	returnFunction?: boolean;
}): {
	mockSetTheme: ReturnType<typeof vi.fn>;
	mockUseTheme?: ReturnType<typeof vi.fn>;
} {
	const mockSetTheme = overrides?.setTheme ?? vi.fn();
	const theme = overrides?.theme ?? "light";

	if (overrides?.returnFunction) {
		const mockUseTheme = vi.fn();
		vi.mock("next-themes", () => ({
			useTheme: () => mockUseTheme(),
		}));
		return { mockUseTheme, mockSetTheme };
	}

	vi.mock("next-themes", () => ({
		useTheme: () => ({
			setTheme: mockSetTheme,
			theme,
		}),
	}));

	return { mockSetTheme };
}

/**
 * Mock for @/hooks/use-auth
 * Returns controllable mock function that can be used with mockReturnValue
 * Use this in component tests that use authentication
 *
 * @example
 * const { mockUseAuth } = mockUseAuth();
 * mockUseAuth.mockReturnValue({ isLoading: false, isAuthenticated: true, ... });
 */
export function mockUseAuth() {
	const mockAuthFn = vi.fn();

	vi.mock("@/hooks/use-auth", () => ({
		useAuth: () => mockAuthFn(),
	}));

	return { mockUseAuth: mockAuthFn };
}

/**
 * Mock for @/hooks/queries/use-current-user
 * Returns controllable mock function that can be used with mockReturnValue
 * Use this in component tests that need user data
 *
 * @example
 * const { mockUseCurrentUser } = mockUseCurrentUser();
 * mockUseCurrentUser.mockReturnValue({ _id: "user123", name: "Test", ... });
 */
export function mockUseCurrentUser() {
	const mockUserFn = vi.fn();

	vi.mock("@/hooks/queries/use-current-user", () => ({
		useCurrentUser: () => mockUserFn(),
	}));

	return { mockUseCurrentUser: mockUserFn };
}
