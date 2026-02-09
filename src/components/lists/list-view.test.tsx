import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockReactRouterLink } from "@/lib/helpers/mocks";
import { renderWithUser, screen } from "@/test-utils";
import type { Id } from "../../../convex/_generated/dataModel";
import { ListView } from "./list-view";

mockReactRouterLink();

const mockUseList = vi.fn();
const mockUseListItems = vi.fn();
const mockHandleCreateItem = vi.fn();
const mockHandleToggleItem = vi.fn();
const mockHandleDeleteItem = vi.fn();
const mockHandleDeleteList = vi.fn();

vi.mock("@clerk/tanstack-react-start", () => ({
	useAuth: () => ({ isLoaded: true, isSignedIn: true }),
}));

vi.mock("convex/react", () => ({
	useConvexAuth: () => ({ isAuthenticated: true }),
}));

vi.mock("@/hooks/queries/use-list", () => ({
	useList: (listId: Id<"lists">) => mockUseList(listId),
}));

vi.mock("@/hooks/queries/use-list-items", () => ({
	useListItems: (listId: Id<"lists">, includeCompleted: boolean) =>
		mockUseListItems(listId, includeCompleted),
}));

vi.mock("@/hooks/queries/use-list-collaborators", () => ({
	useListCollaborators: () => ({ collaborators: [], isShared: false }),
}));

vi.mock("@/hooks/actions/use-export-list", () => ({
	useExportList: () => ({ exportList: vi.fn(), isPending: false }),
}));

vi.mock("@/hooks/actions/use-duplicate-list", () => ({
	useDuplicateList: () => ({ duplicateList: vi.fn(), isPending: false }),
}));

vi.mock("@/hooks/actions/use-delete-list", () => ({
	useDeleteList: () => ({ deleteList: vi.fn(), isPending: false }),
}));

vi.mock("@/hooks/actions/use-update-list-preferences", () => ({
	useUpdateListPreferences: () => ({
		updateShowCompleted: vi.fn(),
		updateHideCheckbox: vi.fn(),
		updateShowTotal: vi.fn(),
		updateSortBy: vi.fn(),
		updateSortAscending: vi.fn(),
	}),
}));

vi.mock("@/hooks/actions/use-list-actions", () => ({
	useListActions: () => ({
		handleCreateItem: mockHandleCreateItem,
		handleToggleItem: mockHandleToggleItem,
		handleDeleteItem: mockHandleDeleteItem,
		handleDeleteList: mockHandleDeleteList,
		isCreating: false,
		isDeleting: false,
	}),
}));

