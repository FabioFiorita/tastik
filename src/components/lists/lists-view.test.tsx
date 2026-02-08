import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockReactRouterLink } from "@/lib/helpers/mocks";
import { renderWithUser, screen } from "@/test-utils";
import type { Id } from "../../../convex/_generated/dataModel";
import { ListsView } from "./lists-view";

mockReactRouterLink();

const mockUseUserLists = vi.fn();

vi.mock("@/hooks/queries/use-user-lists", () => ({
	useUserLists: (status: "active" | "archived") => mockUseUserLists(status),
}));

vi.mock("@/hooks/actions/use-create-list", () => ({
	useCreateList: () => ({ createList: vi.fn(), isPending: false }),
}));

vi.mock("@/hooks/actions/use-lists-sort", () => ({
	useListsSort: () => ({
		sortBy: "created_at",
		sortAscending: false,
		updateSortBy: vi.fn(),
		toggleSortDirection: vi.fn(),
	}),
}));

describe("lists-view", () => {
	beforeEach(() => {
		vi.clearAllMocks();
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

	it("opens create list dialog when create button is clicked", async () => {
		mockUseUserLists.mockReturnValue([]);
		const { user } = renderWithUser(<ListsView />);
		const createButton = screen.getByTestId("create-list-button");
		await user.click(createButton);
		expect(screen.getByText("Create New List")).toBeInTheDocument();
	});

	it("opens create list dialog from empty state button", async () => {
		mockUseUserLists.mockReturnValue([]);
		const { user } = renderWithUser(<ListsView />);
		const createButton = screen.getByText("Create List");
		await user.click(createButton);
		expect(screen.getByText("Create New List")).toBeInTheDocument();
	});
});
