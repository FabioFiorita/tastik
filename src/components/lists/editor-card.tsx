import { Check, MoreVertical, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useRemoveListEditor } from "@/hooks/actions/use-remove-list-editor";
import { useUpdateEditorNickname } from "@/hooks/actions/use-update-editor-nickname";
import type { EditorInfo } from "@/lib/types/editor-info";
import { cn } from "@/lib/utils/cn";

interface EditorCardProps {
	editor: EditorInfo;
}

export function EditorCard({ editor }: EditorCardProps) {
	const { removeEditor } = useRemoveListEditor();
	const { updateNickname, isPending: isUpdating } = useUpdateEditorNickname();
	const [isEditing, setIsEditing] = useState(false);
	const [nicknameValue, setNicknameValue] = useState(editor.nickname ?? "");
	const [showRemoveDialog, setShowRemoveDialog] = useState(false);

	const displayName = editor.nickname ?? editor.user?.email ?? "Unknown";
	const emailLine = editor.user?.email;

	const handleSaveNickname = async () => {
		const trimmed = nicknameValue.trim();
		const success = await updateNickname({
			editorId: editor._id,
			nickname: trimmed || null,
		});
		if (success) {
			setIsEditing(false);
		}
	};

	const handleCancelEdit = () => {
		setNicknameValue(editor.nickname ?? "");
		setIsEditing(false);
	};

	return (
		<>
			<li
				className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2"
				data-testid={`editor-card-${editor._id}`}
			>
				{isEditing ? (
					<div className="flex min-w-0 flex-1 items-center gap-1">
						<Input
							value={nicknameValue}
							onChange={(e) => setNicknameValue(e.target.value)}
							placeholder="Nickname"
							className="h-7 flex-1 text-sm"
							disabled={isUpdating}
							autoFocus
							data-testid="edit-nickname-input"
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="size-7"
							onClick={handleSaveNickname}
							disabled={isUpdating}
							aria-label="Save nickname"
							data-testid="save-nickname-button"
						>
							<Check className="size-4" />
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="size-7"
							onClick={handleCancelEdit}
							disabled={isUpdating}
							aria-label="Cancel editing"
							data-testid="cancel-nickname-button"
						>
							<X className="size-4" />
						</Button>
					</div>
				) : (
					<div className="min-w-0 flex-1">
						<p className="truncate font-medium text-sm">{displayName}</p>
						{editor.nickname && emailLine && (
							<p className="truncate text-muted-foreground text-xs">
								{emailLine}
							</p>
						)}
					</div>
				)}

				{!isEditing && (
					<div className="flex items-center gap-2">
						<Badge variant="outline">Editor</Badge>
						<DropdownMenu>
							<DropdownMenuTrigger
								className={cn(
									buttonVariants({ variant: "ghost", size: "icon" }),
									"size-7",
								)}
								aria-label="Editor actions"
								data-testid={`editor-actions-${editor._id}`}
							>
								<MoreVertical className="size-4" />
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									onClick={() => setIsEditing(true)}
									data-testid="edit-nickname-option"
								>
									<Pencil className="mr-2 size-4" />
									Edit Nickname
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setShowRemoveDialog(true)}
									className="text-destructive"
									data-testid="remove-editor-option"
								>
									<Trash2 className="mr-2 size-4" />
									Remove
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				)}
			</li>

			<ConfirmDialog
				open={showRemoveDialog}
				onOpenChange={setShowRemoveDialog}
				title="Remove editor?"
				description={`${displayName} will lose access to this list.`}
				confirmLabel="Remove"
				onConfirm={() => removeEditor({ editorId: editor._id })}
				variant="destructive"
				testId="remove-editor-confirm"
			/>
		</>
	);
}
