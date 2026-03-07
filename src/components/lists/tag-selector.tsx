import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCreateTag } from "@/hooks/actions/use-create-tag";
import { useListTags } from "@/hooks/queries/use-list-tags";
import type { Id } from "../../../convex/_generated/dataModel";

const CREATE_SENTINEL = "__create__";

type TagSelectorProps = {
	listId: Id<"lists">;
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	id?: string;
};

export function TagSelector({
	listId,
	value,
	onChange,
	disabled,
	id,
}: TagSelectorProps) {
	const tags = useListTags(listId);
	const { createTag, isPending } = useCreateTag();
	const [isCreating, setIsCreating] = useState(false);
	const [newTagName, setNewTagName] = useState("");
	const [error, setError] = useState<string | null>(null);

	const handleValueChange = (val: string | null) => {
		if (val == null) return;
		if (val === CREATE_SENTINEL) {
			setIsCreating(true);
			setError(null);
			return;
		}
		onChange(val);
	};

	const handleCreate = async () => {
		const trimmed = newTagName.trim();
		if (!trimmed) {
			setError("Tag name cannot be empty");
			return;
		}
		setError(null);
		const tagId = await createTag({ listId, name: trimmed });
		if (tagId) {
			onChange(tagId);
			setNewTagName("");
			setIsCreating(false);
		}
	};

	const handleCancel = () => {
		setIsCreating(false);
		setNewTagName("");
		setError(null);
	};

	return (
		<Field>
			<FieldLabel htmlFor={id}>Tag</FieldLabel>
			<Select
				value={value}
				onValueChange={handleValueChange}
				disabled={disabled}
			>
				<SelectTrigger id={id} data-testid="item-tag-select">
					<SelectValue placeholder="No tag">
						{value && value !== "none"
							? tags.find((t) => t._id === value)?.name
							: "No tag"}
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="none">No tag</SelectItem>
					{tags.map((tag) => (
						<SelectItem key={tag._id} value={tag._id}>
							{tag.name}
						</SelectItem>
					))}
					<SelectItem value={CREATE_SENTINEL}>+ Create tag</SelectItem>
				</SelectContent>
			</Select>
			{isCreating && (
				<div className="flex flex-col gap-2">
					<Input
						value={newTagName}
						onChange={(e) => {
							setNewTagName(e.target.value);
							if (error) setError(null);
						}}
						placeholder="Tag name"
						autoFocus
						disabled={isPending}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								handleCreate();
							}
							if (e.key === "Escape") {
								handleCancel();
							}
						}}
						data-testid="create-tag-input"
					/>
					{error && <FieldError errors={[{ message: error }]} />}
					<div className="flex gap-2">
						<Button
							size="sm"
							onClick={handleCreate}
							disabled={isPending || !newTagName.trim()}
							data-testid="create-tag-confirm"
						>
							Create
						</Button>
						<Button
							size="sm"
							variant="outline"
							onClick={handleCancel}
							disabled={isPending}
							data-testid="create-tag-cancel"
						>
							Cancel
						</Button>
					</div>
				</div>
			)}
		</Field>
	);
}
