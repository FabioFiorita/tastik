import { useState } from "react";
import { vi } from "vitest";
import { mockReactRouter } from "@/lib/helpers/mocks";
import { renderWithUser, screen, waitFor } from "@/test-utils";
import type { Id } from "../../../convex/_generated/dataModel";
import { ListActionsMenu } from "./list-actions-menu";

const mockArchiveList = vi.fn();
const mockDeleteList = vi.fn();
const mockDuplicateList = vi.fn();
const mockExportList = vi.fn();
const mockLeaveList = vi.fn();

let isArchiving = false;
let isDeleting = false;
let isDuplicating = false;
let isExporting = false;
let isLeaving = false;

vi.mock("@/hooks/use-keyboard-shortcut", () => ({
	useKeyboardShortcut: () => {},
}));

vi.mock("@/hooks/actions/use-archive-list", () => ({
	useArchiveList: () => ({
		archiveList: mockArchiveList,
		isPending: isArchiving,
	}),
}));

vi.mock("@/hooks/actions/use-delete-list", () => ({
	useDeleteList: () => ({
		deleteList: mockDeleteList,
		isPending: isDeleting,
	}),
}));

vi.mock("@/hooks/actions/use-duplicate-list", () => ({
	useDuplicateList: () => ({
		duplicateList: mockDuplicateList,
		isPending: isDuplicating,
	}),
}));

vi.mock("@/hooks/actions/use-export-list", () => ({
	useExportList: () => ({
		exportList: mockExportList,
		isPending: isExporting,
	}),
}));

vi.mock("@/hooks/actions/use-leave-list", () => ({
	useLeaveList: () => ({
		leaveList: mockLeaveList,
		isPending: isLeaving,
	}),
}));

function ListActionsMenuHarness({
	listId,
	listName,
	isOwner,
}: {
	listId: Id<"lists">;
	listName: string;
	isOwner: boolean;
}) {
	const [open, setOpen] = useState(false);

	return (
		<ListActionsMenu
			listId={listId}
			listName={listName}
			isOwner={isOwner}
			open={open}
			onOpenChange={setOpen}
			onOpenDialog={() => {}}
		/>
	);
}

describe("list-actions-menu", () => {
	beforeEach(() => {
		mockArchiveList.mockReset();
		mockDeleteList.mockReset();
		mockDuplicateList.mockReset();
		mockExportList.mockReset();
		mockLeaveList.mockReset();
		mockDeleteList.mockResolvedValue(true);
		mockLeaveList.mockResolvedValue(true);

		isArchiving = false;
		isDeleting = false;
		isDuplicating = false;
		isExporting = false;
		isLeaving = false;

		const router = mockReactRouter();
		router.mockNavigate.mockReset();
	});

	it("shows leave list action for editors and triggers leave flow", async () => {
		const listId = "list_editor_1" as Id<"lists">;
		const { user } = renderWithUser(
			<ListActionsMenuHarness
				listId={listId}
				listName="Shared List"
				isOwner={false}
			/>,
		);

		await user.click(screen.getByTestId("list-actions-trigger"));
		expect(screen.getByTestId("leave-list-item")).toBeInTheDocument();
		expect(screen.queryByTestId("delete-list-item")).not.toBeInTheDocument();

		await user.click(screen.getByTestId("leave-list-item"));
		await user.click(screen.getByTestId("leave-list-confirm"));

		await waitFor(() => expect(mockLeaveList).toHaveBeenCalledWith({ listId }));
	});

	it("disables duplicate action while duplication is pending", async () => {
		isDuplicating = true;
		const listId = "list_owner_1" as Id<"lists">;
		const { user } = renderWithUser(
			<ListActionsMenuHarness
				listId={listId}
				listName="Owner List"
				isOwner={true}
			/>,
		);

		await user.click(screen.getByTestId("list-actions-trigger"));
		expect(screen.getByTestId("duplicate-list-item")).toHaveAttribute(
			"data-disabled",
		);
	});

	it("navigates after delete only when deletion succeeds", async () => {
		const router = mockReactRouter();
		mockDeleteList.mockResolvedValueOnce(false);
		const listId = "list_owner_2" as Id<"lists">;

		const { user } = renderWithUser(
			<ListActionsMenuHarness
				listId={listId}
				listName="Owner List"
				isOwner={true}
			/>,
		);

		await user.click(screen.getByTestId("list-actions-trigger"));
		await user.click(screen.getByTestId("delete-list-item"));
		await user.click(screen.getByTestId("delete-confirm"));

		await waitFor(() =>
			expect(mockDeleteList).toHaveBeenCalledWith({ listId }),
		);
		expect(router.mockNavigate).not.toHaveBeenCalled();

		mockDeleteList.mockResolvedValueOnce(true);
		await user.click(screen.getByTestId("list-actions-trigger"));
		await user.click(screen.getByTestId("delete-list-item"));
		await user.click(screen.getByTestId("delete-confirm"));

		await waitFor(() =>
			expect(router.mockNavigate).toHaveBeenCalledWith({
				to: "/home",
				replace: true,
			}),
		);
	});
});
