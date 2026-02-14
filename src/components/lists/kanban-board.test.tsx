import { beforeEach, describe, expect, it, vi } from "vitest";
import { STATUS_META } from "@/lib/constants/item-statuses";
import { mockReactRouterLink } from "@/lib/helpers/mocks";
import { renderWithUser, screen } from "@/test-utils";
import type { Id } from "../../../convex/_generated/dataModel";
import { KanbanBoard } from "./kanban-board";

mockReactRouterLink();

const mockOnToggleComplete = vi.fn();
const mockOnUpdateStatus = vi.fn();
const mockOnIncrementValue = vi.fn();
const mockOnActivate = vi.fn();
const mockOnEdit = vi.fn();
const mockOnDuplicate = vi.fn();
const mockOnDelete = vi.fn();

const makeItem = (overrides = {}) => ({
	_id: "item1" as Id<"items">,
	name: "Item 1",
	type: "kanban" as const,
	completed: false,
	...overrides,
});

describe("kanban-board", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders kanban-board testid", () => {
		renderWithUser(
			<KanbanBoard
				items={[]}
				tagMap={new Map()}
				listType="kanban"
				activeItemId={null}
				onActivate={mockOnActivate}
				onToggleComplete={mockOnToggleComplete}
				onUpdateStatus={mockOnUpdateStatus}
				onIncrementValue={mockOnIncrementValue}
				onEdit={mockOnEdit}
				onDuplicate={mockOnDuplicate}
				onDelete={mockOnDelete}
			/>,
		);
		expect(screen.getByTestId("kanban-board")).toBeInTheDocument();
	});

	it("renders 3 columns with correct testids", () => {
		renderWithUser(
			<KanbanBoard
				items={[]}
				tagMap={new Map()}
				listType="kanban"
				activeItemId={null}
				onActivate={mockOnActivate}
				onToggleComplete={mockOnToggleComplete}
				onUpdateStatus={mockOnUpdateStatus}
				onIncrementValue={mockOnIncrementValue}
				onEdit={mockOnEdit}
				onDuplicate={mockOnDuplicate}
				onDelete={mockOnDelete}
			/>,
		);
		expect(screen.getByTestId("kanban-column-todo")).toBeInTheDocument();
		expect(screen.getByTestId("kanban-column-in_progress")).toBeInTheDocument();
		expect(screen.getByTestId("kanban-column-done")).toBeInTheDocument();
	});

	it("groups items by status correctly", () => {
		renderWithUser(
			<KanbanBoard
				items={[
					makeItem({
						_id: "a" as Id<"items">,
						name: "Todo item",
						status: "todo",
					}),
					makeItem({
						_id: "b" as Id<"items">,
						name: "In progress item",
						status: "in_progress",
					}),
					makeItem({
						_id: "c" as Id<"items">,
						name: "Done item",
						status: "done",
					}),
				]}
				tagMap={new Map()}
				listType="kanban"
				activeItemId={null}
				onActivate={mockOnActivate}
				onToggleComplete={mockOnToggleComplete}
				onUpdateStatus={mockOnUpdateStatus}
				onIncrementValue={mockOnIncrementValue}
				onEdit={mockOnEdit}
				onDuplicate={mockOnDuplicate}
				onDelete={mockOnDelete}
			/>,
		);
		expect(screen.getByTestId("item-a")).toBeInTheDocument();
		expect(screen.getByTestId("item-b")).toBeInTheDocument();
		expect(screen.getByTestId("item-c")).toBeInTheDocument();
		expect(screen.getByText("Todo item")).toBeInTheDocument();
		expect(screen.getByText("In progress item")).toBeInTheDocument();
		expect(screen.getByText("Done item")).toBeInTheDocument();
	});

	it("defaults null status to todo column", () => {
		renderWithUser(
			<KanbanBoard
				items={[
					makeItem({
						_id: "x" as Id<"items">,
						name: "No status",
						status: undefined,
					}),
				]}
				tagMap={new Map()}
				listType="kanban"
				activeItemId={null}
				onActivate={mockOnActivate}
				onToggleComplete={mockOnToggleComplete}
				onUpdateStatus={mockOnUpdateStatus}
				onIncrementValue={mockOnIncrementValue}
				onEdit={mockOnEdit}
				onDuplicate={mockOnDuplicate}
				onDelete={mockOnDelete}
			/>,
		);
		const todoColumn = screen.getByTestId("kanban-column-todo");
		expect(todoColumn).toContainElement(screen.getByTestId("item-x"));
	});

	it("shows empty state for columns with no items", () => {
		renderWithUser(
			<KanbanBoard
				items={[]}
				tagMap={new Map()}
				listType="kanban"
				activeItemId={null}
				onActivate={mockOnActivate}
				onToggleComplete={mockOnToggleComplete}
				onUpdateStatus={mockOnUpdateStatus}
				onIncrementValue={mockOnIncrementValue}
				onEdit={mockOnEdit}
				onDuplicate={mockOnDuplicate}
				onDelete={mockOnDelete}
			/>,
		);
		expect(screen.getByTestId("kanban-empty-todo")).toHaveTextContent(
			STATUS_META.todo.emptyText,
		);
		expect(screen.getByTestId("kanban-empty-in_progress")).toHaveTextContent(
			STATUS_META.in_progress.emptyText,
		);
		expect(screen.getByTestId("kanban-empty-done")).toHaveTextContent(
			STATUS_META.done.emptyText,
		);
	});

	it("shows correct count badges per column", () => {
		renderWithUser(
			<KanbanBoard
				items={[
					makeItem({ _id: "a" as Id<"items">, status: "todo" }),
					makeItem({ _id: "b" as Id<"items">, status: "todo" }),
					makeItem({ _id: "c" as Id<"items">, status: "in_progress" }),
				]}
				tagMap={new Map()}
				listType="kanban"
				activeItemId={null}
				onActivate={mockOnActivate}
				onToggleComplete={mockOnToggleComplete}
				onUpdateStatus={mockOnUpdateStatus}
				onIncrementValue={mockOnIncrementValue}
				onEdit={mockOnEdit}
				onDuplicate={mockOnDuplicate}
				onDelete={mockOnDelete}
			/>,
		);
		expect(screen.getByTestId("kanban-count-todo")).toHaveTextContent("2");
		expect(screen.getByTestId("kanban-count-in_progress")).toHaveTextContent(
			"1",
		);
		expect(screen.getByTestId("kanban-count-done")).toHaveTextContent("0");
	});
});
