import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockReactRouterLink } from "@/lib/helpers/mocks";
import { renderWithUser, screen } from "@/test-utils";
import type { Id } from "../../../convex/_generated/dataModel";
import { ListView } from "./list-view";

mockReactRouterLink();

const mockUseList = vi.fn();
const mockUseListItems = vi.fn();
const mockHandleToggleItem = vi.fn();
const mockHandleDeleteItem = vi.fn();
const mockHandleDeleteList = vi.fn();
const mockHandleIncrementValue = vi.fn();
const mockHandleUpdateStatus = vi.fn();

vi.mock("@clerk/tanstack-react-start", () => ({
	useAuth: () => ({ isLoaded: true, isSignedIn: true }),
}));

vi.mock("convex/react", () => ({
	useConvexAuth: () => ({ isAuthenticated: true }),
	useMutation: () => vi.fn(),
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
		handleToggleItem: mockHandleToggleItem,
		handleDeleteItem: mockHandleDeleteItem,
		handleDeleteList: mockHandleDeleteList,
		handleIncrementValue: mockHandleIncrementValue,
		handleUpdateStatus: mockHandleUpdateStatus,
		isDeleting: false,
	}),
}));

vi.mock("@/hooks/queries/use-list-tags", () => ({
	useListTags: () => [],
}));

vi.mock("@/hooks/actions/use-create-item", () => ({
	useCreateItem: () => ({ createItem: vi.fn(), isPending: false }),
}));

vi.mock("@/hooks/actions/use-update-item", () => ({
	useUpdateItem: () => ({ updateItem: vi.fn(), isPending: false }),
}));

const makeList = (overrides = {}) => ({
	_id: "list123" as Id<"lists">,
	name: "My List",
	type: "simple" as const,
	showCompleted: false,
	isOwner: true,
	hideCheckbox: false,
	sortBy: "created_at" as const,
	sortAscending: true,
	...overrides,
});

