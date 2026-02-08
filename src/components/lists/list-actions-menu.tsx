import {
	Copy,
	Download,
	MoreVertical,
	Pencil,
	Share2,
	Tag,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { DeleteListAlertDialog } from "@/components/lists/delete-list-alert-dialog";
import { DuplicateListAlertDialog } from "@/components/lists/duplicate-list-alert-dialog";
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
import { useExportList } from "@/hooks/actions/use-export-list";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
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
	const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const { exportList, isPending: isExporting } = useExportList(
		listId,
		listName,
	);

	useKeyboardShortcut("a", () => onOpenChange(true));

	const openDialog = (dialog: "edit" | "share" | "tags") => {
		onOpenDialog(dialog);
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
				<DropdownMenuContent align="end" className="w-48">
					<DropdownMenuItem
						onClick={openDuplicateDialog}
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
								Edit Details
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
								Manage Tags
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

					{isOwner && (
						<DropdownMenuItem
							variant="destructive"
							onClick={openDeleteDialog}
							data-testid="delete-list-item"
						>
							<Trash2 className="size-4" />
							Delete List
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			<DuplicateListAlertDialog
				open={duplicateDialogOpen}
				onOpenChange={setDuplicateDialogOpen}
				listId={listId}
			/>
			<DeleteListAlertDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				listId={listId}
			/>
		</>
	);
}
