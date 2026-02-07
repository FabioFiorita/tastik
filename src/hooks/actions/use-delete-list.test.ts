import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@/test-utils";
import type { Id } from "../../../convex/_generated/dataModel";
import { useDeleteList } from "./use-delete-list";

const { mockMutation, mockToastSuccess, mockToastError } = vi.hoisted(() => ({
	mockMutation: vi.fn(),
	mockToastSuccess: vi.fn(),
	mockToastError: vi.fn(),
}));

vi.mock("convex/react", () => ({
	useMutation: () => mockMutation,
}));

vi.mock("sonner", () => ({
	toast: {
		success: mockToastSuccess,
		error: mockToastError,
	},
}));

describe("use-delete-list", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns true and shows success toast when delete succeeds", async () => {
		mockMutation.mockResolvedValue(undefined);
		const { result } = renderHook(() => useDeleteList());

		let success = false;
		await act(async () => {
			success = await result.current.deleteList({
				listId: "list123" as Id<"lists">,
			});
		});

		expect(success).toBe(true);
		expect(mockToastSuccess).toHaveBeenCalledWith("List deleted");
		expect(mockToastError).not.toHaveBeenCalled();
	});

	it("returns false and shows error toast when delete fails", async () => {
		mockMutation.mockRejectedValue(new Error("boom"));
		const { result } = renderHook(() => useDeleteList());

		let success = true;
		await act(async () => {
			success = await result.current.deleteList({
				listId: "list123" as Id<"lists">,
			});
		});

		expect(success).toBe(false);
		expect(mockToastError).toHaveBeenCalledWith("Failed to delete list");
		expect(mockToastSuccess).not.toHaveBeenCalled();
	});
});
