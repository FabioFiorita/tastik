import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@/test-utils";

vi.mock("@/lib/metrics", () => ({
	trackListDeleted: vi.fn(),
}));

import type { Id } from "../../../convex/_generated/dataModel";
import { useDeleteList } from "./use-delete-list";

vi.mock("convex/react", () => {
	const mockMutation = vi.fn();
	return { useMutation: () => mockMutation, __mockMutation: mockMutation };
});

vi.mock("sonner", () => {
	const mockToastSuccess = vi.fn();
	const mockToastError = vi.fn();
	return {
		toast: { success: mockToastSuccess, error: mockToastError },
		__mocks: { mockToastSuccess, mockToastError },
	};
});

const convexReact = await import("convex/react");
const sonner = await import("sonner");
const mockMutation = (
	convexReact as unknown as { __mockMutation: ReturnType<typeof vi.fn> }
).__mockMutation;
const { mockToastSuccess, mockToastError } = (
	sonner as unknown as {
		__mocks: {
			mockToastSuccess: ReturnType<typeof vi.fn>;
			mockToastError: ReturnType<typeof vi.fn>;
		};
	}
).__mocks;

describe("use-delete-list", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns true and shows success toast when delete succeeds", async () => {
		vi.mocked(mockMutation).mockResolvedValue(undefined);
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
		vi.mocked(mockMutation).mockRejectedValue(new Error("boom"));
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
