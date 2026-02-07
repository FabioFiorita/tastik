import { useForm } from "@tanstack/react-form";
import type { ReactElement } from "react";
import { useState } from "react";
import {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogFooter,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
	ResponsiveDialogTrigger,
} from "@/components/common/responsive-dialog";
import { CreateListFormFields } from "@/components/lists/create-list-form-fields";
import { Button } from "@/components/ui/button";
import { useCreateList } from "@/hooks/actions/use-create-list";
import {
	createListFormDefaults,
	validateCreateListName,
} from "@/lib/validation/create-list-form";

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
	const { createList, isPending } = useCreateList();

	const form = useForm({
		defaultValues: createListFormDefaults,
		validators: {
			onChange: ({ value }) => {
				const nameError = validateCreateListName(value.name);
				if (nameError) return { name: nameError };
				return undefined;
			},
		},
		onSubmit: async ({ value }) => {
			const listId = await createList({
				name: value.name,
				type: value.type,
				icon: value.icon,
			});
			if (listId !== undefined) {
				setOpen(false);
			}
		},
	});

	return (
		<ResponsiveDialog open={open} onOpenChange={setOpen}>
			<ResponsiveDialogTrigger render={trigger} />
			<ResponsiveDialogContent>
				<ResponsiveDialogHeader>
					<ResponsiveDialogTitle>Create New List</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						Create a new list to organize your tasks and items.
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>
				<form
					id="create-list-form"
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
				<ResponsiveDialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => setOpen(false)}
						data-testid="create-list-cancel"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						form="create-list-form"
						disabled={isPending}
						data-testid="create-list-submit"
					>
						Create List
					</Button>
				</ResponsiveDialogFooter>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
