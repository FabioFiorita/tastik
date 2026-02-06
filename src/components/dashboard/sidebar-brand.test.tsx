import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockReactRouterLink } from "@/lib/helpers/mocks";
import { renderWithUser, screen } from "@/test-utils";
import { SidebarBrand } from "./sidebar-brand";

mockReactRouterLink();

describe("sidebar-brand", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders brand with logo and text", () => {
		renderWithUser(<SidebarBrand />);
		expect(screen.getByAltText("Tastik")).toBeInTheDocument();
		expect(screen.getByText("Tastik")).toBeInTheDocument();
		expect(screen.getByText("Your personal lists")).toBeInTheDocument();
	});

	it("calls onNavigate when clicked", async () => {
		const onNavigate = vi.fn();
		const { user } = renderWithUser(<SidebarBrand onNavigate={onNavigate} />);
		const link = screen.getByText("Tastik").closest("a");
		if (link) {
			await user.click(link);
			expect(onNavigate).toHaveBeenCalledTimes(1);
		}
	});

	it("renders without onNavigate callback", () => {
		renderWithUser(<SidebarBrand />);
		expect(screen.getByText("Tastik")).toBeInTheDocument();
	});
});
