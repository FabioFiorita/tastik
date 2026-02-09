import type { ReactElement } from "react";
import { useState } from "react";
import { ListFormDialog } from "@/components/lists/list-form-dialog";
import type { ListType } from "@/lib/types/list-type";
import type { Id } from "../../../convex/_generated/dataModel";

type EditListDialogProps = {
	listId: Id<"lists">;
	initialValues: { name: string; type: ListType; icon: string };
	trigger?: ReactElement;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
};

export function EditListDialog({
	listId,
	initialValues,
	trigger,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
}: EditListDialogProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const open = controlledOpen ?? internalOpen;
	const setOpen = controlledOnOpenChange ?? setInternalOpen;

	return (
		<ListFormDialog
			mode="edit"
			listId={listId}
			initialValues={initialValues}
			open={open}
			onOpenChange={setOpen}
			trigger={trigger}
		/>
	);
}
