import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockReactRouterLink } from "@/lib/helpers/mocks";
import { renderWithUser, screen } from "@/test-utils";
import type { Id } from "../../../convex/_generated/dataModel";
import { SidebarLists } from "./sidebar-lists";

mockReactRouterLink();

describe("sidebar-lists", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders skeleton loaders when lists is undefined", () => {
		renderWithUser(<SidebarLists lists={undefined} pathname="/" />);
		const skeletons = screen
			.getAllByRole("generic")
			.filter((el) => el.className.includes("skeleton"));
		expect(skeletons.length).toBeGreaterThan(0);
	});

	it("renders empty state when lists is empty array", () => {
		renderWithUser(<SidebarLists lists={[]} pathname="/" />);
		expect(
			screen.getByText("Add your first list to get started."),
		).toBeInTheDocument();
	});

	it("renders list items", () => {
		const lists = [
			{ _id: "list1" as Id<"lists">, name: "List 1", icon: "✅" },
			{ _id: "list2" as Id<"lists">, name: "List 2" },
		];
		renderWithUser(<SidebarLists lists={lists} pathname="/" />);
		expect(screen.getByTestId("sidebar-list-list1")).toBeInTheDocument();
		expect(screen.getByTestId("sidebar-list-list2")).toBeInTheDocument();
		expect(screen.getByText("List 1")).toBeInTheDocument();
		expect(screen.getByText("List 2")).toBeInTheDocument();
	});

	it("renders list icon when provided", () => {
		const lists = [{ _id: "list1" as Id<"lists">, name: "List 1", icon: "✅" }];
		renderWithUser(<SidebarLists lists={lists} pathname="/" />);
		const listItem = screen.getByTestId("sidebar-list-list1");
		expect(listItem).toHaveTextContent("✅");
	});

	it("marks active list", () => {
		const lists = [
			{ _id: "list1" as Id<"lists">, name: "List 1" },
			{ _id: "list2" as Id<"lists">, name: "List 2" },
		];
		renderWithUser(<SidebarLists lists={lists} pathname="/lists/list1" />);
		const list1 = screen.getByTestId("sidebar-list-list1");
		expect(list1).toBeInTheDocument();
	});

	it("calls onNavigate when list is clicked", async () => {
		const onNavigate = vi.fn();
		const lists = [{ _id: "list1" as Id<"lists">, name: "List 1" }];
		const { user } = renderWithUser(
			<SidebarLists lists={lists} pathname="/" onNavigate={onNavigate} />,
		);
		const listItem = screen.getByTestId("sidebar-list-list1");
		await user.click(listItem);
		expect(onNavigate).toHaveBeenCalledTimes(1);
	});

	it("shows 'View all' link when lists exceed limit", () => {
		const lists = Array.from({ length: 11 }, (_, i) => ({
			_id: `list${i + 1}` as Id<"lists">,
			name: `List ${i + 1}`,
		}));
		renderWithUser(<SidebarLists lists={lists} pathname="/" />);
		expect(screen.getByText("View all 11 lists")).toBeInTheDocument();
	});

	it("does not show 'View all' link when lists are within limit", () => {
		const lists = Array.from({ length: 10 }, (_, i) => ({
			_id: `list${i + 1}` as Id<"lists">,
			name: `List ${i + 1}`,
		}));
		renderWithUser(<SidebarLists lists={lists} pathname="/" />);
		expect(screen.queryByText(/View all/)).not.toBeInTheDocument();
	});
});
