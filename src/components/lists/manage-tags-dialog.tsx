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
		const tagId = await createTag({ listId, name: trimmed });
		if (tagId) {
			setNewTagName("");
		}
	};

	const handleDeleteTag = async (tagId: Id<"listTags">) => {
		await deleteTag(tagId);
	};

	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			<ResponsiveDialogContent>
				<ResponsiveDialogHeader className="shrink-0">
					<ResponsiveDialogTitle>Manage Tags</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						Tags help organize items in {listName}. All editors can see and use
						tags.
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>

				<div className="no-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto">
					<section>
						<h3 className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
							List
						</h3>
						<div
							className="rounded-lg border border-dashed bg-muted/30 px-4 py-3"
							data-testid="list-card"
						>
							<p className="font-medium text-sm">{listName}</p>
						</div>
					</section>

					<section>
						<h3 className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
							Add Tag
						</h3>
						<form
							onSubmit={handleAddTag}
							className="space-y-2"
							data-testid="add-tag-form"
						>
							<Input
								value={newTagName}
								onChange={(e) => setNewTagName(e.target.value)}
								placeholder="Tag name"
								disabled={isCreating}
								data-testid="add-tag-input"
							/>
							<Button
								type="submit"
								disabled={isCreating || !newTagName.trim()}
								className="w-full"
								data-testid="add-tag-button"
							>
								Add tag
							</Button>
						</form>
					</section>

					<section>
						<h3 className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
							Tags
						</h3>
						{tags.length > 0 ? (
							<ul className="space-y-2" data-testid="tags-list">
								{tags.map((tag) => (
									<li
										key={tag._id}
										className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2"
										data-testid={`tag-${tag._id}`}
									>
										<span>{tag.name}</span>
										<Button
											type="button"
											variant="destructive"
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
							<div
								className="flex items-center justify-center rounded-lg border border-dashed bg-muted/30 px-4 py-6"
								data-testid="tags-empty"
							>
								<p className="text-muted-foreground text-sm">
									No tags yet. Create one above.
								</p>
							</div>
						)}
					</section>
				</div>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
