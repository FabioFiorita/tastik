import type { ReactNode } from "react";
import { TagSelector } from "@/components/lists/tag-selector";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ItemStatus } from "@/lib/types/item-status";
import type { ItemType } from "@/lib/types/item-type";
import type { ListType } from "@/lib/types/list-type";
import { formatListType } from "@/lib/utils/format-list-type";
import { normalizeFormErrors } from "@/lib/utils/normalize-form-errors";
import type { Id } from "../../../convex/_generated/dataModel";

const ITEM_TYPES: ItemType[] = ["simple", "calculator", "stepper", "kanban"];

const STATUS_OPTIONS: { value: ItemStatus; label: string }[] = [
	{ value: "todo", label: "To Do" },
	{ value: "in_progress", label: "In Progress" },
	{ value: "done", label: "Done" },
];

type FieldApi = {
	name: string;
	state: {
		value: string;
		meta: { isTouched: boolean; isValid: boolean; errors: unknown[] };
	};
	handleChange: (value: string) => void;
	handleBlur: () => void;
};

type ItemFormFieldNames =
	| "name"
	| "description"
	| "url"
	| "tagId"
	| "itemType"
	| "step"
	| "currentValue"
	| "calculatorValue"
	| "status";

type ItemFormFieldsProps = {
	listType: ListType;
	listId: Id<"lists">;
	form: {
		Field: (props: {
			name: ItemFormFieldNames;
			children: (field: unknown) => ReactNode;
		}) => ReactNode;
		Subscribe: (props: {
			selector: (state: { values: { itemType: ItemType } }) => ItemType;
			children: (itemType: ItemType) => ReactNode;
		}) => ReactNode;
	};
};

function getEffectiveItemType(
	listType: ListType,
	itemType: ItemType,
): ItemType {
	if (listType === "multi") return itemType;
	if (listType === "simple") return "simple";
	return listType;
}

