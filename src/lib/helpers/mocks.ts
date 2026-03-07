import React from "react";
import { vi } from "vitest";

vi.mock("@tanstack/react-router", () => {
	const mocks = {
		mockNavigate: vi.fn(),
		mockLocation: { pathname: "/" as string },
		mockParams: {} as Record<string, string>,
		mockRouteContext: {} as Record<string, unknown>,
	};
	return {
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
		useNavigate: () => mocks.mockNavigate,
		useLocation: () => mocks.mockLocation,
		useParams: () => mocks.mockParams,
		useRouteContext: () => mocks.mockRouteContext,
		__routerMocks: mocks,
	};
});

interface RouterMockShape {
	__routerMocks: {
		mockNavigate: ReturnType<typeof vi.fn>;
		mockLocation: { pathname: string; [key: string]: unknown };
		mockParams: Record<string, string>;
		mockRouteContext: Record<string, unknown>;
	};
}
const routerMocks = (await import(
	"@tanstack/react-router"
)) as unknown as RouterMockShape;
const routerMocksRef = routerMocks.__routerMocks;

export function mockReactRouterLink() {
	return routerMocksRef;
}

export function mockReactRouter(overrides?: {
	navigate?: ReturnType<typeof vi.fn>;
	location?: { pathname: string; [key: string]: unknown };
	params?: Record<string, string>;
	routeContext?: Record<string, unknown>;
}) {
	if (overrides?.navigate)
		routerMocksRef.mockNavigate =
			overrides.navigate as typeof routerMocksRef.mockNavigate;
	if (overrides?.location) routerMocksRef.mockLocation = overrides.location;
	if (overrides?.params) routerMocksRef.mockParams = overrides.params;
	if (overrides?.routeContext)
		routerMocksRef.mockRouteContext = overrides.routeContext;
	return routerMocksRef;
}

vi.mock("next-themes", () => {
	const mockSetTheme = vi.fn();
	const state = {
		theme: "light" as string,
		getUseTheme: undefined as (() => unknown) | undefined,
	};
	return {
		useTheme: () =>
			state.getUseTheme
				? state.getUseTheme?.()
				: { setTheme: mockSetTheme, theme: state.theme },
		__themeMocks: { mockSetTheme, state },
	};
});

interface ThemeMockShape {
	__themeMocks: {
		mockSetTheme: ReturnType<typeof vi.fn>;
		state: { theme: string; getUseTheme: (() => unknown) | undefined };
	};
}
const themeMocks = (await import("next-themes")) as unknown as ThemeMockShape;
const themeMocksRef = themeMocks.__themeMocks;

export function mockNextThemes(overrides?: {
	theme?: string;
	setTheme?: ReturnType<typeof vi.fn>;
	returnFunction?: boolean;
}): {
	mockSetTheme: ReturnType<typeof vi.fn>;
	mockUseTheme?: ReturnType<typeof vi.fn>;
} {
	if (overrides?.setTheme)
		themeMocksRef.mockSetTheme =
			overrides.setTheme as typeof themeMocksRef.mockSetTheme;
	if (overrides?.theme) themeMocksRef.state.theme = overrides.theme;
	if (overrides?.returnFunction) {
		const mockUseTheme = vi.fn();
		themeMocksRef.state.getUseTheme = () => mockUseTheme();
		return { mockUseTheme, mockSetTheme: themeMocksRef.mockSetTheme };
	}
	return { mockSetTheme: themeMocksRef.mockSetTheme };
}

vi.mock("@/hooks/queries/use-current-user", () => {
	const mockUserFn = vi.fn();
	return {
		useCurrentUser: () => mockUserFn(),
		__userMocks: { mockUserFn },
	};
});

interface UserMockShape {
	__userMocks: { mockUserFn: ReturnType<typeof vi.fn> };
}
const userMocksRef = (await import(
	"@/hooks/queries/use-current-user"
)) as unknown as UserMockShape;
const userMocks = userMocksRef.__userMocks;

export function mockUseCurrentUser() {
	return { mockUseCurrentUser: userMocks.mockUserFn };
}

vi.mock("@/lib/metrics", () => ({
	trackListCreated: vi.fn(),
	trackListDeleted: vi.fn(),
	trackListDuplicated: vi.fn(),
	trackListArchived: vi.fn(),
	trackListRestored: vi.fn(),
	trackListExported: vi.fn(),
	trackListEditorAdded: vi.fn(),
	trackListEditorRemoved: vi.fn(),
	trackItemCreated: vi.fn(),
	trackItemDeleted: vi.fn(),
	trackItemUpdated: vi.fn(),
	trackItemToggleComplete: vi.fn(),
	trackItemIncrement: vi.fn(),
	trackItemStatusUpdated: vi.fn(),
	trackTagCreated: vi.fn(),
	trackTagDeleted: vi.fn(),
	trackPageView: vi.fn(),
	trackCtaClicked: vi.fn(),
}));

export function mockMetrics() {
	// Mock is auto-registered via vi.mock above.
	// Call this function to signal intent in test files.
}
