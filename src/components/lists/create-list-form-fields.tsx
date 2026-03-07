import type { ReactNode } from "react";
import { ListIconPicker } from "@/components/lists/list-icon-picker";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { listTypeDescriptions } from "@/lib/constants/list-types";
import type { ListType } from "@/lib/types/list-type";
import { formatListType } from "@/lib/utils/format-list-type";
import { normalizeFormErrors } from "@/lib/utils/normalize-form-errors";

const LIST_TYPES: ListType[] = [
	"simple",
	"calculator",
	"stepper",
	"kanban",
	"multi",
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

export function CreateListFormFields({
	form,
}: {
	form: {
		Field: (props: {
			name: "name" | "type" | "icon";
			children: (field: unknown) => ReactNode;
		}) => ReactNode;
	};
}) {
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
								placeholder="My awesome list"
								aria-invalid={isInvalid}
								data-testid="create-list-name-input"
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

			<form.Field name="type">
				{(field: unknown) => {
					const f = field as FieldApi & {
						state: { value: ListType };
						handleChange: (value: ListType) => void;
					};
					const isInvalid = f.state.meta.isTouched && !f.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel htmlFor={f.name}>Type</FieldLabel>
							<Select
								value={f.state.value}
								onValueChange={(val) => val && f.handleChange(val as ListType)}
							>
								<SelectTrigger
									id={f.name}
									aria-invalid={isInvalid}
									data-testid="create-list-type-select"
								>
									<SelectValue>{formatListType(f.state.value)}</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{LIST_TYPES.map((type) => (
										<SelectItem key={type} value={type}>
											{formatListType(type)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FieldDescription>
								{listTypeDescriptions[f.state.value]}
							</FieldDescription>
							{isInvalid && (
								<FieldError
									errors={normalizeFormErrors(f.state.meta.errors as unknown[])}
								/>
							)}
						</Field>
					);
				}}
			</form.Field>

			<form.Field name="icon">
				{(field: unknown) => {
					const f = field as FieldApi;
					const isInvalid = f.state.meta.isTouched && !f.state.meta.isValid;
					return (
						<FieldSet>
							<FieldLegend variant="label">Icon</FieldLegend>
							<ListIconPicker value={f.state.value} onChange={f.handleChange} />
							{isInvalid && (
								<FieldError
									errors={normalizeFormErrors(f.state.meta.errors as unknown[])}
								/>
							)}
						</FieldSet>
					);
				}}
			</form.Field>
		</FieldGroup>
	);
}