export function ItemFormFields({
	listType,
	listId,
	form,
}: ItemFormFieldsProps) {
	const showTypePicker = listType === "multi";

	return (
		<FieldGroup>
			<form.Field name="name">
				{(field: unknown) => {
					const f = field as FieldApi;
					const isInvalid = f.state.meta.isTouched && !f.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel htmlFor={f.name}>Name</FieldLabel>
							<Input
								id={f.name}
								name={f.name}
								value={f.state.value}
								onBlur={f.handleBlur}
								onChange={(e) => f.handleChange(e.target.value)}
								placeholder="Item name"
								aria-invalid={isInvalid}
								data-testid="item-name-input"
							/>
							{isInvalid && (
								<FieldError
									errors={normalizeFormErrors(f.state.meta.errors as unknown[])}
								/>
							)}
						</Field>
					);
				}}
			</form.Field>

			<form.Field name="description">
				{(field: unknown) => {
					const f = field as FieldApi;
					const isInvalid = f.state.meta.isTouched && !f.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel htmlFor={f.name}>Description</FieldLabel>
							<Textarea
								id={f.name}
								name={f.name}
								value={f.state.value}
								onBlur={f.handleBlur}
								onChange={(e) => f.handleChange(e.target.value)}
								placeholder="Optional description"
								rows={2}
								data-testid="item-description-input"
							/>
							{isInvalid && (
								<FieldError
									errors={normalizeFormErrors(f.state.meta.errors as unknown[])}
								/>
							)}
						</Field>
					);
				}}
			</form.Field>

			<form.Field name="url">
				{(field: unknown) => {
					const f = field as FieldApi;
					const isInvalid = f.state.meta.isTouched && !f.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel htmlFor={f.name}>URL</FieldLabel>
							<Input
								id={f.name}
								name={f.name}
								value={f.state.value}
								onBlur={f.handleBlur}
								onChange={(e) => f.handleChange(e.target.value)}
								placeholder="https://example.com"
								type="url"
								data-testid="item-url-input"
							/>
							{isInvalid && (
								<FieldError
									errors={normalizeFormErrors(f.state.meta.errors as unknown[])}
								/>
							)}
						</Field>
					);
				}}
			</form.Field>

			<form.Field name="tagId">
				{(field: unknown) => {
					const f = field as FieldApi;
					return (
						<TagSelector
							listId={listId}
							value={f.state.value}
							onChange={f.handleChange}
							id={f.name}
						/>
					);
				}}
			</form.Field>

			{showTypePicker && (
				<form.Field name="itemType">
					{(field: unknown) => {
						const f = field as FieldApi & {
							state: { value: ItemType };
							handleChange: (value: ItemType) => void;
						};
						return (
							<Field>
								<FieldLabel htmlFor={f.name}>Type</FieldLabel>
								<Select
									value={f.state.value}
									onValueChange={(val) =>
										val && f.handleChange(val as ItemType)
									}
								>
									<SelectTrigger id={f.name} data-testid="item-type-select">
										<SelectValue>{formatListType(f.state.value)}</SelectValue>
									</SelectTrigger>
									<SelectContent>
										{ITEM_TYPES.map((type) => (
											<SelectItem key={type} value={type}>
												{formatListType(type)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
						);
					}}
				</form.Field>
			)}

			<form.Subscribe selector={(state) => state.values.itemType}>
				{(itemType: ItemType) => {
					const effectiveItemType = getEffectiveItemType(listType, itemType);
					const showStepperFields = effectiveItemType === "stepper";
					const showCalculatorFields = effectiveItemType === "calculator";
					const showKanbanFields = effectiveItemType === "kanban";

					return (
						<>
							{showStepperFields && (
								<>
									<form.Field name="step">
										{(field: unknown) => {
											const f = field as FieldApi;
											const isInvalid =
												f.state.meta.isTouched && !f.state.meta.isValid;
											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel htmlFor={f.name}>Step</FieldLabel>
													<Input
														id={f.name}
														name={f.name}
														value={f.state.value}
														onBlur={f.handleBlur}
														onChange={(e) => f.handleChange(e.target.value)}
														placeholder="1"
														type="number"
														min={0}
														step="any"
														data-testid="item-step-input"
													/>
													{isInvalid && (
														<FieldError
															errors={normalizeFormErrors(
																f.state.meta.errors as unknown[],
															)}
														/>
													)}
												</Field>
											);
										}}
									</form.Field>

									<form.Field name="currentValue">
										{(field: unknown) => {
											const f = field as FieldApi;
											const isInvalid =
												f.state.meta.isTouched && !f.state.meta.isValid;
											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel htmlFor={f.name}>Value</FieldLabel>
													<Input
														id={f.name}
														name={f.name}
														value={f.state.value}
														onBlur={f.handleBlur}
														onChange={(e) => f.handleChange(e.target.value)}
														placeholder="0"
														type="number"
														step="any"
														data-testid="item-current-value-input"
													/>
													{isInvalid && (
														<FieldError
															errors={normalizeFormErrors(
																f.state.meta.errors as unknown[],
															)}
														/>
													)}
												</Field>
											);
										}}
									</form.Field>
								</>
							)}

							{showCalculatorFields && (
								<form.Field name="calculatorValue">
									{(field: unknown) => {
										const f = field as FieldApi;
										const isInvalid =
											f.state.meta.isTouched && !f.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={f.name}>Value</FieldLabel>
												<Input
													id={f.name}
													name={f.name}
													value={f.state.value}
													onBlur={f.handleBlur}
													onChange={(e) => f.handleChange(e.target.value)}
													placeholder="0"
													type="number"
													step="any"
													data-testid="item-calculator-value-input"
												/>
												{isInvalid && (
													<FieldError
														errors={normalizeFormErrors(
															f.state.meta.errors as unknown[],
														)}
													/>
												)}
											</Field>
										);
									}}
								</form.Field>
							)}

							{showKanbanFields && (
								<form.Field name="status">
									{(field: unknown) => {
										const f = field as FieldApi & {
											state: { value: ItemStatus };
											handleChange: (value: ItemStatus) => void;
										};
										return (
											<Field>
												<FieldLabel htmlFor={f.name}>Status</FieldLabel>
												<Select
													value={f.state.value}
													onValueChange={(val) =>
														val && f.handleChange(val as ItemStatus)
													}
												>
													<SelectTrigger
														id={f.name}
														data-testid="item-status-select"
													>
														<SelectValue>
															{
																STATUS_OPTIONS.find(
																	(option) => option.value === f.state.value,
																)?.label
															}
														</SelectValue>
													</SelectTrigger>
													<SelectContent>
														{STATUS_OPTIONS.map((option) => (
															<SelectItem
																key={option.value}
																value={option.value}
															>
																{option.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</Field>
										);
									}}
								</form.Field>
							)}
						</>
					);
				}}
			</form.Subscribe>
		</FieldGroup>
	);
}
