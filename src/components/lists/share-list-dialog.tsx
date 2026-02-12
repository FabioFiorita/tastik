import { useState } from "react";
import {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from "@/components/common/responsive-dialog";
import { EditorCard } from "@/components/lists/editor-card";
import { ShareListOwnerCard } from "@/components/lists/share-list-owner-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddListEditor } from "@/hooks/actions/use-add-list-editor";
import { useCurrentUser } from "@/hooks/queries/use-current-user";
import { useListEditors } from "@/hooks/queries/use-list-editors";
import type { Id } from "../../../convex/_generated/dataModel";

interface ShareListDialogProps {
	listId: Id<"lists">;
	listName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ShareListDialog({
	listId,
	listName,
	open,
	onOpenChange,
}: ShareListDialogProps) {
	const currentUser = useCurrentUser();
	const { editors } = useListEditors(listId);
	const { addEditor, isPending } = useAddListEditor();
	const [email, setEmail] = useState("");
	const [nickname, setNickname] = useState("");

	const handleAddEditor = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		const trimmedEmail = email.trim();
		if (!trimmedEmail) return;
		const trimmedNickname = nickname.trim();
		const success = await addEditor({
			listId,
			email: trimmedEmail,
			nickname: trimmedNickname || undefined,
		});
		if (success) {
			setEmail("");
			setNickname("");
		}
	};

	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			<ResponsiveDialogContent>
				<ResponsiveDialogHeader>
					<ResponsiveDialogTitle>Share {listName}</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						Editors can add, update, and delete items, manage tags, and reorder
						items in this list.
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>

				<ul className="space-y-2" data-testid="editors-list">
					{currentUser && (
						<ShareListOwnerCard
							owner={{
								email: currentUser.email,
								name: currentUser.name,
							}}
						/>
					)}
					{editors.map((editor) => (
						<EditorCard key={editor._id} editor={editor} />
					))}
				</ul>

				{editors.length === 0 && (
					<p
						className="text-muted-foreground text-sm"
						data-testid="editors-empty"
					>
						No editors yet. Add one below.
					</p>
				)}

				<form
					onSubmit={handleAddEditor}
					className="mt-4 space-y-2"
					data-testid="add-editor-form"
				>
					<Input
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Email address"
						type="email"
						disabled={isPending}
						data-testid="add-editor-email-input"
					/>
					<Input
						value={nickname}
						onChange={(e) => setNickname(e.target.value)}
						placeholder="Nickname (optional)"
						disabled={isPending}
						data-testid="add-editor-nickname-input"
					/>
					<Button
						type="submit"
						disabled={isPending || !email.trim()}
						className="w-full"
						data-testid="add-editor-button"
					>
						Add Editor
					</Button>
					<p className="text-muted-foreground text-xs">
						Ask the person for their Tastik account email to add them as an
						editor.
					</p>
				</form>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
