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
import { useRemoveListEditor } from "@/hooks/actions/use-remove-list-editor";
import type { Id } from "../../../convex/_generated/dataModel";

interface RemoveEditorAlertDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editorId: Id<"listEditors">;
	editorName: string;
}

export function RemoveEditorAlertDialog({
	open,
	onOpenChange,
	editorId,
	editorName,
}: RemoveEditorAlertDialogProps) {
	const { removeEditor } = useRemoveListEditor();

	const handleConfirm = async () => {
		await removeEditor({ editorId });
		onOpenChange(false);
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Remove editor?</AlertDialogTitle>
					<AlertDialogDescription>
						{editorName} will lose access to this list.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={handleConfirm}
						data-testid="remove-editor-confirm"
					>
						Remove
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
