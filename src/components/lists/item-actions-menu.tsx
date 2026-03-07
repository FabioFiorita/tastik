import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/cn";

type ItemActionsMenuProps = {
	itemId: string;
	onEdit: () => void;
	onDuplicate: () => void;
	onDelete: () => void;
};

export function ItemActionsMenu({
	itemId,
	onEdit,
	onDuplicate,
	onDelete,
}: ItemActionsMenuProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className={cn(
					buttonVariants({ variant: "ghost", size: "icon" }),
					"size-7",
				)}
				data-testid={`item-actions-${itemId}`}
			>
				<MoreHorizontal className="size-4" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-44">
				<DropdownMenuItem onClick={onEdit} data-testid={`edit-item-${itemId}`}>
					<Pencil className="mr-2 size-4" />
					Edit
					<DropdownMenuShortcut>E</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={onDuplicate}
					data-testid={`duplicate-item-${itemId}`}
				>
					<Copy className="mr-2 size-4" />
					Duplicate
					<DropdownMenuShortcut>D</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={onDelete}
					className="text-destructive"
					data-testid={`delete-item-${itemId}`}
				>
					<Trash2 className="mr-2 size-4" />
					Delete
					<DropdownMenuShortcut>⌫</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
