import { Trash2 } from "lucide-react";
import { useState } from "react";
import {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from "@/components/common/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateTag } from "@/hooks/actions/use-create-tag";
import { useDeleteTag } from "@/hooks/actions/use-delete-tag";
import { useListTags } from "@/hooks/queries/use-list-tags";
import type { Id } from "../../../convex/_generated/dataModel";

interface ManageTagsDialogProps {
	listId: Id<"lists">;
	listName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ManageTagsDialog({
	listId,
	listName,
	open,
	onOpenChange,
}: ManageTagsDialogProps) {
	const tags = useListTags(listId);
	const { createTag, isPending: isCreating } = useCreateTag();
	const { deleteTag, isPending: isDeleting } = useDeleteTag();
	const [newTagName, setNewTagName] = useState("");

	const handleAddTag = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		const trimmed = newTagName.trim();
		if (!trimmed) return;
		const success = await createTag({ listId, name: trimmed });
		if (success) {
			setNewTagName("");
		}
	};

	const handleDeleteTag = async (tagId: Id<"listTags">) => {
		await deleteTag(tagId);
	};

	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			<ResponsiveDialogContent>
				<ResponsiveDialogHeader>
					<ResponsiveDialogTitle>Manage Tags</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						Tags help organize items in {listName}. All editors can see and use
						tags.
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>
				<form
					onSubmit={handleAddTag}
					className="flex gap-2"
					data-testid="add-tag-form"
				>
					<Input
						value={newTagName}
						onChange={(e) => setNewTagName(e.target.value)}
						placeholder="Tag name"
						disabled={isCreating}
						className="flex-1"
						data-testid="add-tag-input"
					/>
					<Button
						type="submit"
						disabled={isCreating || !newTagName.trim()}
						data-testid="add-tag-button"
					>
						Add tag
					</Button>
				</form>
				{tags.length > 0 ? (
					<ul className="mt-4 space-y-2" data-testid="tags-list">
						{tags.map((tag) => (
							<li
								key={tag._id}
								className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2"
								data-testid={`tag-${tag._id}`}
							>
								<span>{tag.name}</span>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => handleDeleteTag(tag._id)}
									disabled={isDeleting}
									aria-label={`Remove ${tag.name}`}
									data-testid={`delete-tag-${tag._id}`}
								>
									<Trash2 className="size-4" />
								</Button>
							</li>
						))}
					</ul>
				) : (
					<p
						className="mt-4 text-muted-foreground text-sm"
						data-testid="tags-empty"
					>
						No tags yet. Add one above.
					</p>
				)}
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
