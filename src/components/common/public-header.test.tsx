import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	mockNextThemes,
	mockReactRouterLink,
	mockUseAuth,
} from "@/lib/helpers/mocks";
import { renderWithUser, screen } from "@/test-utils";
import { PublicHeader } from "./public-header";

mockNextThemes();
mockReactRouterLink();
const { mockUseAuth: mockAuth } = mockUseAuth();

describe("public-header", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockAuth.mockReturnValue({
			isLoading: false,
			isAuthenticated: false,
			signIn: vi.fn(),
			signOut: vi.fn(),
		});
	});

	it("renders header element", () => {
		renderWithUser(<PublicHeader />);
		expect(screen.getByTestId("public-header")).toBeInTheDocument();
	});

	it("renders logo link with correct href", () => {
		renderWithUser(<PublicHeader />);
		const logoLink = screen.getByTestId("public-header-logo");
		expect(logoLink).toBeInTheDocument();
		expect(logoLink).toHaveAttribute("href", "/");
	});

	it("renders all navigation links", () => {
		renderWithUser(<PublicHeader />);
		expect(screen.getByTestId("public-header-link-home")).toBeInTheDocument();
		expect(
			screen.getByTestId("public-header-link-support"),
		).toBeInTheDocument();
		expect(
			screen.getByTestId("public-header-link-privacy"),
		).toBeInTheDocument();
		expect(screen.getByTestId("public-header-link-terms")).toBeInTheDocument();
	});

	it("navigation links have correct hrefs", () => {
		renderWithUser(<PublicHeader />);
		expect(screen.getByTestId("public-header-link-home")).toHaveAttribute(
			"href",
			"/",
		);
		expect(screen.getByTestId("public-header-link-support")).toHaveAttribute(
			"href",
			"/support",
		);
		expect(screen.getByTestId("public-header-link-privacy")).toHaveAttribute(
			"href",
			"/privacy",
		);
		expect(screen.getByTestId("public-header-link-terms")).toHaveAttribute(
			"href",
			"/terms",
		);
	});

	it("renders ModeToggle component", () => {
		renderWithUser(<PublicHeader />);
		expect(screen.getByTestId("mode-toggle-trigger")).toBeInTheDocument();
	});

	it("renders AuthButton component when not authenticated", () => {
		mockAuth.mockReturnValue({
			isLoading: false,
			isAuthenticated: false,
			signIn: vi.fn(),
			signOut: vi.fn(),
		});
		renderWithUser(<PublicHeader />);
		expect(screen.getByTestId("auth-button-sign-in")).toBeInTheDocument();
	});

	it("renders AuthButton component when authenticated", () => {
		mockAuth.mockReturnValue({
			isLoading: false,
			isAuthenticated: true,
			signIn: vi.fn(),
			signOut: vi.fn(),
		});
		renderWithUser(<PublicHeader />);
		expect(screen.getByTestId("auth-button-sign-out")).toBeInTheDocument();
	});
});
