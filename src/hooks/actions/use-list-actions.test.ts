import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockReactRouter } from "@/lib/helpers/mocks";
import { renderHook } from "@/test-utils";
import type { Id } from "../../../convex/_generated/dataModel";
import { useListActions } from "./use-list-actions";

const mockToggleItemComplete = vi.fn();
const mockDeleteItem = vi.fn();
const mockDeleteList = vi.fn();
const mockIncrementValue = vi.fn();
const mockUpdateStatus = vi.fn();

vi.mock("./use-toggle-item-complete", () => ({
	useToggleItemComplete: () => ({
		toggleItemComplete: mockToggleItemComplete,
		isPending: false,
	}),
}));

vi.mock("./use-delete-item", () => ({
	useDeleteItem: () => ({
		deleteItem: mockDeleteItem,
		isPending: false,
	}),
}));

vi.mock("./use-delete-list", () => ({
	useDeleteList: () => ({
		deleteList: mockDeleteList,
		isPending: false,
	}),
}));

vi.mock("./use-increment-item-value", () => ({
	useIncrementItemValue: () => ({
		incrementValue: mockIncrementValue,
		isPending: false,
	}),
}));

vi.mock("./use-update-item-status", () => ({
	useUpdateItemStatus: () => ({
		updateStatus: mockUpdateStatus,
		isPending: false,
	}),
}));

describe("use-list-actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockReactRouter({ navigate: vi.fn() });
		vi.stubGlobal(
			"confirm",
			vi.fn(() => true),
		);
	});

	it("does not delete when listId is undefined", async () => {
		const { result } = renderHook(() => useListActions(undefined));
		await result.current.handleDeleteList();
		expect(mockDeleteList).not.toHaveBeenCalled();
	});

	it("does not delete when confirmation is canceled", async () => {
		vi.stubGlobal(
			"confirm",
			vi.fn(() => false),
		);
		const { result } = renderHook(() =>
			useListActions("list123" as Id<"lists">),
		);
		await result.current.handleDeleteList();
		expect(mockDeleteList).not.toHaveBeenCalled();
	});

	it("navigates before deleting list", async () => {
		const mockNavigate = vi.fn();
		mockReactRouter({ navigate: mockNavigate });
		mockDeleteList.mockResolvedValue(true);

		const { result } = renderHook(() =>
			useListActions("list123" as Id<"lists">),
		);
		await result.current.handleDeleteList();

		expect(mockNavigate).toHaveBeenCalledWith({ to: "/", replace: true });
		expect(mockDeleteList).toHaveBeenCalledWith({
			listId: "list123" as Id<"lists">,
		});
		expect(mockNavigate.mock.invocationCallOrder[0]).toBeLessThan(
			mockDeleteList.mock.invocationCallOrder[0],
		);
	});
});
