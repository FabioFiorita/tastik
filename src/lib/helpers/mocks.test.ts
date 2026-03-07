import React from "react";
import {
	mockMetrics,
	mockNextThemes,
	mockReactRouter,
	mockReactRouterLink,
	mockUseCurrentUser,
} from "./mocks";

const routerModule = await import("@tanstack/react-router");
const themeModule = await import("next-themes");
const currentUserModule = await import("@/hooks/queries/use-current-user");
const metricsModule = await import("@/lib/metrics");
const mockedRouterModule = routerModule as unknown as {
	Link: (props: {
		to: string;
		children: React.ReactNode;
		className?: string;
		"data-testid"?: string;
	}) => React.ReactElement;
	useNavigate: () => unknown;
	useLocation: () => unknown;
	useParams: () => unknown;
	useRouteContext: () => unknown;
};

describe("mocks helpers", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("exposes router mocks with default values", () => {
		const routerMocks = mockReactRouter();

		expect(mockReactRouterLink()).toBe(routerMocks);
		expect(mockedRouterModule.useNavigate()).toBe(routerMocks.mockNavigate);
		expect(mockedRouterModule.useLocation()).toEqual({ pathname: "/" });
		expect(mockedRouterModule.useParams()).toEqual({});
		expect(mockedRouterModule.useRouteContext()).toEqual({});
	});

	it("applies router overrides and renders the mocked link", () => {
		const navigate = vi.fn();
		const routeContext = { queryClient: "client" };
		mockReactRouter({
			navigate,
			location: { pathname: "/archive" },
			params: { listId: "list_123" },
			routeContext,
		});

		expect(mockedRouterModule.useNavigate()).toBe(navigate);
		expect(mockedRouterModule.useLocation()).toEqual({ pathname: "/archive" });
		expect(mockedRouterModule.useParams()).toEqual({ listId: "list_123" });
		expect(mockedRouterModule.useRouteContext()).toBe(routeContext);

		const link = mockedRouterModule.Link({
			to: "/archive",
			children: "Lists",
			className: "nav-link",
			"data-testid": "router-link",
		});

		expect(link).toEqual(
			React.createElement(
				"a",
				{
					href: "/archive",
					className: "nav-link",
					"data-testid": "router-link",
				},
				"Lists",
			),
		);
	});

	it("returns next-themes mocks with default values", () => {
		const { mockSetTheme } = mockNextThemes();

		expect(themeModule.useTheme()).toEqual({
			setTheme: mockSetTheme,
			theme: "light",
		});
	});

	it("supports overriding next-themes behavior with a custom hook return", () => {
		const setTheme = vi.fn();
		const { mockUseTheme, mockSetTheme } = mockNextThemes({
			theme: "dark",
			setTheme,
			returnFunction: true,
		});
		expect(mockUseTheme).toBeDefined();
		if (!mockUseTheme) {
			throw new Error("Expected mockUseTheme when returnFunction is true");
		}
		vi.mocked(mockUseTheme).mockReturnValue({
			setTheme,
			theme: "system",
		});

		expect(mockSetTheme).toBe(setTheme);
		expect(themeModule.useTheme()).toEqual({
			setTheme,
			theme: "system",
		});
		expect(mockUseTheme).toHaveBeenCalled();
	});

	it("returns a controllable current user mock", () => {
		const { mockUseCurrentUser: currentUserMock } = mockUseCurrentUser();
		vi.mocked(currentUserMock).mockReturnValue({ email: "test@example.com" });

		expect(currentUserModule.useCurrentUser()).toEqual({
			email: "test@example.com",
		});
	});

	it("registers metrics mocks for test files", () => {
		mockMetrics();

		expect(vi.isMockFunction(metricsModule.trackListCreated)).toBe(true);
		metricsModule.trackListCreated("simple", "success");
		expect(metricsModule.trackListCreated).toHaveBeenCalledWith(
			"simple",
			"success",
		);
	});
});
