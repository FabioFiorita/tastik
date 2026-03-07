import { useNavigate } from "@tanstack/react-router";
import {
	Archive,
	Copy,
	Download,
	LogOut,
	MoreVertical,
	Pencil,
	Share2,
	Tag,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useArchiveList } from "@/hooks/actions/use-archive-list";
import { useDeleteList } from "@/hooks/actions/use-delete-list";
import { useDuplicateList } from "@/hooks/actions/use-duplicate-list";
import { useExportList } from "@/hooks/actions/use-export-list";
import { useLeaveList } from "@/hooks/actions/use-leave-list";
import { useKeyboardShortcut } from "@/hooks/ui/use-keyboard-shortcut";
import { LIST_EXPORT_FORMATS } from "@/lib/constants/list-export-formats";
import { cn } from "@/lib/utils/cn";
import type { Id } from "../../../convex/_generated/dataModel";

interface ListActionsMenuProps {
	listId: Id<"lists">;
	listName: string;
	isOwner: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onOpenDialog: (dialog: "edit" | "share" | "tags") => void;
}

export function ListActionsMenu({
	listId,
	listName,
	isOwner,
	open,
	onOpenChange,
	onOpenDialog,
}: ListActionsMenuProps) {
	const navigate = useNavigate();
	const { archiveList, isPending: isArchiving } = useArchiveList();
	const { deleteList, isPending: isDeleting } = useDeleteList();
	const { duplicateList, isPending: isDuplicating } = useDuplicateList();
	const { leaveList, isPending: isLeaving } = useLeaveList();
	const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
	const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
	const { exportList, isPending: isExporting } = useExportList(
		listId,
		listName,
	);

	useKeyboardShortcut("a", () => onOpenChange(true));

	const openDialog = (dialog: "edit" | "share" | "tags") => {
		onOpenDialog(dialog);
		onOpenChange(false);
	};

	const openArchiveDialog = () => {
		setArchiveDialogOpen(true);
		onOpenChange(false);
	};

	const openDuplicateDialog = () => {
		setDuplicateDialogOpen(true);
		onOpenChange(false);
	};

	const openDeleteDialog = () => {
		setDeleteDialogOpen(true);
		onOpenChange(false);
	};

	const openLeaveDialog = () => {
		setLeaveDialogOpen(true);
		onOpenChange(false);
	};

	const handleExport = (format: "txt" | "md" | "csv") => {
		exportList(format);
		onOpenChange(false);
	};

	return (
		<>
			<DropdownMenu open={open} onOpenChange={onOpenChange}>
				<DropdownMenuTrigger
					className={cn(
						buttonVariants({ variant: "outline" }),
						"text-muted-foreground",
					)}
					aria-label="List actions"
					data-testid="list-actions-trigger"
				>
					<MoreVertical className="size-4" />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-40">
					<DropdownMenuItem
						onClick={openDuplicateDialog}
						disabled={isDuplicating}
						data-testid="duplicate-list-item"
					>
						<Copy className="mr-2 size-4" />
						Duplicate
					</DropdownMenuItem>

					{isOwner && (
						<>
							<DropdownMenuItem
								onClick={() => openDialog("edit")}
								data-testid="edit-list-item"
							>
								<Pencil className="mr-2 size-4" />
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => openDialog("share")}
								data-testid="share-list-item"
							>
								<Share2 className="mr-2 size-4" />
								Share
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => openDialog("tags")}
								data-testid="manage-tags-item"
							>
								<Tag className="mr-2 size-4" />
								Tags
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={openArchiveDialog}
								data-testid="archive-list-item"
							>
								<Archive className="mr-2 size-4" />
								Archive
							</DropdownMenuItem>
						</>
					)}

					<DropdownMenuSub>
						<DropdownMenuSubTrigger data-testid="export-list-trigger">
							<Download className="mr-2 size-4" />
							Export
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent>
							{LIST_EXPORT_FORMATS.map(({ format, label }) => (
								<DropdownMenuItem
									key={format}
									onClick={() => handleExport(format)}
									disabled={isExporting}
									data-testid={`export-${format}`}
								>
									{label}
								</DropdownMenuItem>
							))}
						</DropdownMenuSubContent>
					</DropdownMenuSub>

					<DropdownMenuSeparator />

					{!isOwner && (
						<DropdownMenuItem
							onClick={openLeaveDialog}
							disabled={isLeaving}
							data-testid="leave-list-item"
						>
							<LogOut className="size-4" />
							Leave list
						</DropdownMenuItem>
					)}

					{isOwner && (
						<DropdownMenuItem
							variant="destructive"
							onClick={openDeleteDialog}
							data-testid="delete-list-item"
						>
							<Trash2 className="size-4" />
							Delete
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			<ConfirmDialog
				open={archiveDialogOpen}
				onOpenChange={setArchiveDialogOpen}
				title="Archive list?"
				description="This list will be moved to the archive. You can restore it anytime."
				confirmLabel="Archive"
				onConfirm={() => archiveList({ listId })}
				testId="archive-confirm"
				disabled={isArchiving}
			/>
			<ConfirmDialog
				open={duplicateDialogOpen}
				onOpenChange={setDuplicateDialogOpen}
				title="Duplicate list?"
				description="A copy of this list will be created."
				confirmLabel={isDuplicating ? "Duplicating..." : "Duplicate"}
				onConfirm={() => duplicateList({ listId })}
				testId="duplicate-confirm"
				disabled={isDuplicating}
			/>
			<ConfirmDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete list?"
				description="This cannot be undone. All items and tags will be removed."
				confirmLabel={isDeleting ? "Deleting..." : "Delete"}
				onConfirm={async () => {
					const deleted = await deleteList({ listId });
					if (deleted) {
						navigate({ to: "/home", replace: true });
					}
				}}
				variant="destructive"
				testId="delete-confirm"
				disabled={isDeleting}
			/>
			<ConfirmDialog
				open={leaveDialogOpen}
				onOpenChange={setLeaveDialogOpen}
				title="Leave list?"
				description="You will lose access to this shared list immediately."
				confirmLabel={isLeaving ? "Leaving..." : "Leave list"}
				onConfirm={() => leaveList({ listId })}
				variant="destructive"
				testId="leave-list-confirm"
				disabled={isLeaving}
			/>
		</>
	);
}
