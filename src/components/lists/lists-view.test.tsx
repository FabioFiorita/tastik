import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockReactRouterLink } from "@/lib/helpers/mocks";
import { renderWithUser, screen } from "@/test-utils";
import type { Id } from "../../../convex/_generated/dataModel";
import { ListsView } from "./lists-view";

mockReactRouterLink();

const mockUseUserLists = vi.fn();
const mockHandleCreateList = vi.fn();
const mockUseListsActions = vi.fn();

vi.mock("@/hooks/queries/use-user-lists", () => ({
	useUserLists: (status: "active" | "archived") => mockUseUserLists(status),
}));

vi.mock("@/hooks/actions/use-lists-actions", () => ({
	useListsActions: () => mockUseListsActions(),
}));

describe("lists-view", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseListsActions.mockReturnValue({
			handleCreateList: mockHandleCreateList,
			isCreating: false,
		});
	});

	it("renders nothing when lists are loading", () => {
		mockUseUserLists.mockReturnValue(undefined);
		const { container } = renderWithUser(<ListsView />);
		expect(container.firstChild).toBeNull();
	});

	it("renders empty state when no lists", () => {
		mockUseUserLists.mockReturnValue([]);
		renderWithUser(<ListsView />);
		expect(screen.getByText("No lists yet")).toBeInTheDocument();
		expect(
			screen.getByText("Create your first list to get started"),
		).toBeInTheDocument();
	});

	it("renders list cards", () => {
		mockUseUserLists.mockReturnValue([
			{
				_id: "list1" as Id<"lists">,
				name: "List 1",
				icon: "✅",
				isOwner: true,
			},
			{
				_id: "list2" as Id<"lists">,
				name: "List 2",
				isOwner: false,
			},
		]);
		renderWithUser(<ListsView />);
		expect(screen.getByTestId("list-card-list1")).toBeInTheDocument();
		expect(screen.getByTestId("list-card-list2")).toBeInTheDocument();
		expect(screen.getByText("List 1")).toBeInTheDocument();
		expect(screen.getByText("List 2")).toBeInTheDocument();
	});

	it("shows 'Owned by you' for owned lists", () => {
		mockUseUserLists.mockReturnValue([
			{
				_id: "list1" as Id<"lists">,
				name: "List 1",
				isOwner: true,
			},
		]);
		renderWithUser(<ListsView />);
		expect(screen.getByText("Owned by you")).toBeInTheDocument();
	});

	it("shows 'Shared with you' for shared lists", () => {
		mockUseUserLists.mockReturnValue([
			{
				_id: "list1" as Id<"lists">,
				name: "List 1",
				isOwner: false,
			},
		]);
		renderWithUser(<ListsView />);
		expect(screen.getByText("Shared with you")).toBeInTheDocument();
	});

	it("renders list icon when provided", () => {
		mockUseUserLists.mockReturnValue([
			{
				_id: "list1" as Id<"lists">,
				name: "List 1",
				icon: "✅",
				isOwner: true,
			},
		]);
		renderWithUser(<ListsView />);
		const card = screen.getByTestId("list-card-list1");
		expect(card).toHaveTextContent("✅");
	});

	it("calls handleCreateList when create button is clicked", async () => {
		mockUseUserLists.mockReturnValue([]);
		const { user } = renderWithUser(<ListsView />);
		const createButton = screen.getByTestId("create-list-button");
		await user.click(createButton);
		expect(mockHandleCreateList).toHaveBeenCalledTimes(1);
	});

	it("calls handleCreateList from empty state", async () => {
		mockUseUserLists.mockReturnValue([]);
		const { user } = renderWithUser(<ListsView />);
		const createButton = screen.getAllByText("Create List")[0];
		await user.click(createButton);
		expect(mockHandleCreateList).toHaveBeenCalledTimes(1);
	});

	it("disables create button when isCreating is true", () => {
		mockUseListsActions.mockReturnValue({
			handleCreateList: mockHandleCreateList,
			isCreating: true,
		});
		mockUseUserLists.mockReturnValue([]);
		renderWithUser(<ListsView />);
		const createButton = screen.getByTestId("create-list-button");
		expect(createButton).toBeDisabled();
	});
});
