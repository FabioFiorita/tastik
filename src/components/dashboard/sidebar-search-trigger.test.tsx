import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithUser, screen } from "@/test-utils";
import { SidebarSearchTrigger } from "./sidebar-search-trigger";

describe("sidebar-search-trigger", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders search input", () => {
		const onOpenSearch = vi.fn();
		renderWithUser(<SidebarSearchTrigger onOpenSearch={onOpenSearch} />);
		expect(screen.getByTestId("sidebar-search")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Search items...")).toBeInTheDocument();
	});

	it("calls onOpenSearch when input is clicked", async () => {
		const onOpenSearch = vi.fn();
		const { user } = renderWithUser(
			<SidebarSearchTrigger onOpenSearch={onOpenSearch} />,
		);
		const input = screen.getByTestId("sidebar-search");
		await user.click(input);
		expect(onOpenSearch).toHaveBeenCalledTimes(1);
	});

	it("calls onOpenSearch when Enter key is pressed", async () => {
		const onOpenSearch = vi.fn();
		const { user } = renderWithUser(
			<SidebarSearchTrigger onOpenSearch={onOpenSearch} />,
		);
		const input = screen.getByTestId("sidebar-search");
		await user.type(input, "{Enter}");
		expect(onOpenSearch).toHaveBeenCalled();
	});

	it("input is read-only", () => {
		const onOpenSearch = vi.fn();
		renderWithUser(<SidebarSearchTrigger onOpenSearch={onOpenSearch} />);
		const input = screen.getByTestId("sidebar-search") as HTMLInputElement;
		expect(input.readOnly).toBe(true);
	});
});
