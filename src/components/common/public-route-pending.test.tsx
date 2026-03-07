import { vi } from "vitest";
import { mockNextThemes, mockReactRouterLink } from "@/lib/helpers/mocks";
import { renderWithUser, screen } from "@/test-utils";
import { PublicRoutePending } from "./public-route-pending";

vi.mock("@/components/common/auth-button", () => ({
	AuthButton: () => <div data-testid="auth-button-stub" />,
}));

vi.mock("@/components/common/mode-toggle", () => ({
	ModeToggle: () => <div data-testid="mode-toggle-stub" />,
}));

describe("public-route-pending", () => {
	beforeEach(() => {
		mockReactRouterLink();
		mockNextThemes();
	});

	it("renders the public shell without dashboard skeleton markers", () => {
		renderWithUser(<PublicRoutePending />);

		expect(screen.getByTestId("public-header")).toBeInTheDocument();
		expect(screen.getByTestId("public-footer")).toBeInTheDocument();
		expect(screen.getByTestId("public-route-pending")).toBeInTheDocument();
		expect(
			screen.queryByTestId("sidebar-brand-skeleton"),
		).not.toBeInTheDocument();
		expect(
			screen.queryByTestId("header-trigger-skeleton"),
		).not.toBeInTheDocument();
	});
});
