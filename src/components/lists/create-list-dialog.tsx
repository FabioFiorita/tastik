import type { ReactElement } from "react";
import { useState } from "react";
import { ListFormDialog } from "@/components/lists/list-form-dialog";

type CreateListDialogProps = {
	trigger: ReactElement;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
};

export function CreateListDialog({
	trigger,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
}: CreateListDialogProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const open = controlledOpen ?? internalOpen;
	const setOpen = controlledOnOpenChange ?? setInternalOpen;

	return (
		<ListFormDialog
			mode="create"
			open={open}
			onOpenChange={setOpen}
			trigger={trigger}
		/>
	);
}
