import { useState } from "react";
import { vi } from "vitest";
import { mockReactRouter } from "@/lib/helpers/mocks";
import { renderWithUser, screen, waitFor } from "@/test-utils";
import type { Id } from "../../../convex/_generated/dataModel";
import { ListActionsMenu } from "./list-actions-menu";

vi.mock("@/hooks/ui/use-keyboard-shortcut", () => ({
	useKeyboardShortcut: () => {},
}));

vi.mock("@/hooks/actions/use-archive-list", () => {
	const archiveList = vi.fn();
	const useArchiveList = vi.fn(() => ({ archiveList, isPending: false }));
	return { useArchiveList, __mocks: { archiveList, useArchiveList } };
});

vi.mock("@/hooks/actions/use-delete-list", () => {
	const deleteList = vi.fn();
	const useDeleteList = vi.fn(() => ({ deleteList, isPending: false }));
	return { useDeleteList, __mocks: { deleteList, useDeleteList } };
});

vi.mock("@/hooks/actions/use-duplicate-list", () => {
	const duplicateList = vi.fn();
	const useDuplicateList = vi.fn(() => ({
		duplicateList,
		isPending: false,
	}));
	return { useDuplicateList, __mocks: { duplicateList, useDuplicateList } };
});

vi.mock("@/hooks/actions/use-export-list", () => {
	const exportList = vi.fn();
	const useExportList = vi.fn(() => ({ exportList, isPending: false }));
	return { useExportList, __mocks: { exportList, useExportList } };
});

vi.mock("@/hooks/actions/use-leave-list", () => {
	const leaveList = vi.fn();
	const useLeaveList = vi.fn(() => ({ leaveList, isPending: false }));
	return { useLeaveList, __mocks: { leaveList, useLeaveList } };
});

type MockModule<T extends object> = T & {
	__mocks: Record<string, ReturnType<typeof vi.fn>>;
};

const { __mocks: archiveMocks } = (await import(
	"@/hooks/actions/use-archive-list"
)) as unknown as MockModule<{ useArchiveList: unknown }>;

const { __mocks: deleteMocks } = (await import(
	"@/hooks/actions/use-delete-list"
)) as unknown as MockModule<{ useDeleteList: unknown }>;

const { __mocks: duplicateMocks } = (await import(
	"@/hooks/actions/use-duplicate-list"
)) as unknown as MockModule<{ useDuplicateList: unknown }>;

const { __mocks: leaveMocks } = (await import(
	"@/hooks/actions/use-leave-list"
)) as unknown as MockModule<{ useLeaveList: unknown }>;

function ListActionsMenuHarness({
	listId,
	listName,
	isOwner,
	onOpenDialog = () => {},
}: {
	listId: Id<"lists">;
	listName: string;
	isOwner: boolean;
	onOpenDialog?: (dialog: "edit" | "share" | "tags") => void;
}) {
	const [open, setOpen] = useState(false);

	return (
		<ListActionsMenu
			listId={listId}
			listName={listName}
			isOwner={isOwner}
			open={open}
			onOpenChange={setOpen}
			onOpenDialog={onOpenDialog}
		/>
	);
}

