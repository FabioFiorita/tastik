import { useForm } from "@tanstack/react-form";
import type { ReactElement } from "react";
import { useState } from "react";
import { FormDialog } from "@/components/common/form-dialog";
import { CreateListFormFields } from "@/components/lists/create-list-form-fields";
import { useCreateList } from "@/hooks/actions/use-create-list";
import { useUpdateList } from "@/hooks/actions/use-update-list";
import type { ListType } from "@/lib/types/list-type";
import {
	createListFormDefaults,
	validateCreateListName,
} from "@/lib/validation/create-list-form";
import type { Id } from "../../../convex/_generated/dataModel";

type ListFormDialogProps = {
	mode: "create" | "edit";
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	listId?: Id<"lists">;
	initialValues?: { name: string; type: ListType; icon: string };
	trigger?: ReactElement;
};

export function ListFormDialog({
	mode,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
	listId,
	initialValues,
	trigger,
}: ListFormDialogProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const open = controlledOpen ?? internalOpen;
	const onOpenChange = controlledOnOpenChange ?? setInternalOpen;
	const { createList, isPending: isCreatePending } = useCreateList();
	const { updateList, isPending: isUpdatePending } = useUpdateList();
	const isPending = mode === "create" ? isCreatePending : isUpdatePending;

	const defaultValues =
		mode === "edit" && initialValues ? initialValues : createListFormDefaults;

	const form = useForm({
		defaultValues,
		validators: {
			onChange: ({ value }) => {
				const nameError = validateCreateListName(value.name);
				if (nameError) return { name: nameError };
				return undefined;
			},
		},
		onSubmit: async ({ value }) => {
			if (mode === "create") {
				const newListId = await createList({
					name: value.name,
					type: value.type,
					icon: value.icon,
				});
				if (newListId !== undefined) {
					onOpenChange(false);
				}
			} else if (listId) {
				const success = await updateList({
					listId,
					name: value.name,
					type: value.type,
					icon: value.icon,
				});
				if (success) {
					onOpenChange(false);
				}
			}
		},
	});

	const title = mode === "create" ? "Create New List" : "Edit List";
	const description =
		mode === "create"
			? "Create a new list to organize your tasks and items."
			: "Update your list details.";
	const submitLabel = mode === "create" ? "Create List" : "Save Changes";

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			trigger={trigger}
			title={title}
			description={description}
			formId="list-form"
			submitLabel={submitLabel}
			isPending={isPending}
			cancelTestId={
				mode === "create" ? "create-list-cancel" : "edit-list-cancel"
			}
			submitTestId={
				mode === "create" ? "create-list-submit" : "edit-list-submit"
			}
		>
			<form
				id="list-form"
				onSubmit={(e: React.SyntheticEvent<HTMLFormElement>) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<CreateListFormFields
					form={
						form as {
							Field: (props: {
								name: "name" | "type" | "icon";
								children: (field: unknown) => React.ReactNode;
							}) => React.ReactNode;
						}
					}
				/>
			</form>
		</FormDialog>
	);
}
