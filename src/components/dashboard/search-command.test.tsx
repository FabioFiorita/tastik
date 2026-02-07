import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockReactRouter } from "@/lib/helpers/mocks";
import { renderWithUser, screen } from "@/test-utils";
import { SearchCommand } from "./search-command";

const mockUseSearchItems = vi.fn();
const mockSetOpenMobile = vi.fn();
const mockUseSidebar = vi.fn();

vi.mock("@/hooks/queries/use-search-items", () => ({
	useSearchItems: (query: string) => mockUseSearchItems(query),
}));

vi.mock("@/components/ui/sidebar", () => ({
	useSidebar: () => mockUseSidebar(),
}));

describe("search-command", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseSearchItems.mockReturnValue(undefined);
		mockUseSidebar.mockReturnValue({
			isMobile: false,
			setOpenMobile: mockSetOpenMobile,
		});
	});

	it("renders search dialog when open", () => {
		renderWithUser(<SearchCommand open={true} onOpenChange={vi.fn()} />);
		expect(screen.getByTestId("search-command-input")).toBeInTheDocument();
	});

	it("does not render when closed", () => {
		renderWithUser(<SearchCommand open={false} onOpenChange={vi.fn()} />);
		expect(
			screen.queryByTestId("search-command-input"),
		).not.toBeInTheDocument();
	});

	it("shows placeholder message when query is empty", () => {
		renderWithUser(<SearchCommand open={true} onOpenChange={vi.fn()} />);
		expect(screen.getByText("Type to search your items")).toBeInTheDocument();
	});

	it("shows no results message when query has no results", async () => {
		mockUseSearchItems.mockReturnValue([]);
		const { user } = renderWithUser(
			<SearchCommand open={true} onOpenChange={vi.fn()} />,
		);
		const input = screen.getByTestId("search-command-input");
		await user.type(input, "test query");
		expect(await screen.findByText("No items found")).toBeInTheDocument();
	});

	it("displays search results grouped by list", async () => {
		const mockResults = [
			{
				_id: "item1" as const,
				listId: "list1",
				listName: "List 1",
				listIcon: "✅",
				name: "Item 1",
			},
			{
				_id: "item2" as const,
				listId: "list1",
				listName: "List 1",
				listIcon: "✅",
				name: "Item 2",
			},
			{
				_id: "item3" as const,
				listId: "list2",
				listName: "List 2",
				name: "Item 3",
			},
		];
		mockUseSearchItems.mockReturnValue(mockResults);
		mockReactRouter();
		const { user } = renderWithUser(
			<SearchCommand open={true} onOpenChange={vi.fn()} />,
		);
		const input = screen.getByTestId("search-command-input");
		await user.type(input, "test");
		expect(
			await screen.findByTestId("search-result-item1"),
		).toBeInTheDocument();
		expect(screen.getByTestId("search-result-item2")).toBeInTheDocument();
		expect(screen.getByTestId("search-result-item3")).toBeInTheDocument();
	});

	it("navigates to list when result is selected", async () => {
		const mockResults = [
			{
				_id: "item1" as const,
				listId: "list1",
				listName: "List 1",
				name: "Item 1",
			},
		];
		mockUseSearchItems.mockReturnValue(mockResults);
		const { mockNavigate } = mockReactRouter();
		const onOpenChange = vi.fn();
		const { user } = renderWithUser(
			<SearchCommand open={true} onOpenChange={onOpenChange} />,
		);
		const input = screen.getByTestId("search-command-input");
		await user.type(input, "test");
		const result = await screen.findByTestId("search-result-item1");
		await user.click(result);
		expect(mockNavigate).toHaveBeenCalledWith({
			to: "/lists/$listId",
			params: { listId: "list1" },
		});
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it("closes mobile sidebar when result is selected on mobile", async () => {
		mockUseSidebar.mockReturnValue({
			isMobile: true,
			setOpenMobile: mockSetOpenMobile,
		});
		const mockResults = [
			{
				_id: "item1" as const,
				listId: "list1",
				listName: "List 1",
				name: "Item 1",
			},
		];
		mockUseSearchItems.mockReturnValue(mockResults);
		const onOpenChange = vi.fn();
		const { user } = renderWithUser(
			<SearchCommand open={true} onOpenChange={onOpenChange} />,
		);
		const input = screen.getByTestId("search-command-input");
		await user.type(input, "test");
		const result = await screen.findByTestId("search-result-item1");
		await user.click(result);
		expect(mockSetOpenMobile).toHaveBeenCalledWith(false);
	});

	it("clears query when dialog closes", async () => {
		const onOpenChange = vi.fn();
		const { rerender, user } = renderWithUser(
			<SearchCommand open={true} onOpenChange={onOpenChange} />,
		);
		const input = screen.getByTestId(
			"search-command-input",
		) as HTMLInputElement;
		await user.type(input, "test query");
		expect(input.value).toBe("test query");
		rerender(<SearchCommand open={false} onOpenChange={onOpenChange} />);
		rerender(<SearchCommand open={true} onOpenChange={onOpenChange} />);
		const newInput = screen.getByTestId(
			"search-command-input",
		) as HTMLInputElement;
		expect(newInput.value).toBe("");
	});
});
