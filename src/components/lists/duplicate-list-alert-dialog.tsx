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
import { useDuplicateList } from "@/hooks/actions/use-duplicate-list";
import type { Id } from "../../../convex/_generated/dataModel";

interface DuplicateListAlertDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	listId: Id<"lists">;
}

export function DuplicateListAlertDialog({
	open,
	onOpenChange,
	listId,
}: DuplicateListAlertDialogProps) {
	const { duplicateList } = useDuplicateList();

	const handleConfirm = async () => {
		await duplicateList({ listId });
		onOpenChange(false);
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Duplicate list?</AlertDialogTitle>
					<AlertDialogDescription>
						A copy of this list will be created.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						data-testid="duplicate-confirm"
					>
						Duplicate
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
