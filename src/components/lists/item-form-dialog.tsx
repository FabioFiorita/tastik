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
import { ItemFormFields } from "@/components/lists/item-form-fields";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useCreateItem } from "@/hooks/actions/use-create-item";
import { useUpdateItem } from "@/hooks/actions/use-update-item";
import type { ItemStatus } from "@/lib/types/item-status";
import type { ItemType } from "@/lib/types/item-type";
import type { ListType } from "@/lib/types/list-type";
import {
	itemFormDefaults,
	validateCalculatorValue,
	validateCurrentValue,
	validateItemDescription,
	validateItemName,
	validateItemUrl,
	validateStep,
} from "@/lib/validation/item-form";
import type { Id } from "../../../convex/_generated/dataModel";

type ItemFormValues = {
	name: string;
	description: string;
	url: string;
	tagId: string;
	itemType: ItemType;
	step: string;
	currentValue: string;
	calculatorValue: string;
	status: ItemStatus;
};

type ItemFormDialogProps = {
	mode: "create" | "edit";
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	listId: Id<"lists">;
	listType: ListType;
	itemId?: Id<"items">;
	initialValues?: ItemFormValues;
	trigger?: ReactElement;
};

function getEffectiveItemType(
	listType: ListType,
	formItemType: ItemType,
): ItemType {
	if (listType === "multi") return formItemType;
	if (listType === "simple") return "simple";
	return listType as ItemType;
}

export function ItemFormDialog({
	mode,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
	listId,
	listType,
	itemId,
	initialValues,
	trigger,
}: ItemFormDialogProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const open = controlledOpen ?? internalOpen;
	const onOpenChange = controlledOnOpenChange ?? setInternalOpen;

	const { createItem, isPending: isCreatePending } = useCreateItem();
	const { updateItem, isPending: isUpdatePending } = useUpdateItem();
	const isPending = mode === "create" ? isCreatePending : isUpdatePending;
	const [createAnother, setCreateAnother] = useState(false);

	const defaultValues =
		mode === "edit" && initialValues ? initialValues : { ...itemFormDefaults };

	const form = useForm({
		defaultValues,
		validators: {
			onChange: ({ value }) => {
				const errors: Record<string, string> = {};
				const nameError = validateItemName(value.name);
				if (nameError) errors.name = nameError;
				const descError = validateItemDescription(value.description);
				if (descError) errors.description = descError;
				const urlError = validateItemUrl(value.url);
				if (urlError) errors.url = urlError;

				const effective = getEffectiveItemType(listType, value.itemType);

				if (effective === "stepper") {
					const stepError = validateStep(value.step);
					if (stepError) errors.step = stepError;
					const currentValueError = validateCurrentValue(value.currentValue);
					if (currentValueError) errors.currentValue = currentValueError;
				}
				if (effective === "calculator") {
					const calcError = validateCalculatorValue(value.calculatorValue);
					if (calcError) errors.calculatorValue = calcError;
				}

				return Object.keys(errors).length > 0 ? errors : undefined;
			},
		},
		onSubmit: async ({ value }) => {
			const effective = getEffectiveItemType(listType, value.itemType);
			const tagId =
				value.tagId && value.tagId !== "none"
					? (value.tagId as Id<"listTags">)
					: undefined;

			if (mode === "create") {
				const success = await createItem({
					listId,
					name: value.name,
					type: effective,
					description: value.description || undefined,
					url: value.url || undefined,
					tagId,
					step:
						effective === "stepper" && value.step
							? Number(value.step)
							: undefined,
					currentValue:
						effective === "stepper" && value.currentValue
							? Number(value.currentValue)
							: undefined,
					calculatorValue:
						effective === "calculator" && value.calculatorValue
							? Number(value.calculatorValue)
							: undefined,
					status: effective === "kanban" ? value.status : undefined,
				});

				if (success) {
					if (createAnother) {
						form.reset();
					} else {
						onOpenChange(false);
					}
				}
				return;
			}

			if (itemId) {
				const success = await updateItem({
					itemId,
					name: value.name,
					type: effective,
					description: value.description || null,
					url: value.url || null,
					tagId: tagId ?? null,
					step:
						effective === "stepper" && value.step ? Number(value.step) : null,
					currentValue:
						effective === "stepper" && value.currentValue
							? Number(value.currentValue)
							: null,
					calculatorValue:
						effective === "calculator" && value.calculatorValue
							? Number(value.calculatorValue)
							: null,
					status: effective === "kanban" ? value.status : null,
					completed:
						effective === "kanban" ? value.status === "done" : undefined,
				});

				if (success) {
					onOpenChange(false);
				}
			}
		},
	});

	const title = mode === "create" ? "Add Item" : "Edit Item";
	const description =
		mode === "create" ? "Add a new item to your list." : "Update item details.";
	const submitLabel = mode === "create" ? "Add Item" : "Save";

	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			{trigger && <ResponsiveDialogTrigger render={trigger} />}
			<ResponsiveDialogContent>
				<ResponsiveDialogHeader className="shrink-0">
					<ResponsiveDialogTitle>{title}</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						{description}
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>
				<div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
					<form
						id="item-form"
						onSubmit={(e: React.SyntheticEvent<HTMLFormElement>) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<ItemFormFields
							listType={listType}
							listId={listId}
							form={
								form as unknown as {
									Field: (props: {
										name:
											| "name"
											| "description"
											| "url"
											| "tagId"
											| "itemType"
											| "step"
											| "currentValue"
											| "calculatorValue"
											| "status";
										children: (field: unknown) => React.ReactNode;
									}) => React.ReactNode;
									Subscribe: (props: {
										selector: (state: {
											values: { itemType: ItemType };
										}) => ItemType;
										children: (itemType: ItemType) => React.ReactNode;
									}) => React.ReactNode;
								}
							}
						/>
					</form>
				</div>
				<ResponsiveDialogFooter className="shrink-0">
					{mode === "create" && (
						<div className="mr-auto flex items-center gap-2">
							<Checkbox
								id="create-another"
								checked={createAnother}
								onCheckedChange={(checked) =>
									setCreateAnother(checked === true)
								}
								data-testid="create-another-checkbox"
							/>
							<Label
								htmlFor="create-another"
								className="cursor-pointer font-normal text-muted-foreground text-sm"
							>
								Create another
							</Label>
						</div>
					)}
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						data-testid={
							mode === "create" ? "create-item-cancel" : "edit-item-cancel"
						}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						form="item-form"
						disabled={isPending}
						data-testid={
							mode === "create" ? "create-item-submit" : "edit-item-submit"
						}
					>
						{submitLabel}
					</Button>
				</ResponsiveDialogFooter>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