describe("list-view", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("shows spinner when list or items are loading", () => {
		mockUseList.mockReturnValue(undefined);
		mockUseListItems.mockReturnValue(undefined);
		renderWithUser(<ListView listId={"list123" as Id<"lists">} />);
		expect(screen.getByRole("status")).toBeInTheDocument();
	});

	it("renders list name and items", () => {
		mockUseList.mockReturnValue({
			_id: "list123" as Id<"lists">,
			name: "My List",
			showCompleted: false,
			isOwner: true,
			hideCheckbox: false,
		});
		mockUseListItems.mockReturnValue([
			{ _id: "item1" as Id<"items">, name: "Item 1", completed: false },
			{ _id: "item2" as Id<"items">, name: "Item 2", completed: false },
		]);
		renderWithUser(<ListView listId={"list123" as Id<"lists">} />);
		expect(screen.getByText("My List")).toBeInTheDocument();
		expect(screen.getByTestId("item-item1")).toBeInTheDocument();
		expect(screen.getByTestId("item-item2")).toBeInTheDocument();
	});

	it("renders empty state when no items", () => {
		mockUseList.mockReturnValue({
			_id: "list123" as Id<"lists">,
			name: "My List",
			showCompleted: false,
			isOwner: true,
			hideCheckbox: false,
		});
		mockUseListItems.mockReturnValue([]);
		renderWithUser(<ListView listId={"list123" as Id<"lists">} />);
		expect(screen.getByText("No items yet")).toBeInTheDocument();
	});

	it("renders list items", () => {
		mockUseList.mockReturnValue({
			_id: "list123" as Id<"lists">,
			name: "My List",
			showCompleted: false,
			isOwner: true,
			hideCheckbox: false,
		});
		mockUseListItems.mockReturnValue([
			{ _id: "item1" as Id<"items">, name: "Item 1", completed: false },
			{ _id: "item2" as Id<"items">, name: "Item 2", completed: true },
		]);
		renderWithUser(<ListView listId={"list123" as Id<"lists">} />);
		expect(screen.getByTestId("item-item1")).toBeInTheDocument();
		expect(screen.getByTestId("item-item2")).toBeInTheDocument();
		expect(screen.getByText("Item 1")).toBeInTheDocument();
		expect(screen.getByText("Item 2")).toBeInTheDocument();
	});

	it("calls handleCreateItem when add item button is clicked", async () => {
		mockUseList.mockReturnValue({
			_id: "list123" as Id<"lists">,
			name: "My List",
			showCompleted: false,
			isOwner: true,
			hideCheckbox: false,
		});
		mockUseListItems.mockReturnValue([]);
		const { user } = renderWithUser(
			<ListView listId={"list123" as Id<"lists">} />,
		);
		const addButton = screen.getByTestId("add-item-button");
		await user.click(addButton);
		expect(mockHandleCreateItem).toHaveBeenCalledTimes(1);
	});

	it("calls handleToggleItem when checkbox is clicked", async () => {
		mockUseList.mockReturnValue({
			_id: "list123" as Id<"lists">,
			name: "My List",
			showCompleted: false,
			isOwner: true,
			hideCheckbox: false,
		});
		mockUseListItems.mockReturnValue([
			{ _id: "item1" as Id<"items">, name: "Item 1", completed: false },
		]);
		const { user } = renderWithUser(
			<ListView listId={"list123" as Id<"lists">} />,
		);
		const checkbox = screen.getByTestId("item-checkbox-item1");
		await user.click(checkbox);
		expect(mockHandleToggleItem).toHaveBeenCalledWith("item1");
	});

	it("calls handleDeleteItem when delete button is clicked", async () => {
		mockUseList.mockReturnValue({
			_id: "list123" as Id<"lists">,
			name: "My List",
			showCompleted: false,
			isOwner: true,
			hideCheckbox: false,
		});
		mockUseListItems.mockReturnValue([
			{ _id: "item1" as Id<"items">, name: "Item 1", completed: false },
		]);
		const { user } = renderWithUser(
			<ListView listId={"list123" as Id<"lists">} />,
		);
		const deleteButton = screen.getByTestId("delete-item-item1");
		await user.click(deleteButton);
		expect(mockHandleDeleteItem).toHaveBeenCalledWith("item1");
	});

	it("shows list actions menu when user is owner", () => {
		mockUseList.mockReturnValue({
			_id: "list123" as Id<"lists">,
			name: "My List",
			showCompleted: false,
			isOwner: true,
			hideCheckbox: false,
		});
		mockUseListItems.mockReturnValue([]);
		renderWithUser(<ListView listId={"list123" as Id<"lists">} />);
		expect(screen.getByTestId("list-actions-trigger")).toBeInTheDocument();
	});

	it("shows list actions menu when user is not owner", () => {
		mockUseList.mockReturnValue({
			_id: "list123" as Id<"lists">,
			name: "My List",
			showCompleted: false,
			isOwner: false,
			hideCheckbox: false,
		});
		mockUseListItems.mockReturnValue([]);
		renderWithUser(<ListView listId={"list123" as Id<"lists">} />);
		expect(screen.getByTestId("list-actions-trigger")).toBeInTheDocument();
	});

	it("does not show checkbox when hideCheckbox is true", () => {
		mockUseList.mockReturnValue({
			_id: "list123" as Id<"lists">,
			name: "My List",
			showCompleted: false,
			isOwner: true,
			hideCheckbox: true,
		});
		mockUseListItems.mockReturnValue([
			{ _id: "item1" as Id<"items">, name: "Item 1", completed: false },
		]);
		renderWithUser(<ListView listId={"list123" as Id<"lists">} />);
		expect(screen.queryByTestId("item-checkbox-item1")).not.toBeInTheDocument();
	});

	it("shows completed items with line-through styling", () => {
		mockUseList.mockReturnValue({
			_id: "list123" as Id<"lists">,
			name: "My List",
			showCompleted: false,
			isOwner: true,
			hideCheckbox: false,
		});
		mockUseListItems.mockReturnValue([
			{ _id: "item1" as Id<"items">, name: "Item 1", completed: true },
		]);
		renderWithUser(<ListView listId={"list123" as Id<"lists">} />);
		const itemName = screen.getByText("Item 1");
		expect(itemName).toHaveClass("line-through");
	});
});
