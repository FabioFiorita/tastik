import React from "react";
import { vi } from "vitest";

const routerMocks = vi.hoisted(() => ({
	mockNavigate: vi.fn(),
	mockLocation: { pathname: "/" },
	mockParams: {} as Record<string, string>,
}));

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
	useNavigate: () => routerMocks.mockNavigate,
	useLocation: () => routerMocks.mockLocation,
	useParams: () => routerMocks.mockParams,
}));

export function mockReactRouterLink() {
	return routerMocks;
}

export function mockReactRouter(overrides?: {
	navigate?: ReturnType<typeof vi.fn>;
	location?: { pathname: string; [key: string]: unknown };
	params?: Record<string, string>;
}) {
	if (overrides?.navigate)
		routerMocks.mockNavigate =
			overrides.navigate as typeof routerMocks.mockNavigate;
	if (overrides?.location) routerMocks.mockLocation = overrides.location;
	if (overrides?.params) routerMocks.mockParams = overrides.params;
	return routerMocks;
}

const themeMocks = vi.hoisted(() => ({
	mockSetTheme: vi.fn(),
	theme: "light" as string,
	getUseTheme: undefined as (() => unknown) | undefined,
}));

vi.mock("next-themes", () => ({
	useTheme: () =>
		themeMocks.getUseTheme
			? themeMocks.getUseTheme?.()
			: { setTheme: themeMocks.mockSetTheme, theme: themeMocks.theme },
}));

export function mockNextThemes(overrides?: {
	theme?: string;
	setTheme?: ReturnType<typeof vi.fn>;
	returnFunction?: boolean;
}): {
	mockSetTheme: ReturnType<typeof vi.fn>;
	mockUseTheme?: ReturnType<typeof vi.fn>;
} {
	if (overrides?.setTheme)
		themeMocks.mockSetTheme =
			overrides.setTheme as typeof themeMocks.mockSetTheme;
	if (overrides?.theme) themeMocks.theme = overrides.theme;
	if (overrides?.returnFunction) {
		const mockUseTheme = vi.fn();
		themeMocks.getUseTheme = () => mockUseTheme();
		return { mockUseTheme, mockSetTheme: themeMocks.mockSetTheme };
	}
	return { mockSetTheme: themeMocks.mockSetTheme };
}

const userMocks = vi.hoisted(() => ({
	mockUserFn: vi.fn(),
}));

vi.mock("@/hooks/queries/use-current-user", () => ({
	useCurrentUser: () => userMocks.mockUserFn(),
}));

export function mockUseCurrentUser() {
	return { mockUseCurrentUser: userMocks.mockUserFn };
}
