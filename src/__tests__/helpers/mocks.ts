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

/**
 * Mock for @/hooks/use-auth
 * Use this in component tests that use authentication
 */
export function mockUseAuth(overrides?: {
	isLoading?: boolean;
	isAuthenticated?: boolean;
	signIn?: ReturnType<typeof vi.fn>;
	signOut?: ReturnType<typeof vi.fn>;
}) {
	const mockSignIn = overrides?.signIn ?? vi.fn();
	const mockSignOut = overrides?.signOut ?? vi.fn();

	vi.mock("@/hooks/use-auth", () => ({
		useAuth: () => ({
			isLoading: overrides?.isLoading ?? false,
			isAuthenticated: overrides?.isAuthenticated ?? false,
			signIn: mockSignIn,
			signOut: mockSignOut,
		}),
	}));

	return { mockSignIn, mockSignOut };
}

/**
 * Mock for @tanstack/react-router
 * Note: For Link mocking, manually mock in test files with JSX
 */
export function mockReactRouter(overrides?: {
	navigate?: ReturnType<typeof vi.fn>;
}) {
	const mockNavigate = overrides?.navigate ?? vi.fn();

	vi.mock("@tanstack/react-router", () => ({
		useNavigate: () => mockNavigate,
	}));

	return { mockNavigate };
}

/**
 * Mock for @/hooks/queries/use-current-user
 * Use this in component tests that need user data
 */
export function mockUseCurrentUser(user?: any) {
	vi.mock("@/hooks/queries/use-current-user", () => ({
		useCurrentUser: () => user ?? null,
	}));
}