const makeItem = (overrides = {}) => ({
	_id: "item1" as Id<"items">,
	name: "Item 1",
	type: "simple" as const,
	completed: false,
	...overrides,
});

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
		mockUseList.mockReturnValue(makeList());
		mockUseListItems.mockReturnValue([
			makeItem(),
			makeItem({ _id: "item2" as Id<"items">, name: "Item 2" }),
		]);
		renderWithUser(<ListView listId={"list123" as Id<"lists">} />);
		expect(screen.getByText("My List")).toBeInTheDocument();
		expect(screen.getByTestId("item-item1")).toBeInTheDocument();
		expect(screen.getByTestId("item-item2")).toBeInTheDocument();
	});

	it("renders empty state when no items", () => {
		mockUseList.mockReturnValue(makeList());
		mockUseListItems.mockReturnValue([]);
		renderWithUser(<ListView listId={"list123" as Id<"lists">} />);
		expect(screen.getByText("No items yet")).toBeInTheDocument();
	});

	it("renders list items with names", () => {
		mockUseList.mockReturnValue(makeList());
		mockUseListItems.mockReturnValue([
			makeItem(),
			makeItem({
				_id: "item2" as Id<"items">,
				name: "Item 2",
				completed: true,
			}),
		]);
		renderWithUser(<ListView listId={"list123" as Id<"lists">} />);
		expect(screen.getByTestId("item-item1")).toBeInTheDocument();
		expect(screen.getByTestId("item-item2")).toBeInTheDocument();
		expect(screen.getByText("Item 1")).toBeInTheDocument();
		expect(screen.getByText("Item 2")).toBeInTheDocument();
	});

	it("opens create item dialog when add item button is clicked", async () => {
		mockUseList.mockReturnValue(makeList());
		mockUseListItems.mockReturnValue([]);
		const { user } = renderWithUser(
			<ListView listId={"list123" as Id<"lists">} />,
		);
		const addButton = screen.getByTestId("add-item-button");
		await user.click(addButton);
		expect(screen.getByTestId("item-name-input")).toBeInTheDocument();
	});

	it("calls handleToggleItem when checkbox is clicked", async () => {
		mockUseList.mockReturnValue(makeList());
		mockUseListItems.mockReturnValue([makeItem()]);
		const { user } = renderWithUser(
			<ListView listId={"list123" as Id<"lists">} />,
		);
		const checkbox = screen.getByTestId("item-checkbox-item1");
		await user.click(checkbox);
		expect(mockHandleToggleItem).toHaveBeenCalledWith("item1");
	});

	it("calls handleDeleteItem when delete menu item is clicked", async () => {
		mockUseList.mockReturnValue(makeList());
		mockUseListItems.mockReturnValue([makeItem()]);
		const { user } = renderWithUser(
			<ListView listId={"list123" as Id<"lists">} />,
		);
		const actionsButton = screen.getByTestId("item-actions-item1");
		await user.click(actionsButton);
		const deleteButton = screen.getByTestId("delete-item-item1");
		await user.click(deleteButton);
		await user.click(screen.getByTestId("delete-item-confirm"));
		expect(mockHandleDeleteItem).toHaveBeenCalledWith("item1");
	});

	it("shows list actions menu when user is owner", () => {
		mockUseList.mockReturnValue(makeList());
		mockUseListItems.mockReturnValue([]);
		renderWithUser(<ListView listId={"list123" as Id<"lists">} />);
		expect(screen.getByTestId("list-actions-trigger")).toBeInTheDocument();
		expect(screen.getByTestId("list-preferences-trigger")).toBeInTheDocument();
	});

	it("shows list actions menu when user is not owner", () => {
		mockUseList.mockReturnValue(makeList({ isOwner: false }));
		mockUseListItems.mockReturnValue([]);
		renderWithUser(<ListView listId={"list123" as Id<"lists">} />);
		expect(screen.getByTestId("list-actions-trigger")).toBeInTheDocument();
		expect(
			screen.queryByTestId("list-preferences-trigger"),
		).not.toBeInTheDocument();
	});

	it("does not show checkbox when hideCheckbox is true", () => {
		mockUseList.mockReturnValue(makeList({ hideCheckbox: true }));
		mockUseListItems.mockReturnValue([makeItem()]);
		renderWithUser(<ListView listId={"list123" as Id<"lists">} />);
		expect(screen.queryByTestId("item-checkbox-item1")).not.toBeInTheDocument();
	});

	it("shows completed items with line-through styling", () => {
		mockUseList.mockReturnValue(makeList());
		mockUseListItems.mockReturnValue([makeItem({ completed: true })]);
		renderWithUser(<ListView listId={"list123" as Id<"lists">} />);
		const itemName = screen.getByTestId("item-name-item1");
		expect(itemName).toHaveClass("line-through");
	});

	it("renders stepper controls for stepper items", () => {
		mockUseList.mockReturnValue(makeList({ type: "stepper" }));
		mockUseListItems.mockReturnValue([
			makeItem({
				type: "stepper",
				currentValue: 3,
				step: 1,
			}),
		]);
		renderWithUser(<ListView listId={"list123" as Id<"lists">} />);
		expect(screen.getByTestId("item-stepper-item1")).toBeInTheDocument();
		expect(screen.getByTestId("item-value-item1")).toHaveTextContent("3");
	});

	it("renders kanban status control for kanban items", () => {
		mockUseList.mockReturnValue(makeList({ type: "kanban" }));
		mockUseListItems.mockReturnValue([
			makeItem({ type: "kanban", status: "todo" }),
		]);
		renderWithUser(<ListView listId={"list123" as Id<"lists">} />);
		expect(screen.getByTestId("item-status-item1")).toBeInTheDocument();
	});

	it("renders kanban board when list type is kanban and items exist", () => {
		mockUseList.mockReturnValue(makeList({ type: "kanban" }));
		mockUseListItems.mockReturnValue([
			makeItem({ type: "kanban", status: "todo" }),
		]);
		renderWithUser(<ListView listId={"list123" as Id<"lists">} />);
		expect(screen.getByTestId("kanban-board")).toBeInTheDocument();
	});

	it("renders item metadata when present", () => {
		mockUseList.mockReturnValue(makeList());
		mockUseListItems.mockReturnValue([
			makeItem({ description: "A description" }),
		]);
		renderWithUser(<ListView listId={"list123" as Id<"lists">} />);
		expect(screen.getByTestId("item-metadata")).toBeInTheDocument();
		expect(screen.getByTestId("item-description")).toHaveTextContent(
			"A description",
		);
	});

	it("renders actions menu with edit and duplicate options", async () => {
		mockUseList.mockReturnValue(makeList());
		mockUseListItems.mockReturnValue([makeItem()]);
		const { user } = renderWithUser(
			<ListView listId={"list123" as Id<"lists">} />,
		);
		const actionsButton = screen.getByTestId("item-actions-item1");
		await user.click(actionsButton);
		expect(screen.getByTestId("edit-item-item1")).toBeInTheDocument();
		expect(screen.getByTestId("duplicate-item-item1")).toBeInTheDocument();
	});

	it("shows total row for calculator and stepper items when enabled", () => {
		mockUseList.mockReturnValue(
			makeList({ type: "multi", showTotal: true, showCompleted: true }),
		);
		mockUseListItems.mockReturnValue([
			makeItem({ type: "calculator", calculatorValue: 10 }),
			makeItem({
				_id: "item2" as Id<"items">,
				type: "stepper",
				currentValue: 5,
			}),
			makeItem({
				_id: "item3" as Id<"items">,
				type: "calculator",
				calculatorValue: 3,
				completed: true,
			}),
		]);

		renderWithUser(<ListView listId={"list123" as Id<"lists">} />);

		expect(screen.getByTestId("item-total-row")).toBeInTheDocument();
		expect(screen.getByTestId("item-total-value")).toHaveTextContent("15");
	});
});
