import { useNavigate } from "@tanstack/react-router";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteList } from "@/hooks/actions/use-delete-list";
import type { Id } from "../../../convex/_generated/dataModel";

interface DeleteListAlertDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	listId: Id<"lists">;
}

export function DeleteListAlertDialog({
	open,
	onOpenChange,
	listId,
}: DeleteListAlertDialogProps) {
	const navigate = useNavigate();
	const { deleteList } = useDeleteList();

	const handleConfirm = async () => {
		navigate({ to: "/", replace: true });
		await deleteList({ listId });
		onOpenChange(false);
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete list?</AlertDialogTitle>
					<AlertDialogDescription>
						This cannot be undone. All items and tags will be removed.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={handleConfirm}
						data-testid="delete-confirm"
					>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