describe("list-actions-menu", () => {
	beforeEach(() => {
		vi.mocked(archiveMocks.useArchiveList).mockReturnValue({
			archiveList: archiveMocks.archiveList,
			isPending: false,
		});
		vi.mocked(deleteMocks.useDeleteList).mockReturnValue({
			deleteList: deleteMocks.deleteList,
			isPending: false,
		});
		vi.mocked(duplicateMocks.useDuplicateList).mockReturnValue({
			duplicateList: duplicateMocks.duplicateList,
			isPending: false,
		});
		vi.mocked(leaveMocks.useLeaveList).mockReturnValue({
			leaveList: leaveMocks.leaveList,
			isPending: false,
		});

		vi.mocked(deleteMocks.deleteList).mockResolvedValue(true);
		vi.mocked(leaveMocks.leaveList).mockResolvedValue(true);

		archiveMocks.archiveList.mockResolvedValue(undefined);
		duplicateMocks.duplicateList.mockResolvedValue(undefined);

		mockReactRouter().mockNavigate.mockReset();
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

		await waitFor(() =>
			expect(leaveMocks.leaveList).toHaveBeenCalledWith({ listId }),
		);
	});

	it("disables duplicate action while duplication is pending", async () => {
		vi.mocked(duplicateMocks.useDuplicateList).mockReturnValue({
			duplicateList: duplicateMocks.duplicateList,
			isPending: true,
		});

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
		vi.mocked(deleteMocks.deleteList).mockResolvedValueOnce(false);
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
			expect(deleteMocks.deleteList).toHaveBeenCalledWith({ listId }),
		);
		expect(router.mockNavigate).not.toHaveBeenCalled();

		vi.mocked(deleteMocks.deleteList).mockResolvedValueOnce(true);
		await user.click(screen.getByTestId("list-actions-trigger"));
		await user.click(screen.getByTestId("delete-list-item"));
		await user.click(screen.getByTestId("delete-confirm"));

		await waitFor(() =>
			expect(mockReactRouter().mockNavigate).toHaveBeenCalledWith({
				to: "/home",
				replace: true,
			}),
		);
	});

	it("calls onOpenDialog with edit when owner clicks edit", async () => {
		const onOpenDialog = vi.fn();
		const listId = "list_owner_3" as Id<"lists">;
		const { user } = renderWithUser(
			<ListActionsMenuHarness
				listId={listId}
				listName="Owner List"
				isOwner={true}
				onOpenDialog={onOpenDialog}
			/>,
		);

		await user.click(screen.getByTestId("list-actions-trigger"));
		await user.click(screen.getByTestId("edit-list-item"));

		expect(onOpenDialog).toHaveBeenCalledWith("edit");
	});

	it("calls onOpenDialog with share when owner clicks share", async () => {
		const onOpenDialog = vi.fn();
		const listId = "list_owner_4" as Id<"lists">;
		const { user } = renderWithUser(
			<ListActionsMenuHarness
				listId={listId}
				listName="Owner List"
				isOwner={true}
				onOpenDialog={onOpenDialog}
			/>,
		);

		await user.click(screen.getByTestId("list-actions-trigger"));
		await user.click(screen.getByTestId("share-list-item"));

		expect(onOpenDialog).toHaveBeenCalledWith("share");
	});

	it("calls onOpenDialog with tags when owner clicks tags", async () => {
		const onOpenDialog = vi.fn();
		const listId = "list_owner_5" as Id<"lists">;
		const { user } = renderWithUser(
			<ListActionsMenuHarness
				listId={listId}
				listName="Owner List"
				isOwner={true}
				onOpenDialog={onOpenDialog}
			/>,
		);

		await user.click(screen.getByTestId("list-actions-trigger"));
		await user.click(screen.getByTestId("manage-tags-item"));

		expect(onOpenDialog).toHaveBeenCalledWith("tags");
	});

	it("archives list when owner confirms archive dialog", async () => {
		const listId = "list_owner_6" as Id<"lists">;
		const { user } = renderWithUser(
			<ListActionsMenuHarness
				listId={listId}
				listName="Owner List"
				isOwner={true}
			/>,
		);

		await user.click(screen.getByTestId("list-actions-trigger"));
		await user.click(screen.getByTestId("archive-list-item"));
		await user.click(screen.getByTestId("archive-confirm"));

		await waitFor(() =>
			expect(archiveMocks.archiveList).toHaveBeenCalledWith({ listId }),
		);
	});

	it("duplicates list when owner confirms duplicate dialog", async () => {
		const listId = "list_owner_7" as Id<"lists">;
		const { user } = renderWithUser(
			<ListActionsMenuHarness
				listId={listId}
				listName="Owner List"
				isOwner={true}
			/>,
		);

		await user.click(screen.getByTestId("list-actions-trigger"));
		await user.click(screen.getByTestId("duplicate-list-item"));
		await user.click(screen.getByTestId("duplicate-confirm"));

		await waitFor(() =>
			expect(duplicateMocks.duplicateList).toHaveBeenCalledWith({ listId }),
		);
	});
});
